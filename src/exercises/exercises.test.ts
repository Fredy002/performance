import { describe, expect, it } from 'vitest';
import { solveFuelPlan } from '@/core/fuelPlanning';
import { getTable } from '@/data/tables';
import { compareWithWritten, parseWritten } from './validation';
import { EXERCISES, getExercise } from './registry';

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
  const ex = getExercise('b737-combustible-spjc-spqt')!;
  const r = solveFuelPlan(ex.input);

  it('existe y referencia tablas existentes', () => {
    expect(EXERCISES.map((e) => e.id)).toContain(ex.id);
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
  const ex = getExercise('b737-combustible-spur-spjc')!;
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
    expect(getExercise('b737-combustible-spjc-spqt')!.status).toBe('verified');
  });
  it('cada ejercicio tiene 4 respuestas (a–d)', () => {
    EXERCISES.forEach((e) => expect(e.expected.filter((s) => s.answer).map((s) => s.answer)).toEqual(['a', 'b', 'c', 'd']));
  });
});
