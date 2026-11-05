/**
 * Ascenso en ruta del B-737 (FIGURE 57 ISA y FIGURE 58 ISA +10 °C), con el método del curso:
 *  1. Lectura de tiempo, combustible, distancia y TAS en la fila de la altitud de crucero y la
 *     columna del peso al soltar frenos (interpolando si no son valores exactos).
 *  2. Combustible consumido = combustible de la tabla + ajuste por aeropuerto elevado.
 *  3. Distancia recorrida = distancia de la tabla − (tiempo/60 × viento) con viento de cara,
 *     o + con viento de cola (d = t · v).
 */
import { CLIMB_TABLES, type ClimbCell, type ClimbRow, type ClimbTable, type ClimbTemp } from '@/data/tables/enRouteClimbData';
import { roundTo } from './format';

export class ClimbError extends Error {}

export interface ClimbInput {
  weightLb: number;
  cruiseAltFt: number;
  airportElevationFt: number;
  temp: ClimbTemp;
  windKt: number;
  windKind: 'HW' | 'TW';
}

type Quantity = 'timeMin' | 'fuelLb' | 'distNm' | 'tasKt';

/** Lectura de una magnitud: por peso en cada fila y, si hace falta, entre filas. */
export interface ClimbRead {
  /** Valor en cada fila usada (ya interpolado por peso) */
  byRow: { altFt: number; lo: number; hi: number; value: number }[];
  value: number;
}

export interface ClimbResult {
  table: ClimbTable;
  /** Filas de altitud usadas (1 o 2) */
  rows: ClimbRow[];
  /** Pesos usados (1 o 2) e índices de columna */
  weights: number[];
  columns: number[];
  read: Record<Quantity, ClimbRead>;
  timeMin: number;
  tableFuelLb: number;
  tableDistNm: number;
  tasKt: number;
  adjustment: { fuelLb: number; elevationFt: number; between?: [number, number]; belowTable: boolean };
  /** Combustible consumido en el ascenso */
  fuelLb: number;
  /** Distancia recorrida por efecto del viento: t/60 × v */
  windDistNm: number;
  /** Distancia recorrida (sobre el terreno) */
  distNm: number;
}

const lerp = (x: number, x0: number, x1: number, y0: number, y1: number) => (x1 === x0 ? y0 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0));

function bracket(values: number[], x: number): [number, number] | undefined {
  // values en cualquier orden; devuelve índices del par que rodea x (iguales si coincide)
  const exact = values.findIndex((v) => v === x);
  if (exact >= 0) return [exact, exact];
  let best: [number, number] | undefined;
  values.forEach((a, i) =>
    values.forEach((b, j) => {
      if (a < x && x < b && (!best || b - a < values[best[1]] - values[best[0]])) best = [i, j];
    }),
  );
  return best;
}

