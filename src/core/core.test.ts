import { describe, expect, it } from 'vitest';
import { bilinearInterpolate, InterpolationError, linearInterpolate } from './interpolation';
import { atmosphereReport, densityAltitude, isaTemperature, pressureAltitude } from './atmosphere';
import { convert } from './units';
import { parseNumber } from './format';

describe('linearInterpolate', () => {
  it('reproduce el ejemplo de referencia (600→89, 650→96, 622→92.08)', () => {
    const r = linearInterpolate({ a: 600, b: 650, c: 622, a1: 89, b1: 96 });
    expect(r.x).toBeCloseTo(92.08, 10);
    expect(r.ratio).toBeCloseTo(0.44, 10);
    expect(r.extrapolated).toBe(false);
  });

  it('detecta extrapolación', () => {
    expect(linearInterpolate({ a: 0, b: 10, c: 12, a1: 0, b1: 100 }).extrapolated).toBe(true);
  });

  it('funciona con ejes decrecientes', () => {
    expect(linearInterpolate({ a: 10, b: 0, c: 5, a1: 100, b1: 0 }).x).toBe(50);
  });

  it('rechaza A = B', () => {
    expect(() => linearInterpolate({ a: 5, b: 5, c: 5, a1: 1, b1: 2 })).toThrow(InterpolationError);
  });
});

describe('bilinearInterpolate', () => {
  it('interpola en el centro de la celda', () => {
    const r = bilinearInterpolate({ x1: 0, x2: 10, x: 5, y1: 0, y2: 10, y: 5, q11: 0, q21: 10, q12: 10, q22: 20 });
    expect(r.value).toBe(10);
    expect(r.r1).toBe(5);
    expect(r.r2).toBe(15);
  });
});

describe('atmósfera ISA', () => {
  it('temperatura ISA', () => {
    expect(isaTemperature(0)).toBe(15);
    expect(isaTemperature(10000)).toBeCloseTo(-4.81, 2);
  });
  it('altitud de presión con QNH estándar = elevación', () => {
    expect(pressureAltitude(2000, 1013.25)).toBeCloseTo(2000, 6);
    expect(pressureAltitude(0, 1003.25)).toBeCloseTo(274, 0); // ≈ 27 ft/hPa a nivel del mar
  });
  it('altitud de densidad en ISA = altitud de presión', () => {
    expect(densityAltitude(5000, isaTemperature(5000))).toBeCloseTo(5000, -1);
  });
  it('día caluroso aumenta la altitud de densidad', () => {
    const r = atmosphereReport(5000, 1013.25, 30);
    expect(r.isaDeviation).toBeCloseTo(24.9, 1);
    expect(r.densityAltitude).toBeGreaterThan(7800);
    expect(r.densityAltitude).toBeLessThan(8200);
  });
});

describe('unidades', () => {
  it('convierte longitudes y velocidades', () => {
    expect(convert('altitude', 1000, 'ft', 'm')).toBeCloseTo(304.8, 6);
    expect(convert('speed', 100, 'kt', 'kmh')).toBeCloseTo(185.2, 6);
  });
  it('convierte temperaturas', () => {
    expect(convert('temperature', 100, 'c', 'f')).toBeCloseTo(212, 6);
    expect(convert('temperature', 0, 'k', 'c')).toBeCloseTo(-273.15, 6);
  });
  it('convierte presiones', () => {
    expect(convert('pressure', 29.92, 'inhg', 'hpa')).toBeCloseTo(1013.2, 1);
  });
});

describe('parseNumber', () => {
  it('acepta coma decimal', () => {
    expect(parseNumber('92,08')).toBe(92.08);
    expect(Number.isNaN(parseNumber(''))).toBe(true);
    expect(Number.isNaN(parseNumber('abc'))).toBe(true);
  });
});

import { runwayToHeading, windComponents } from './wind';

describe('viento', () => {
  it('viento de cara puro', () => {
    const w = windComponents(270, 270, 20);
    expect(w.headwind).toBeCloseTo(20);
    expect(w.crosswind).toBeCloseTo(0);
  });
  it('cruzado desde la derecha a 90°', () => {
    const w = windComponents(90, 180, 15);
    expect(w.headwind).toBeCloseTo(0);
    expect(w.crosswind).toBeCloseTo(15);
  });
  it('viento de cola desde la izquierda', () => {
    const w = windComponents(360, 210, 10);
    expect(w.headwind).toBeLessThan(0);
    expect(w.crosswind).toBeLessThan(0);
  });
  it('interpreta designadores de pista', () => {
    expect(runwayToHeading('27L')).toBe(270);
    expect(runwayToHeading('09')).toBe(90);
    expect(runwayToHeading('36')).toBe(360);
    expect(runwayToHeading('274')).toBe(274);
  });
});

