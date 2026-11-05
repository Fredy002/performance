import { describe, expect, it } from 'vitest';
import { solveFuelPlan } from '@/core/fuelPlanning';
import { getTable } from '@/data/tables';
import { compareWithWritten, parseWritten } from './validation';
import { FUEL_EXERCISES, getFuelExercise } from './registry';

describe('validación contra la resolución manual', () => {
  it('lee los decimales tal como se escribieron', () => {
    expect(parseWritten('80,4')).toEqual({ value: 80.4, decimals: 1 });
    expect(parseWritten('8964')).toEqual({ value: 8964, decimals: 0 });
    expect(parseWritten('17059,19')).toEqual({ value: 17059.19, decimals: 2 });
  });

  it('clasifica coincidencia, redondeo y discrepancia', () => {
    expect(compareWithWritten('80,4', 80.3839).status).toBe('match');
    expect(compareWithWritten('17059,19', 17059.1776).status).toBe('rounding');
    expect(compareWithWritten('100', 101).status).toBe('mismatch');
  });
});

describe('ejercicio B737 SPJC – SPQT', () => {
  const ex = getFuelExercise('b737-combustible-spjc-spqt')!;
  const r = solveFuelPlan(ex.input);

  it('existe y referencia tablas existentes', () => {
    expect(FUEL_EXERCISES.map((e) => e.id)).toContain(ex.id);
    ex.tables.forEach((t) => expect(getTable(t)).toBeDefined());
  });

  it('origen: interpola entre 600 y 650 NM y corrige por viento de cola', () => {
    expect(r.trip.lookup.interpolated).toBe(true);
    expect(r.trip.lookup.rows.map((x) => x.distanceNm)).toEqual([600, 650]);
    expect(r.trip.lookup.tasKt).toBe(433);
    expect(r.trip.lookup.airTimeMin).toBeCloseTo(92.08, 10);
    expect(r.trip.lookup.fuelLb).toBeCloseTo(8964, 10);
    expect(r.trip.deltaTimeMin).toBeCloseTo(-11.696, 3);
    expect(r.trip.timeMin).toBeCloseTo(80.384, 3);
    expect(r.trip.fuelLb).toBeCloseTo(7825.386, 3);
  });

  it('alterno: fila exacta de 270 NM y corrección por viento de cara', () => {
    expect(r.alternate.lookup.interpolated).toBe(false);
    expect(r.alternate.lookup.tasKt).toBe(447);
    expect(r.alternate.timeMin).toBeCloseTo(48.02, 2);
    expect(r.alternate.fuelLb).toBeCloseTo(5068.79, 2);
  });

  it('espera: FL 015 y 85 000 lb → 2510 lb/h por motor, 45 min, 2 motores', () => {
    expect(r.holding.lookup.interpolated).toBe(false);
    expect(r.holding.lookup.ffPerEngineLbHr).toBe(2510);
    expect(r.holding.fuelLb).toBe(3765);
  });

  it('respuestas finales', () => {
    expect(r.fobLb).toBeCloseTo(17059.18, 2);
    expect(r.enduranceMin).toBeCloseTo(173.4, 2);
  });

  it('todos los pasos coinciden con el cuaderno (exactos o por redondeo)', () => {
    const results = ex.expected.map((s) => ({ label: s.label, ...compareWithWritten(s.written, s.pick(r)) }));
    expect(results.filter((x) => x.status === 'mismatch')).toEqual([]);
    // las respuestas a) y b) coinciden exactamente con los decimales del cuaderno
    const byAnswer = (a: string) => results[ex.expected.findIndex((s) => s.answer === a)];
    expect(byAnswer('a').status).toBe('match');
    expect(byAnswer('b').status).toBe('match');
    // c) y d) difieren en 0,01–0,02 porque el cuaderno suma T.T y T.F ya redondeados
    expect(byAnswer('c').status).toBe('rounding');
    expect(byAnswer('d').status).toBe('rounding');
  });
});

