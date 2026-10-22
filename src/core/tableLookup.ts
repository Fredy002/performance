/**
 * Lectura de tablas de performance con interpolación.
 * Une las tablas digitalizadas (src/data/tables) con el núcleo de interpolación.
 */
import type { FlightPlanningTable, HoldingCell, HoldingTable } from '@/data/tables/types';
import { linearInterpolate } from './interpolation';

export class LookupError extends Error {}

export interface Bracket {
  /** Índice del valor inferior/superior en la lista (iguales si hay coincidencia exacta) */
  lo: number;
  hi: number;
  exact: boolean;
}

/** Busca los dos valores de `values` (ordenados, crecientes o decrecientes) que rodean a `x`. */
export function bracket(values: number[], x: number): Bracket | undefined {
  const exact = values.indexOf(x);
  if (exact >= 0) return { lo: exact, hi: exact, exact: true };
  for (let i = 0; i < values.length - 1; i++) {
    const a = values[i];
    const b = values[i + 1];
    if ((x - a) * (x - b) < 0) return { lo: i, hi: i + 1, exact: false };
  }
  return undefined;
}

/** Interpola un valor de una columna entre dos filas (o lo devuelve tal cual si la fila es exacta). */
function interp(br: Bracket, keys: number[], x: number, pick: (i: number) => number): number {
  if (br.exact) return pick(br.lo);
  return linearInterpolate({ a: keys[br.lo], b: keys[br.hi], c: x, a1: pick(br.lo), b1: pick(br.hi) }).x;
}

/* ---------- planificación de vuelo abreviada ---------- */

export interface FlightPlanningLookup {
  distanceNm: number;
  tasKt: number;
  airTimeMin: number;
  fuelLb: number;
  /** Filas usadas: una si la distancia es exacta, dos si se interpoló */
  rows: FlightPlanningTable['rows'][number][];
  interpolated: boolean;
}

export function lookupFlightPlanning(table: FlightPlanningTable, distanceNm: number): FlightPlanningLookup {
  if (!Number.isFinite(distanceNm)) throw new LookupError('La distancia debe ser un número.');
  const dists = table.rows.map((r) => r.distanceNm);
  const min = dists[0];
  const max = dists[dists.length - 1];
  if (distanceNm < min || distanceNm > max) {
    throw new LookupError(`La distancia ${distanceNm} NM está fuera de la tabla (${min}–${max} NM). No se extrapola.`);
  }
  const gap = table.gaps.find((g) => distanceNm > g.afterNm && distanceNm < g.beforeNm);
  if (gap) {
    throw new LookupError(
      `La distancia ${distanceNm} NM cae en el tramo ${gap.afterNm}–${gap.beforeNm} NM, que no está digitalizado.`,
    );
  }
  const br = bracket(dists, distanceNm)!;
  const rows = br.exact ? [table.rows[br.lo]] : [table.rows[br.lo], table.rows[br.hi]];
  return {
    distanceNm,
    tasKt: interp(br, dists, distanceNm, (i) => table.rows[i].tasKt),
    airTimeMin: interp(br, dists, distanceNm, (i) => table.rows[i].airTimeMin),
    fuelLb: interp(br, dists, distanceNm, (i) => table.rows[i].fuelLb),
    rows,
    interpolated: !br.exact,
  };
}

/* ---------- performance de espera ---------- */

export interface HoldingLookup extends HoldingCell {
  flightLevel: number;
  weightKlb: number;
  /** Niveles y pesos de la tabla usados en la lectura */
  flightLevels: number[];
  weightsKlb: number[];
  interpolated: boolean;
}

export function lookupHolding(table: HoldingTable, flightLevel: number, weightKlb: number): HoldingLookup {
  if (!Number.isFinite(flightLevel) || !Number.isFinite(weightKlb)) throw new LookupError('Nivel y peso deben ser números.');
  const fls = table.rows.map((r) => r.flightLevel);
  const ws = table.weightsKlb;
  const brFl = bracket(fls, flightLevel);
  const brW = bracket(ws, weightKlb);
  if (!brFl) {
    throw new LookupError(`El nivel FL ${String(flightLevel).padStart(3, '0')} está fuera de la tabla (FL 015–FL 350).`);
  }
  if (!brW) {
    throw new LookupError(`El peso ${weightKlb * 1000} lb está fuera de la tabla (${Math.min(...ws) * 1000}–${Math.max(...ws) * 1000} lb).`);
  }

  // primero por peso en cada nivel, luego entre niveles (interpolación doble)
  const atLevel = (row: number, pick: (c: HoldingCell) => number) =>
    interp(brW, ws, weightKlb, (i) => pick(table.rows[row].cells[i]));
  const value = (pick: (c: HoldingCell) => number) =>
    interp(brFl, fls, flightLevel, (row) => atLevel(row, pick));

  const uniq = (xs: number[]) => [...new Set(xs)];
  return {
    flightLevel,
    weightKlb,
    epr: value((c) => c.epr),
    iasKt: value((c) => c.iasKt),
    ffPerEngineLbHr: value((c) => c.ffPerEngineLbHr),
    flightLevels: uniq([fls[brFl.lo], fls[brFl.hi]]),
    weightsKlb: uniq([ws[brW.lo], ws[brW.hi]]),
    interpolated: !brFl.exact || !brW.exact,
  };
}
