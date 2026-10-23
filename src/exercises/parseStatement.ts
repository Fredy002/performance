/**
 * Lectura de un enunciado de planificación de combustible a partir de texto libre
 * (escrito, pegado o reconocido por OCR desde una captura).
 *
 * Formato típico:
 *   Origen - destino: SPUR - SPJC distancia 750 nm F350 (50 TW)
 *   Destino - alterno: SPJC - SPSO distancia 145 nm F190 (30 HW)
 *   Holding con 92 500 lbs
 *   Combustible para el taxi: 400 lbs
 *
 * Es tolerante a errores típicos de OCR («8737» por B737, «Ibs» por lbs, «4O0» por 400).
 */
import type { RouteAirports } from '@/data/airports';
import type { WindKind } from '@/data/tables/types';

export interface ParsedLeg {
  from?: string;
  to?: string;
  distanceNm?: number;
  windKt?: number;
  windKind?: WindKind;
  flightLevel?: number;
}

export interface ParsedStatement {
  aircraft?: string;
  trip: ParsedLeg;
  alternate: ParsedLeg;
  holding: { weightLb?: number; flightLevel?: number; minutes?: number };
  taxiFuelLb?: number;
}

export interface ParseDefaults {
  /** Nivel de espera si el enunciado no lo indica (FL 015 en los ejercicios del curso) */
  holdingFlightLevel: number;
  /** Tiempo de espera si no se indica (45 min en vuelos nacionales, según la RAP) */
  holdingMinutes: number;
}

export interface ParseField {
  key: string;
  label: string;
  value?: string;
  status: 'found' | 'assumed' | 'missing';
  required: boolean;
}

export interface ParseReport {
  parsed: ParsedStatement;
  airports: RouteAirports;
  fields: ParseField[];
  /** Faltan datos imprescindibles para resolver */
  complete: boolean;
  warnings: string[];
}

/* ---------- normalización ---------- */

export function normalizeStatement(text: string): string {
  let t = text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[–—−‒]/g, '-')
    .replace(/[“”«»]/g, '"');
  // errores típicos de OCR
  t = t.replace(/\b[1I]BS\b|\bL8S\b|\bLBS?\b|\bLIBRAS\b|(?<=\d\s?)BS\b/g, 'LBS');
  t = t.replace(/\b8(7\d7)\b/g, 'B$1');
  // dígitos confundidos con letras dentro de números («4O0» → 400, «l5» → 15)
  t = t.replace(/\b[\dOIL]*\d[\dOIL]*\b/g, (tok) => tok.replace(/O/g, '0').replace(/[IL]/g, '1'));
  return t;
}

/** Corrige un código OACI leído por OCR (dígitos que parecen letras) y lo valida. */
function icao(raw: string): string | undefined {
  const c = raw.replace(/0/g, 'O').replace(/1/g, 'I').replace(/5/g, 'S').replace(/8/g, 'B');
  return /^[A-Z]{4}$/.test(c) ? c : undefined;
}

/** «92 500», «92.500», «92,500» → 92500; «145», «622,5» → 145 / 622.5 */
function num(raw: string): number {
  const s = raw.trim();
  if (/^\d{1,3}([ .,]\d{3})+$/.test(s)) return Number(s.replace(/[ .,]/g, ''));
  return Number(s.replace(',', '.'));
}

/* ---------- segmentos ---------- */

type SegmentName = 'trip' | 'alternate' | 'holding' | 'taxi' | 'questions';

const MARKERS: [SegmentName, RegExp][] = [
  ['alternate', /DESTINO\s*-\s*ALTERN|ALTERN[OA]\s*:/],
  ['trip', /ORIGEN/],
  ['holding', /HOLDING|ESPERA/],
  ['taxi', /TAXI|RODAJE/],
  ['questions', /DETERMIN|CALCUL|SE PIDE|HALLAR|\bA\)\s*T\.?\s*T/],
];

