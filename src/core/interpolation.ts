/**
 * Núcleo matemático de interpolación.
 * Funciones puras, sin dependencias de UI, para poder reutilizarlas
 * en cualquier calculadora de performance (despegue, aterrizaje, crucero…).
 */

export interface LinearInput {
  /** Valor de referencia inferior (ej. peso, altitud, temperatura) */
  a: number;
  /** Valor de referencia superior */
  b: number;
  /** Valor buscado en la variable de entrada */
  c: number;
  /** Resultado tabulado correspondiente a A */
  a1: number;
  /** Resultado tabulado correspondiente a B */
  b1: number;
}

export interface LinearResult {
  x: number;
  /** Fracción (C − A) / (B − A). 0 = A, 1 = B */
  ratio: number;
  /** Pendiente (B1 − A1) / (B − A) */
  slope: number;
  /** true si C cae fuera de [A, B] (extrapolación) */
  extrapolated: boolean;
}

export class InterpolationError extends Error {}

/** X = A1 + (B1 − A1)(C − A) / (B − A) */
export function linearInterpolate({ a, b, c, a1, b1 }: LinearInput): LinearResult {
  for (const v of [a, b, c, a1, b1]) {
    if (!Number.isFinite(v)) throw new InterpolationError('Todos los valores deben ser numéricos.');
  }
  if (a === b) throw new InterpolationError('A y B no pueden ser iguales (división por cero).');
  const ratio = (c - a) / (b - a);
  const slope = (b1 - a1) / (b - a);
  const x = a1 + (b1 - a1) * ratio;
  return { x, ratio, slope, extrapolated: ratio < 0 || ratio > 1 };
}

export interface BilinearInput {
  /** Eje X (columnas): valores inferior, superior y buscado */
  x1: number;
  x2: number;
  x: number;
  /** Eje Y (filas): valores inferior, superior y buscado */
  y1: number;
  y2: number;
  y: number;
  /** Valores de la tabla en las cuatro esquinas: q[fila][columna] */
  q11: number; // (x1, y1)
  q21: number; // (x2, y1)
  q12: number; // (x1, y2)
  q22: number; // (x2, y2)
}

export interface BilinearResult {
  value: number;
  /** Interpolación sobre X en la fila y1 */
  r1: number;
  /** Interpolación sobre X en la fila y2 */
  r2: number;
  extrapolated: boolean;
}

/** Interpolación doble: primero a lo largo de X en cada fila, luego a lo largo de Y. */
export function bilinearInterpolate(p: BilinearInput): BilinearResult {
  const r1 = linearInterpolate({ a: p.x1, b: p.x2, c: p.x, a1: p.q11, b1: p.q21 });
  const r2 = linearInterpolate({ a: p.x1, b: p.x2, c: p.x, a1: p.q12, b1: p.q22 });
  const final = linearInterpolate({ a: p.y1, b: p.y2, c: p.y, a1: r1.x, b1: r2.x });
  return {
    value: final.x,
    r1: r1.x,
    r2: r2.x,
    extrapolated: r1.extrapolated || final.extrapolated,
  };
}