import { bracket, lookupFlightPlanning, lookupHolding, LookupError } from './tableLookup';
import { FIG67_ABBREVIATED_FLIGHT_PLANNING as F67, FIG69_B737_HOLDING as F69 } from '@/data/tables';
import { solveFuelPlan } from './fuelPlanning';

describe('lectura de tablas con interpolación', () => {
  it('bracket en listas crecientes y decrecientes', () => {
    expect(bracket([10, 20, 30], 20)).toEqual({ lo: 1, hi: 1, exact: true });
    expect(bracket([10, 20, 30], 25)).toEqual({ lo: 1, hi: 2, exact: false });
    expect(bracket([115, 110, 105], 107)).toEqual({ lo: 1, hi: 2, exact: false });
    expect(bracket([10, 20], 5)).toBeUndefined();
  });

  it('planificación abreviada: fila exacta, interpolada y límites', () => {
    expect(lookupFlightPlanning(F67, 270)).toMatchObject({ tasKt: 447, airTimeMin: 45, fuelLb: 4750, interpolated: false });
    expect(lookupFlightPlanning(F67, 425)).toMatchObject({ airTimeMin: 65.5, fuelLb: 6550, interpolated: true });
    // tramo sin filas publicadas: se interpola entre 60 y 260 NM y se marca
    const g = lookupFlightPlanning(F67, 145);
    expect(g.rows.map((r) => r.distanceNm)).toEqual([60, 260]);
    expect(g.tasKt).toBeCloseTo(350.4, 10);
    expect(g.airTimeMin).toBeCloseTo(29.05, 10);
    expect(g.fuelLb).toBeCloseTo(3076.25, 10);
    expect(g.gap).toMatchObject({ afterNm: 60, beforeNm: 260 });
    expect(lookupFlightPlanning(F67, 400).gap).toBeUndefined();
    expect(() => lookupFlightPlanning(F67, 40)).toThrow(LookupError);
    expect(() => lookupFlightPlanning(F67, 1200)).toThrow(LookupError);
  });

  it('espera: exacta, por peso, por nivel y doble', () => {
    expect(lookupHolding(F69, 15, 85).ffPerEngineLbHr).toBe(2510);
    expect(lookupHolding(F69, 15, 87.5).ffPerEngineLbHr).toBe(2550);
    expect(lookupHolding(F69, 32.5, 85).ffPerEngineLbHr).toBeCloseTo(2465, 10); // entre FL 015 y FL 050
    expect(lookupHolding(F69, 225, 102.5).ffPerEngineLbHr).toBeCloseTo(2435, 10);
    expect(() => lookupHolding(F69, 400, 85)).toThrow(LookupError);
    expect(() => lookupHolding(F69, 100, 60)).toThrow(LookupError);
  });

  it('planificación de combustible: viento de cara suma y de cola resta', () => {
    const base = { holding: { weightLb: 85000, flightLevel: 15, minutes: 30 }, taxiFuelLb: 0 };
    const leg = { distanceNm: 400, windKt: 0, windKind: 'HW' as const };
    const calm = solveFuelPlan({ trip: leg, alternate: leg, ...base });
    const hw = solveFuelPlan({ trip: { ...leg, windKt: 20 }, alternate: leg, ...base });
    const tw = solveFuelPlan({ trip: { ...leg, windKt: 20, windKind: 'TW' }, alternate: leg, ...base });
    expect(calm.trip.fuelLb).toBe(6250);
    expect(hw.trip.fuelLb).toBeGreaterThan(6250);
    expect(tw.trip.fuelLb).toBeLessThan(6250);
    expect(calm.holding.fuelLb).toBe(2510); // 2510 × 30/60 × 2
  });
});

import { formatPlain } from './format';

describe('formatPlain', () => {
  it('formatea como en el cuaderno', () => {
    expect(formatPlain(92.08)).toBe('92,08');
    expect(formatPlain(17059.1776)).toBe('17059,18');
    expect(formatPlain(433)).toBe('433');
    expect(formatPlain(11.696074, 3)).toBe('11,696');
    expect(formatPlain(-0.0001)).toBe('0');
  });
});
