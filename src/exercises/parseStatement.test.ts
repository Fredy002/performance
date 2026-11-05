import { describe, expect, it } from 'vitest';
import { analyzeParsedStatement, analyzeStatement, normalizeStatement, parseStatement, type ParsedStatement } from './parseStatement';
import { FUEL_EXERCISES } from './registry';

const DEFAULTS = { holdingFlightLevel: 15, holdingMinutes: 45 };

describe('vuelo internacional con la ciudad entre paréntesis', () => {
  it('lee «SEGU(Guayaquil) - SPJC» sin confundir la ciudad con el viento', () => {
    const p = parseStatement(`Origen - destino: SEGU(Guayaquil) - SPJC distancia 730 nm F350 (40 HW)
Destino - alterno: SPJC - SPSO distancia 120 nm F190 (25tw)
Holding con 73000 lbs
Combustible para el taxi: 400 lbs`);
    expect(p.trip).toEqual({ from: 'SEGU', to: 'SPJC', distanceNm: 730, flightLevel: 350, windKt: 40, windKind: 'HW' });
    expect(p.alternate).toEqual({ from: 'SPJC', to: 'SPSO', distanceNm: 120, flightLevel: 190, windKt: 25, windKind: 'TW' });
    expect(p.holding.weightLb).toBe(73000);
  });

  it('también con la ciudad en el destino y el viento entre paréntesis anidados', () => {
    const p = parseStatement('Origen – destino: SPJC – SEGU (Guayaquil), 730 NM (40 KT DE CARA (HW)). Destino – alterno: SEGU (Guayaquil) – SEQM, 120 NM (25 KT DE COLA (TW))');
    expect(p.trip).toMatchObject({ from: 'SPJC', to: 'SEGU', windKt: 40, windKind: 'HW' });
    expect(p.alternate).toMatchObject({ from: 'SEGU', to: 'SEQM', windKt: 25, windKind: 'TW' });
  });
});

describe('normalización (errores típicos de OCR)', () => {
  it('corrige B737, lbs y dígitos confundidos', () => {
    expect(normalizeStatement('Un 8737 con 97 000 Ibs')).toBe('UN B737 CON 97 000 LBS');
    expect(normalizeStatement('taxi: 4O0 lb')).toBe('TAXI: 400 LBS');
    expect(normalizeStatement('Destino – alterno')).toBe('DESTINO - ALTERNO');
  });
});

describe('enunciado escrito como en el cuaderno', () => {
  const text = `Un B737 tiene programado realizar una operación:
Origen - destino: SPUR - SPJC distancia 750 nm F350 (50 TW)
Destino - alterno: SPJC - SPSO distancia 145 nm F190 (30 HW)
Holding con 92500 lbs (peso de aeronave)
Combustible para el taxi: 400 lbs
Determinar: a) T.T b) T.F c) FOB d) Autonomía`;

  it('extrae todos los datos', () => {
    expect(parseStatement(text)).toEqual({
      aircraft: 'B737',
      trip: { from: 'SPUR', to: 'SPJC', distanceNm: 750, flightLevel: 350, windKt: 50, windKind: 'TW' },
      alternate: { from: 'SPJC', to: 'SPSO', distanceNm: 145, flightLevel: 190, windKt: 30, windKind: 'HW' },
      holding: { weightLb: 92500 },
      taxiFuelLb: 400,
    });
  });

  it('asume nivel y tiempo de espera y queda completo', () => {
    const r = analyzeStatement(text, DEFAULTS);
    expect(r.complete).toBe(true);
    expect(r.airports).toEqual({ origin: 'SPUR', destination: 'SPJC', alternate: 'SPSO' });
    expect(r.fields.find((f) => f.key === 'hfl')).toMatchObject({ status: 'assumed', value: 'FL 015' });
    expect(r.fields.find((f) => f.key === 'hm')).toMatchObject({ status: 'assumed', value: '45 min' });
    expect(r.warnings).toEqual([]);
  });
});

describe('texto real devuelto por el OCR de una captura impresa', () => {
  // salida literal de Tesseract.js sobre una captura (incluye «8737», «Ibs» y «bs»)
  const ocr = `Ejercicio 3

Un 8737 tiene programado realizar una operación:

Origen - destino: SPHI - SPJC distancia 380 nm FL350 (40 TW)
Destino - alterno: SPJC - SPSO distancia 145 nm F190 (25 HW)
Holding con 97 000 Ibs

Combustible para el taxi: 350 bs

Determinar: a) T.T b) T.F c) FOB d) Autonomía`;

  it('extrae los datos a pesar de los errores de reconocimiento', () => {
    const p = parseStatement(ocr);
    expect(p.aircraft).toBe('B737');
    expect(p.trip).toEqual({ from: 'SPHI', to: 'SPJC', distanceNm: 380, flightLevel: 350, windKt: 40, windKind: 'TW' });
    expect(p.alternate).toEqual({ from: 'SPJC', to: 'SPSO', distanceNm: 145, flightLevel: 190, windKt: 25, windKind: 'HW' });
    expect(p.holding.weightLb).toBe(97000);
    expect(p.taxiFuelLb).toBe(350);
    expect(analyzeStatement(ocr, DEFAULTS).complete).toBe(true);
  });
});