function segments(t: string): Partial<Record<SegmentName, string>> {
  const found: { name: SegmentName; at: number }[] = [];
  for (const [name, re] of MARKERS) {
    const m = re.exec(t);
    if (m && !found.some((f) => f.name === name)) found.push({ name, at: m.index });
  }
  // «Origen - destino» contiene «DESTINO»: el alterno solo cuenta si va después del origen
  found.sort((a, b) => a.at - b.at);
  const out: Partial<Record<SegmentName, string>> = {};
  // sin «Origen»: el primer tramo es lo que haya antes del primer marcador
  if (!found.some((f) => f.name === 'trip')) out.trip = t.slice(0, found[0]?.at);
  found.forEach((f, i) => {
    out[f.name] = t.slice(f.at, i + 1 < found.length ? found[i + 1].at : undefined);
  });
  return out;
}

/* ---------- campos ---------- */

function parseLeg(seg: string | undefined): ParsedLeg {
  if (!seg) return {};
  const leg: ParsedLeg = {};
  const pair = /\b([A-Z][A-Z0-9]{3})\s*-\s*([A-Z][A-Z0-9]{3})\b/.exec(seg);
  if (pair) {
    leg.from = icao(pair[1]);
    leg.to = icao(pair[2]);
  }
  const dist =
    /(\d+(?:[.,]\d+)?)\s*(?:NMI|NM|N\.\s*M\.?|MN|MILLAS)/.exec(seg) ?? /DISTANCIA\s*(?:DE\s*)?:?\s*(\d+(?:[.,]\d+)?)/.exec(seg);
  if (dist) leg.distanceNm = num(dist[1]);
  const fl = /\bF\s*\.?\s*L?\s*\.?\s*(\d{2,3})\b/.exec(seg);
  if (fl) leg.flightLevel = Number(fl[1]);

  const kindOf = (s: string): WindKind => (/^T|COLA/.test(s) ? 'TW' : 'HW');
  const w1 = /(\d{1,3})\s*(?:KTS?|KNOTS?|NUDOS)?\s*(T\s*\/?\s*W|H\s*\/?\s*W)\b/.exec(seg);
  const w2 = /\b(T\s*\/?\s*W|H\s*\/?\s*W)\s*(\d{1,3})\b/.exec(seg);
  const w3 = /(?:VIENTO\s*)?DE\s*(COLA|CARA|FRENTE)\s*(?:DE\s*)?(\d{1,3})/.exec(seg);
  const w4 = /(\d{1,3})\s*(?:KTS?|NUDOS)\s*DE\s*(COLA|CARA|FRENTE)/.exec(seg);
  if (w1) [leg.windKt, leg.windKind] = [Number(w1[1]), kindOf(w1[2])];
  else if (w2) [leg.windKt, leg.windKind] = [Number(w2[2]), kindOf(w2[1])];
  else if (w4) [leg.windKt, leg.windKind] = [Number(w4[1]), kindOf(w4[2])];
  else if (w3) [leg.windKt, leg.windKind] = [Number(w3[2]), kindOf(w3[1])];
  return leg;
}

function parseHolding(seg: string | undefined): ParsedStatement['holding'] {
  if (!seg) return {};
  const h: ParsedStatement['holding'] = {};
  const w = /(\d{2,3}(?:[ .,]\d{3})?|\d{4,6})\s*LBS/.exec(seg) ?? /(?:CON|PESO\D{0,20})\s*(\d{2,3}[ .,]?\d{3})/.exec(seg);
  if (w) h.weightLb = num(w[1]);
  const fl = /\bF\s*\.?\s*L?\s*\.?\s*(\d{2,3})\b/.exec(seg);
  const ft = /(\d{3,5}|\d{1,2}[ .,]\d{3})\s*(?:FT|PIES)\b/.exec(seg);
  if (fl) h.flightLevel = Number(fl[1]);
  else if (ft) h.flightLevel = Math.round(num(ft[1]) / 100);
  const min = /(\d{1,3})\s*(?:MIN|MINUTOS)\b/.exec(seg);
  if (min) h.minutes = Number(min[1]);
  return h;
}

