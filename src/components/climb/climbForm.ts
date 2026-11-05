import { useMemo } from 'react';
import { ClimbError, solveEnRouteClimb, type ClimbInput, type ClimbResult } from '@/core/enRouteClimb';
import { parseNumber } from '@/core/format';
import type { ClimbScenario } from '@/data/tables/enRouteClimbData';

/** Claves del formulario (también son los parámetros de la URL). t: ISA | ISA10 · wk: HW | TW. */
export const CLIMB_FORM_KEYS = ['w', 'alt', 'elev', 't', 'wind', 'wk'] as const;
export type ClimbFormKey = (typeof CLIMB_FORM_KEYS)[number];
export type ClimbFormValues = Record<ClimbFormKey, string>;

export const toClimbForm = (i: ClimbInput): ClimbFormValues => ({
  w: String(i.weightLb),
  alt: String(i.cruiseAltFt),
  elev: String(i.airportElevationFt),
  t: i.temp === 'ISA+10' ? 'ISA10' : 'ISA',
  wind: String(i.windKt),
  wk: i.windKind,
});

export const scenarioClimbInput = (s: ClimbScenario): ClimbInput => ({
  weightLb: s.weightLb,
  cruiseAltFt: s.cruiseAltFt,
  airportElevationFt: s.airportElevationFt,
  temp: s.temp,
  windKt: Math.abs(s.windKt),
  windKind: s.windKt >= 0 ? 'HW' : 'TW',
});

export function fromClimbForm(v: ClimbFormValues): { input: ClimbInput; incomplete: boolean } {
  const input: ClimbInput = {
    weightLb: parseNumber(v.w),
    cruiseAltFt: parseNumber(v.alt),
    airportElevationFt: parseNumber(v.elev),
    temp: v.t === 'ISA10' ? 'ISA+10' : 'ISA',
    windKt: parseNumber(v.wind),
    windKind: v.wk === 'TW' ? 'TW' : 'HW',
  };
  return { input, incomplete: ![input.weightLb, input.cruiseAltFt, input.airportElevationFt, input.windKt].every(Number.isFinite) };
}

export const climbFormQuery = (i: ClimbInput) => new URLSearchParams(toClimbForm(i)).toString();

export const sameClimbForm = (a: ClimbFormValues, b: ClimbFormValues) =>
  CLIMB_FORM_KEYS.every((k) => (['t', 'wk'].includes(k) ? a[k] === b[k] : parseNumber(a[k]) === parseNumber(b[k])));

/** `decimals` (de Ajustes) redondea cada paso como en una resolución a mano. */
export function useEnRouteClimb(values: ClimbFormValues, decimals?: number): { input: ClimbInput; result?: ClimbResult; error?: string; incomplete: boolean } {
  const key = `${CLIMB_FORM_KEYS.map((k) => values[k]).join('|')}|${decimals}`;
  return useMemo(() => {
    const { input, incomplete } = fromClimbForm(values);
    if (incomplete) return { input, incomplete };
    try {
      return { input, incomplete, result: solveEnRouteClimb(input, { decimals }) };
    } catch (e) {
      return { input, incomplete, error: e instanceof ClimbError ? e.message : 'Error de cálculo' };
    }
    // `key` resume todos los valores del formulario
  }, [key]);
}