describe('ejercicio B737 SPUR – SPJC (alterno entre 60 y 260 NM)', () => {
  const ex = getFuelExercise('b737-combustible-spur-spjc')!;
  const r = solveFuelPlan(ex.input);

  it('queda pendiente de verificación y es un vuelo nacional', () => {
    expect(ex.status).toBe('pending');
    expect(ex.scope).toBe('nacional');
  });

  it('origen: fila exacta de 750 NM con viento de cola', () => {
    expect(r.trip.lookup.interpolated).toBe(false);
    expect(r.trip.timeMin).toBeCloseTo(96.41, 2);
    expect(r.trip.fuelLb).toBeCloseTo(9287.53, 2);
  });

  it('alterno: interpola entre 60 y 260 NM (tramo sin filas publicadas)', () => {
    expect(r.alternate.lookup.rows.map((x) => x.distanceNm)).toEqual([60, 260]);
    expect(r.alternate.lookup.gap).toBeDefined();
    expect(r.alternate.lookup.tasKt).toBeCloseTo(350.4, 10);
    expect(r.alternate.lookup.airTimeMin).toBeCloseTo(29.05, 10);
    expect(r.alternate.lookup.fuelLb).toBeCloseTo(3076.25, 10);
    expect(r.alternate.fuelLb).toBeCloseTo(3339.63, 2);
  });

  it('espera: 92 500 lb interpolado entre 95 000 y 90 000 lb en FL 015 → 2630 lb/h', () => {
    expect(r.holding.lookup.weightsKlb).toEqual([95, 90]);
    expect(r.holding.lookup.ffPerEngineLbHr).toBe(2630);
    expect(r.holding.fuelLb).toBe(3945);
  });

  it('todos los pasos coinciden exactamente con la resolución', () => {
    const results = ex.expected.map((s) => ({ label: s.label, ...compareWithWritten(s.written, s.pick(r)) }));
    expect(results.filter((x) => x.status !== 'match')).toEqual([]);
    expect(r.fobLb).toBeCloseTo(16972.16, 2);
    expect(r.enduranceMin).toBeCloseTo(172.95, 2);
  });
});

describe('estado de los ejercicios', () => {
  it('el ejercicio SPJC – SPQT ya está verificado', () => {
    expect(getFuelExercise('b737-combustible-spjc-spqt')!.status).toBe('verified');
  });
  it('cada ejercicio tiene 4 respuestas (a–d)', () => {
    FUEL_EXERCISES.forEach((e) => expect(e.expected.filter((s) => s.answer).map((s) => s.answer)).toEqual(['a', 'b', 'c', 'd']));
  });
});

import { isIcaoCode, routeWarnings } from '@/data/airports';
import { routeScope, SCOPES } from './registry';

