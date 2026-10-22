/**
 * Comparación de un resultado de la app con el valor escrito en la resolución manual.
 * El valor esperado se guarda como texto («80,4») para conocer con cuántos
 * decimales lo escribió el alumno.
 */

export type MatchStatus = 'match' | 'rounding' | 'mismatch';

export interface Comparison {
  expected: number;
  decimals: number;
  actual: number;
  /** Valor de la app redondeado a los decimales del cuaderno */
  actualRounded: number;
  diff: number;
  status: MatchStatus;
}

/** Margen admitido por arrastre de redondeos intermedios. */
export const ROUNDING_TOLERANCE = 0.05;

export function parseWritten(written: string): { value: number; decimals: number } {
  const s = written.trim().replace(/\s/g, '').replace(',', '.');
  const value = Number(s);
  if (!Number.isFinite(value)) throw new Error(`Valor esperado no numérico: «${written}»`);
  const dot = s.indexOf('.');
  return { value, decimals: dot < 0 ? 0 : s.length - dot - 1 };
}

const roundTo = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d;

export function compareWithWritten(written: string, actual: number, tolerance = ROUNDING_TOLERANCE): Comparison {
  const { value: expected, decimals } = parseWritten(written);
  const actualRounded = roundTo(actual, decimals);
  const diff = actual - expected;
  const status: MatchStatus =
    Math.abs(actualRounded - expected) < 10 ** -(decimals + 3)
      ? 'match'
      : Math.abs(diff) <= tolerance
        ? 'rounding'
        : 'mismatch';
  return { expected, decimals, actual, actualRounded, diff, status };
}