function parseTaxi(seg: string | undefined): number | undefined {
  if (!seg) return undefined;
  const m = /TAXI\D{0,12}(\d{1,2}[ .,]\d{3}|\d+)/.exec(seg) ?? /RODAJE\D{0,12}(\d{1,2}[ .,]\d{3}|\d+)/.exec(seg);
  return m ? num(m[1]) : undefined;
}

export function parseStatement(text: string): ParsedStatement {
  const t = normalizeStatement(text);
  const seg = segments(t);
  const aircraft = /\b(?:B|BOEING)\s*-?\s*(7\d7)\b/.exec(t);
  return {
    aircraft: aircraft ? `B${aircraft[1]}` : undefined,
    trip: parseLeg(seg.trip),
    alternate: parseLeg(seg.alternate),
    holding: parseHolding(seg.holding),
    taxiFuelLb: parseTaxi(seg.taxi),
  };
}

/* ---------- informe para la interfaz ---------- */

const fmtFl = (fl: number) => `FL ${String(fl).padStart(3, '0')}`;

export function analyzeStatement(text: string, defaults: ParseDefaults): ParseReport {
  const p = parseStatement(text);
  const warnings: string[] = [];
  const fields: ParseField[] = [];
  const add = (key: string, label: string, required: boolean, value: string | undefined, assumed?: string) =>
    fields.push({
      key,
      label,
      required,
      value: value ?? assumed,
      status: value !== undefined ? 'found' : assumed !== undefined ? 'assumed' : 'missing',
    });
  const wind = (l: ParsedLeg) => (l.windKt !== undefined && l.windKind ? `${l.windKt} kt ${l.windKind}` : undefined);
  const d = (v?: number, unit = '') => (v === undefined ? undefined : `${String(v).replace('.', ',')}${unit}`);

  add('route', 'Ruta', false, p.trip.from || p.trip.to || p.alternate.to ? [p.trip.from, p.trip.to ?? p.alternate.from, p.alternate.to].map((c) => c ?? '····').join(' → ') : undefined);
  add('td', 'Distancia origen – destino', true, d(p.trip.distanceNm, ' NM'));
  add('tw', 'Viento origen – destino', true, wind(p.trip));
  add('tfl', 'Nivel origen – destino', false, p.trip.flightLevel !== undefined ? fmtFl(p.trip.flightLevel) : undefined);
  add('ad', 'Distancia destino – alterno', true, d(p.alternate.distanceNm, ' NM'));
  add('aw', 'Viento destino – alterno', true, wind(p.alternate));
  add('afl', 'Nivel destino – alterno', false, p.alternate.flightLevel !== undefined ? fmtFl(p.alternate.flightLevel) : undefined);
  add('hw', 'Peso en espera', true, d(p.holding.weightLb, ' lb'));
  add('hfl', 'Nivel de espera', true, p.holding.flightLevel !== undefined ? fmtFl(p.holding.flightLevel) : undefined, fmtFl(defaults.holdingFlightLevel));
  add('hm', 'Tiempo de espera', true, d(p.holding.minutes, ' min'), `${defaults.holdingMinutes} min`);
  add('taxi', 'Combustible de taxi', true, d(p.taxiFuelLb, ' lb'));

  if (p.aircraft && p.aircraft !== 'B737') {
    warnings.push(`El enunciado es de un ${p.aircraft}: la tabla de espera disponible es la del B737.`);
  }
  if (p.trip.to && p.alternate.from && p.trip.to !== p.alternate.from) {
    warnings.push(`El destino del primer tramo (${p.trip.to}) no coincide con el origen del tramo al alterno (${p.alternate.from}).`);
  }

  return {
    parsed: p,
    airports: { origin: p.trip.from ?? '', destination: p.trip.to ?? p.alternate.from ?? '', alternate: p.alternate.to ?? '' },
    fields,
    complete: fields.every((f) => !f.required || f.status !== 'missing'),
    warnings,
  };
}