describe('ejercicio B737 SEGU – SPJC (vuelo internacional)', () => {
  const ex = getFuelExercise('b737-combustible-segu-spjc')!;
  const r = solveFuelPlan(ex.input);

  it('es internacional porque el origen no es del Perú: espera de 30 min y 10 % de contingencia', () => {
    expect(ex.scope).toBe('internacional');
    expect(ex.status).toBe('pending');
    expect(r.holding.minutes).toBe(30);
    expect(r.contingency.pct).toBe(0.1);
  });

  it('origen: interpola entre 700 y 750 NM y suma el viento de cara', () => {
    expect(r.trip.lookup.rows.map((x) => x.distanceNm)).toEqual([700, 750]);
    expect(r.trip.lookup.airTimeMin).toBeCloseTo(106.2, 10);
    expect(r.trip.lookup.fuelLb).toBeCloseTo(10260, 10);
    expect(r.trip.timeMin).toBeCloseTo(116.01, 2);
    expect(r.trip.fuelLb).toBeCloseTo(11207.81, 2);
  });

  it('contingencia: 10 % de T.T y T.F, incluida en autonomía y FOB', () => {
    expect(r.contingency.timeMin).toBeCloseTo(11.6, 2);
    expect(r.contingency.fuelLb).toBeCloseTo(1120.78, 2);
    expect(r.enduranceMin).toBeCloseTo(r.trip.timeMin * 1.1 + r.alternate.timeMin + 30, 10);
    expect(r.fobLb).toBeCloseTo(r.trip.fuelLb * 1.1 + r.alternate.fuelLb + r.holding.fuelLb + 400, 10);
    expect(r.enduranceMin).toBeCloseTo(181.45, 2);
    expect(r.fobLb).toBeCloseTo(17607.25, 2);
  });

  it('espera: 73 000 lb entre 75 000 y 70 000 lb en FL 015 → 2342 lb/h; 30 min y 2 motores', () => {
    expect(r.holding.lookup.weightsKlb).toEqual([75, 70]);
    expect(r.holding.lookup.ffPerEngineLbHr).toBeCloseTo(2342, 10);
    expect(r.holding.fuelLb).toBeCloseTo(2342, 10);
  });

  it('coincide con el cuaderno; el FOB difiere 0,04 por sumar A.F redondeado', () => {
    const results = ex.expected.map((s) => ({ label: s.label, ...compareWithWritten(s.written, s.pick(r)) }));
    expect(results.filter((x) => x.status === 'mismatch')).toEqual([]);
    expect(results.filter((x) => x.status === 'rounding').map((x) => x.label)).toEqual(['Combustible a bordo (FOB)']);
  });

  it('un vuelo nacional no lleva contingencia', () => {
    const nacional = solveFuelPlan({ ...ex.input, contingencyPct: undefined });
    expect(nacional.contingency).toEqual({ pct: 0, timeMin: 0, fuelLb: 0 });
    expect(nacional.fobLb).toBeCloseTo(r.fobLb - r.contingency.fuelLb, 10);
  });
});

describe('ámbito del vuelo', () => {
  it('es internacional si origen, destino o alterno no es del Perú', () => {
    expect(routeScope({ origin: 'SPJC', destination: 'SPQT', alternate: 'SPST' })).toBe('nacional');
    expect(routeScope({ origin: 'SEGU', destination: 'SPJC', alternate: 'SPSO' })).toBe('internacional');
    expect(routeScope({ origin: 'SPJC', destination: 'SKBO', alternate: 'SPST' })).toBe('internacional');
    expect(routeScope({ origin: 'SPJC', destination: 'SPQT', alternate: 'SEQM' })).toBe('internacional');
    // códigos incompletos o vacíos no cambian el ámbito
    expect(routeScope({ origin: 'SEG', destination: '', alternate: '' })).toBe('nacional');
    expect(SCOPES.internacional).toMatchObject({ holdingMinutes: 30, contingencyPct: 0.1 });
    expect(SCOPES.nacional).toMatchObject({ holdingMinutes: 45, contingencyPct: 0 });
  });
});

describe('aeropuertos de los ejercicios', () => {
  it('son códigos OACI coherentes con el enunciado y el título', () => {
    for (const e of FUEL_EXERCISES) {
      const { origin, destination, alternate } = e.airports;
      [origin, destination, alternate].forEach((c) => expect(isIcaoCode(c)).toBe(true));
      expect(e.title).toContain(`${origin} – ${destination}`);
      // «SEGU (Guayaquil) – SPJC»: el nombre de la ciudad no forma parte de la ruta
      const statement = e.statement.join(' ').replace(/\s*\([A-Za-zÀ-ú ]+\)/g, '');
      expect(statement).toContain(`${origin} – ${destination}`);
      expect(statement).toContain(`${destination} – ${alternate}`);
      // vuelo nacional: todos peruanos y ruta coherente; el ámbito coincide con los aeropuertos
      expect(routeWarnings(e.airports, e.scope === 'nacional')).toEqual([]);
      expect(routeScope(e.airports)).toBe(e.scope);
      expect(e.input.holding.minutes).toBe(SCOPES[e.scope].holdingMinutes);
      expect(e.input.contingencyPct ?? 0).toBe(SCOPES[e.scope].contingencyPct);
    }
  });
});
