import { useMemo } from 'react';
import { parseNumber } from '@/core/format';
import { solveTakeoffEpr, TakeoffEprError, type TakeoffEprInput, type TakeoffEprResult } from '@/core/takeoffEpr';
import { solveB737TakeoffEpr, type B737EprInput, type B737EprResult } from '@/core/takeoffEprB737';
import type { B727Scenario, B737Scenario } from '@/data/tables/takeoffEprData';

/**
 * Claves del formulario de EPR de despegue (también son los parámetros de la URL).
 * av: avión (b727 | b737) · qu: unidad del reglaje (inHg | mb) · tu: unidad de la OAT (F | C)
 * ac: aire acondicionado (B727: motores 1 y 3) · ai: antihielo (B727: motor 2) · b6: 6.ª etapa (solo B727). on | off.
 */
export const EPR_FORM_KEYS = ['av', 'elev', 'qnh', 'qu', 'oat', 'tu', 'ac', 'ai', 'b6'] as const;
export type EprFormKey = (typeof EPR_FORM_KEYS)[number];
export type EprFormValues = Record<EprFormKey, string>;
export type EprAircraft = 'b727' | 'b737';

/** Un caso de cálculo: avión + datos. */
export type EprCase = { aircraft: 'b727'; input: TakeoffEprInput } | { aircraft: 'b737'; input: B737EprInput };
export type EprOutcome =
  | { aircraft: 'b727'; input: TakeoffEprInput; result?: TakeoffEprResult; error?: string; incomplete: boolean }
  | { aircraft: 'b737'; input: B737EprInput; result?: B737EprResult; error?: string; incomplete: boolean };

const onOff = (b: boolean) => (b ? 'on' : 'off');

export function toEprForm(c: EprCase): EprFormValues {
  const i = c.input;
  const common = { qnh: String(i.altimeter), qu: i.altimeterUnit, oat: String(i.temperature), tu: i.temperatureUnit, elev: String(i.elevationFt) };
  return c.aircraft === 'b727'
    ? { av: 'b727', ...common, ac: onOff(c.input.airCondEng13), ai: onOff(c.input.antiIceEng2), b6: onOff(c.input.sixthStageBleed) }
    : { av: 'b737', ...common, ac: onOff(c.input.airConditioning), ai: onOff(c.input.engineAntiIce), b6: 'off' };
}

export const b727ScenarioCase = (s: B727Scenario): EprCase => ({
  aircraft: 'b727',
  input: {
    elevationFt: s.elevationFt,
    altimeter: s.altimeter,
    altimeterUnit: s.altimeterUnit,
    temperature: s.temperature,
    temperatureUnit: s.temperatureUnit,
    airCondEng13: s.airCondEng13,
    antiIceEng2: s.antiIceEng2,
    sixthStageBleed: s.sixthStageBleed,
  },
});

export const b737ScenarioCase = (s: B737Scenario): EprCase => ({
  aircraft: 'b737',
  input: {
    elevationFt: s.elevationFt,
    altimeter: s.altimeter,
    altimeterUnit: s.altimeterUnit,
    temperature: s.temperature,
    temperatureUnit: s.temperatureUnit,
    airConditioning: s.airConditioning,
    engineAntiIce: s.engineAntiIce,
  },
});

/** Compatibilidad: los enlaces sin `av` son del B727 (la herramienta empezó con él). */
export const formAircraft = (v: EprFormValues): EprAircraft => (v.av === 'b737' ? 'b737' : 'b727');

export function fromEprForm(v: EprFormValues): { case: EprCase; incomplete: boolean } {
  const n = { elevationFt: parseNumber(v.elev), altimeter: parseNumber(v.qnh), temperature: parseNumber(v.oat) };
  const common = { ...n, altimeterUnit: v.qu === 'mb' ? ('mb' as const) : ('inHg' as const), temperatureUnit: v.tu === 'C' ? ('C' as const) : ('F' as const) };
  const incomplete = !Object.values(n).every(Number.isFinite);
  const c: EprCase =
    formAircraft(v) === 'b737'
      ? { aircraft: 'b737', input: { ...common, airConditioning: v.ac !== 'off', engineAntiIce: v.ai === 'on' } }
      : { aircraft: 'b727', input: { ...common, airCondEng13: v.ac !== 'off', antiIceEng2: v.ai === 'on', sixthStageBleed: v.b6 === 'on' } };
  return { case: c, incomplete };
}

export const eprFormQuery = (c: EprCase) => new URLSearchParams(toEprForm(c)).toString();

export function sameEprForm(a: EprFormValues, b: EprFormValues) {
  return EPR_FORM_KEYS.every((k) => (['elev', 'qnh', 'oat'].includes(k) ? parseNumber(a[k]) === parseNumber(b[k]) : a[k] === b[k]));
}

/** Resuelve el caso del formulario; memoriza por valor. */
export function useTakeoffEpr(values: EprFormValues): EprOutcome {
  const key = EPR_FORM_KEYS.map((k) => values[k]).join('|');
  return useMemo((): EprOutcome => {
    const { case: c, incomplete } = fromEprForm(values);
    const fail = (e: unknown) => (e instanceof TakeoffEprError ? e.message : 'Error de cálculo');
    if (c.aircraft === 'b737') {
      if (incomplete) return { ...c, incomplete };
      try {
        return { ...c, incomplete, result: solveB737TakeoffEpr(c.input) };
      } catch (e) {
        return { ...c, incomplete, error: fail(e) };
      }
    }
    if (incomplete) return { ...c, incomplete };
    try {
      return { ...c, incomplete, result: solveTakeoffEpr(c.input) };
    } catch (e) {
      return { ...c, incomplete, error: fail(e) };
    }
    // `key` resume todos los valores del formulario
  }, [key]);
}
