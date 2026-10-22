import { useMemo } from 'react';
import { parseNumber } from '@/core/format';
import { solveFuelPlan, type FuelPlanInput, type FuelPlanResult } from '@/core/fuelPlanning';
import { LookupError } from '@/core/tableLookup';

/** Claves del formulario de planificación de combustible (también son los parámetros de la URL). */
export const FUEL_FORM_KEYS = ['td', 'tw', 'tk', 'tfl', 'ad', 'aw', 'ak', 'afl', 'hw', 'hfl', 'hm', 'taxi'] as const;
export type FuelFormKey = (typeof FUEL_FORM_KEYS)[number];
export type FuelFormValues = Record<FuelFormKey, string>;

const TEXT_KEYS: FuelFormKey[] = ['tk', 'ak'];

export function toFuelForm(input: FuelPlanInput): FuelFormValues {
  return {
    td: String(input.trip.distanceNm),
    tw: String(input.trip.windKt),
    tk: input.trip.windKind,
    tfl: input.trip.flightLevel === undefined ? '' : String(input.trip.flightLevel),
    ad: String(input.alternate.distanceNm),
    aw: String(input.alternate.windKt),
    ak: input.alternate.windKind,
    afl: input.alternate.flightLevel === undefined ? '' : String(input.alternate.flightLevel),
    hw: String(input.holding.weightLb),
    hfl: String(input.holding.flightLevel),
    hm: String(input.holding.minutes),
    taxi: String(input.taxiFuelLb),
  };
}

export function fromFuelForm(v: FuelFormValues): { input: FuelPlanInput; incomplete: boolean } {
  const n = (k: FuelFormKey) => parseNumber(v[k]);
  const input: FuelPlanInput = {
    trip: { distanceNm: n('td'), windKt: n('tw'), windKind: v.tk === 'HW' ? 'HW' : 'TW', flightLevel: n('tfl') },
    alternate: { distanceNm: n('ad'), windKt: n('aw'), windKind: v.ak === 'TW' ? 'TW' : 'HW', flightLevel: n('afl') },
    holding: { weightLb: n('hw'), flightLevel: n('hfl'), minutes: n('hm') },
    taxiFuelLb: n('taxi'),
  };
  const required: FuelFormKey[] = ['td', 'tw', 'ad', 'aw', 'hw', 'hfl', 'hm', 'taxi'];
  return { input, incomplete: required.some((k) => !Number.isFinite(n(k))) };
}

/** Compara dos formularios por valor («622» = «622,0»). */
export function sameFuelForm(a: FuelFormValues, b: FuelFormValues): boolean {
  return FUEL_FORM_KEYS.every((k) => {
    if (TEXT_KEYS.includes(k)) return a[k] === b[k];
    const x = parseNumber(a[k]);
    const y = parseNumber(b[k]);
    return (Number.isNaN(x) && Number.isNaN(y)) || x === y;
  });
}

export function fuelFormQuery(input: FuelPlanInput): string {
  const qs = new URLSearchParams();
  Object.entries(toFuelForm(input)).forEach(([k, val]) => val !== '' && qs.set(k, val));
  return qs.toString();
}

/** Resuelve el plan a partir del formulario; memoriza por valor. */
export function useFuelPlan(values: FuelFormValues): { input: FuelPlanInput; result?: FuelPlanResult; error?: string; incomplete: boolean } {
  const key = FUEL_FORM_KEYS.map((k) => values[k]).join('|');
  return useMemo(() => {
    const { input, incomplete } = fromFuelForm(values);
    if (incomplete) return { input, incomplete };
    try {
      return { input, incomplete, result: solveFuelPlan(input) };
    } catch (e) {
      return { input, incomplete, error: e instanceof LookupError ? e.message : 'Error de cálculo' };
    }
    // `key` resume todos los valores del formulario
  }, [key]);
}