export function solveEnRouteClimb(input: ClimbInput, { decimals }: { decimals?: number } = {}): ClimbResult {
  const r = (v: number) => (decimals === undefined ? v : roundTo(v, decimals));
  const { weightLb: w, cruiseAltFt: alt, airportElevationFt: elev } = input;
  if (![w, alt, elev, input.windKt].every(Number.isFinite)) throw new ClimbError('Peso, altitudes y viento deben ser números.');
  const table = CLIMB_TABLES[input.temp];

  // columnas de peso
  const wb = bracket(table.weightsLb, w);
  if (!wb) {
    const [min, max] = [Math.min(...table.weightsLb), Math.max(...table.weightsLb)];
    throw new ClimbError(`El peso (${w} lb) está fuera de la tabla (de ${min} a ${max} lb).`);
  }
  const columns = wb[0] === wb[1] ? [wb[0]] : wb;
  const weights = columns.map((c) => table.weightsLb[c]);

  // filas de altitud: entre 22000 y 6000 ft la lámina no publica filas (corte), no se interpola
  const alts = table.rows.map((row) => row.altFt);
  const ab = bracket(alts, alt);
  if (!ab) throw new ClimbError(`La altitud de crucero (${alt} ft) está fuera de la tabla (de 1500 a 37000 ft).`);
  const rows = (ab[0] === ab[1] ? [ab[0]] : ab).map((i) => table.rows[i]);
  if (rows.length === 2 && Math.abs(rows[0].altFt - rows[1].altFt) > 1000) {
    throw new ClimbError(`La tabla no publica las filas entre 6000 y 22000 ft: ${alt} ft no se puede leer.`);
  }

  const cellAt = (row: ClimbRow, c: number): ClimbCell => {
    const cell = row.cells[c];
    if (!cell) throw new ClimbError(`La tabla no tiene dato para ${row.altFt} ft con ${table.weightsLb[c]} lb (celda vacía en la fuente).`);
    return cell;
  };
  const read = (q: Quantity): ClimbRead => {
    const byRow = rows.map((row) => {
      const vals = columns.map((c) => {
        const v = cellAt(row, c)[q];
        if (v === undefined) throw new ClimbError(`La fila de ${row.altFt} ft solo da tiempo y combustible: no hay distancia ni TAS.`);
        return v;
      });
      const value = vals.length === 1 ? vals[0] : lerp(w, weights[0], weights[1], vals[0], vals[1]);
      return { altFt: row.altFt, lo: vals[0], hi: vals[vals.length - 1], value };
    });
    const value = byRow.length === 1 ? byRow[0].value : lerp(alt, byRow[0].altFt, byRow[1].altFt, byRow[0].value, byRow[1].value);
    return { byRow, value: r(value) };
  };
  const readAll = { timeMin: read('timeMin'), fuelLb: read('fuelLb') } as Record<Quantity, ClimbRead>;
  // distancia y TAS no existen en la fila de 1500 ft
  const hasDist = rows.every((row) => columns.every((c) => cellAt(row, c).distNm !== undefined));
  if (!hasDist) throw new ClimbError('La fila de 1500 ft solo da tiempo y combustible: no hay distancia ni TAS.');
  readAll.distNm = read('distNm');
  readAll.tasKt = read('tasKt');

  // ajuste por aeropuerto elevado (la tabla empieza en 2000 ft)
  const adj = table.fuelAdjustment;
  const first = adj[0];
  const last = adj[adj.length - 1];
  if (elev > last.elevationFt) throw new ClimbError(`La elevación del aeropuerto (${elev} ft) supera la tabla de ajuste (${last.elevationFt} ft).`);
  let adjustment: ClimbResult['adjustment'];
  if (elev < first.elevationFt) adjustment = { fuelLb: 0, elevationFt: elev, belowTable: true };
  else {
    const k = adj.findIndex((a, i) => elev >= a.elevationFt && (i === adj.length - 1 || elev < adj[i + 1].elevationFt));
    const [a, b] = [adj[k], adj[Math.min(k + 1, adj.length - 1)]];
    adjustment =
      elev === a.elevationFt
        ? { fuelLb: a.fuelLb, elevationFt: elev, belowTable: false }
        : { fuelLb: r(lerp(elev, a.elevationFt, b.elevationFt, a.fuelLb, b.fuelLb)), elevationFt: elev, between: [a.elevationFt, b.elevationFt], belowTable: false };
  }

  const timeMin = readAll.timeMin.value;
  const tableFuelLb = readAll.fuelLb.value;
  const tableDistNm = readAll.distNm.value;
  const windDistNm = r((timeMin / 60) * Math.abs(input.windKt));
  const sign = input.windKind === 'HW' ? -1 : 1;
  return {
    table,
    rows,
    weights,
    columns,
    read: readAll,
    timeMin,
    tableFuelLb,
    tableDistNm,
    tasKt: readAll.tasKt.value,
    adjustment,
    fuelLb: r(tableFuelLb + adjustment.fuelLb),
    windDistNm,
    distNm: r(tableDistNm + sign * windDistNm),
  };
}
