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
