import { describe, expect, it } from 'vitest';
import { analyzeStatement, normalizeStatement, parseStatement } from './parseStatement';
import { EXERCISES } from './registry';

const DEFAULTS = { holdingFlightLevel: 15, holdingMinutes: 45 };

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
    for (const e of EXERCISES) {
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