describe('variantes de redacción', () => {
  it('viento en palabras, peso con separador y espera indicada', () => {
    const p = parseStatement(`Origen – destino: SPZO – SPJC, 330 NM, FL 330, viento de frente 20 kt.
Destino – alterno: SPJC – SPSO, 145 NM, FL 190, 15 kt de cola.
Espera de 30 min a 1500 ft con 92,500 lb. Rodaje: 300 lb.`);
    expect(p.trip).toMatchObject({ distanceNm: 330, flightLevel: 330, windKt: 20, windKind: 'HW' });
    expect(p.alternate).toMatchObject({ distanceNm: 145, windKt: 15, windKind: 'TW' });
    expect(p.holding).toEqual({ weightLb: 92500, flightLevel: 15, minutes: 30 });
    expect(p.taxiFuelLb).toBe(300);
  });

  it('sin la palabra «Origen» toma el primer tramo del comienzo', () => {
    const p = parseStatement('SPJC - SPQT 622 NM (55 TW)\nDestino - alterno: SPQT - SPST 270 NM (30 HW)\nHolding 85000 lbs\nTaxi 400 lbs');
    expect(p.trip).toMatchObject({ from: 'SPJC', to: 'SPQT', distanceNm: 622, windKt: 55, windKind: 'TW' });
  });

  it('informa de lo que falta y avisa de incoherencias', () => {
    const r = analyzeStatement('Origen - destino: SPJC - SPQT 622 NM (55 TW)\nDestino - alterno: SPST - SPCL 270 NM\nUn B727', DEFAULTS);
    expect(r.complete).toBe(false);
    expect(r.fields.filter((f) => f.status === 'missing' && f.required).map((f) => f.key)).toEqual(['aw', 'hw', 'taxi']);
    expect(r.warnings.join(' ')).toMatch(/B727/);
    expect(r.warnings.join(' ')).toMatch(/SPQT\) no coincide con el origen del tramo al alterno \(SPST\)/);
  });
});

describe('enunciados de los ejercicios registrados', () => {
  it('se leen y reproducen exactamente los datos del ejercicio', () => {
    for (const e of FUEL_EXERCISES) {
      const r = analyzeStatement(e.statement.join('\n'), DEFAULTS);
      expect(r.complete).toBe(true);
      expect(r.airports).toEqual(e.airports);
      expect(r.parsed.trip).toMatchObject({ distanceNm: e.input.trip.distanceNm, windKt: e.input.trip.windKt, windKind: e.input.trip.windKind, flightLevel: e.input.trip.flightLevel });
      expect(r.parsed.alternate).toMatchObject({ distanceNm: e.input.alternate.distanceNm, windKt: e.input.alternate.windKt, windKind: e.input.alternate.windKind, flightLevel: e.input.alternate.flightLevel });
      expect(r.parsed.holding.weightLb).toBe(e.input.holding.weightLb);
      expect(r.parsed.taxiFuelLb).toBe(e.input.taxiFuelLb);
    }
  });
});


describe('datos estructurados leídos por Claude', () => {
  const parsed = (): ParsedStatement => ({
    aircraft: 'B737',
    trip: { from: 'SPUR', to: 'SPJC', distanceNm: 750, windKt: 50, windKind: 'TW' },
    alternate: { from: 'SPJC', to: 'SPSO', distanceNm: 145, windKt: 30, windKind: 'HW' },
    holding: { weightLb: 92500 },
    taxiFuelLb: 400,
  });

  it('construye el informe directamente y conserva los supuestos separados de lo leído', () => {
    const data = parsed();
    const report = analyzeParsedStatement(data, DEFAULTS);
    expect(report.complete).toBe(true);
    expect(report.parsed).toEqual(data);
    expect(report.airports).toEqual({ origin: 'SPUR', destination: 'SPJC', alternate: 'SPSO' });
    expect(report.fields.find((field) => field.key === 'hfl')).toMatchObject({ status: 'assumed', value: 'FL 015' });
    expect(report.fields.find((field) => field.key === 'hm')).toMatchObject({ status: 'assumed', value: '45 min' });
    expect(data.holding).toEqual({ weightLb: 92500 });
  });

  it('no inventa datos ausentes y conserva la advertencia de lectura', () => {
    const data = parsed();
    delete data.taxiFuelLb;
    delete data.alternate.windKind;
    const report = analyzeParsedStatement(data, DEFAULTS, ['No se distingue el combustible de taxi.']);
    expect(report.complete).toBe(false);
    expect(report.fields.filter((field) => field.required && field.status === 'missing').map((field) => field.key)).toEqual(['aw', 'taxi']);
    expect(report.warnings).toContain('No se distingue el combustible de taxi.');
  });

  it('un viento cero y un taxi cero leídos explícitamente no cuentan como ausentes', () => {
    const data = parsed();
    data.trip.windKt = 0;
    data.taxiFuelLb = 0;
    const report = analyzeParsedStatement(data, DEFAULTS);
    expect(report.complete).toBe(true);
    expect(report.fields.find((field) => field.key === 'tw')).toMatchObject({ status: 'found', value: '0 kt TW' });
    expect(report.fields.find((field) => field.key === 'taxi')).toMatchObject({ status: 'found', value: '0 lb' });
  });

  it('mantiene la validación de aeronave y ruta para datos de una imagen', () => {
    const data = parsed();
    data.aircraft = 'B727';
    data.alternate.from = 'SPQT';
    const report = analyzeParsedStatement(data, DEFAULTS);
    expect(report.warnings.join(' ')).toContain('B727');
    expect(report.warnings.join(' ')).toContain('no coincide con el origen del tramo al alterno');
  });
});
