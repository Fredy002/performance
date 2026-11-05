/**
 * Datos numéricos del ascenso en ruta del B-737 (FIGURE 56, 57 y 58).
 * Los valores se leen de las mismas filas que muestran las láminas, no se copian a mano.
 */
import { FIG57_EN_ROUTE_CLIMB_ISA } from './fig57-en-route-climb-isa';
import { FIG58_EN_ROUTE_CLIMB_ISA_PLUS_10 } from './fig58-en-route-climb-isa-plus-10';
import type { FigBlock, FigCell, FigureTable } from './types';

export type ClimbTemp = 'ISA' | 'ISA+10';

/** Celda «TIME/FUEL / DIST./TAS»: la fila de 1500 ft solo da tiempo y combustible. */
export interface ClimbCell {
  timeMin: number;
  fuelLb: number;
  distNm?: number;
  tasKt?: number;
}

export interface ClimbRow {
  altFt: number;
  /** Una celda por peso; undefined si la fuente la deja vacía */
  cells: (ClimbCell | undefined)[];
}

export interface ClimbTable {
  tableId: string;
  figure: string;
  temp: ClimbTemp;
  /** Pesos al soltar frenos, de mayor a menor como en la lámina */
  weightsLb: number[];
  /** Filas de mayor a menor altitud, como en la lámina */
  rows: ClimbRow[];
  /** FUEL ADJUSTMENT FOR HIGH ELEVATION AIRPORTS */
  fuelAdjustment: { elevationFt: number; fuelLb: number }[];
}

function tables(blocks: FigBlock[]): FigCell[][][] {
  return blocks.flatMap((b) =>
    b.type === 'table' ? [b.rows.filter((r): r is FigCell[] => Array.isArray(r))] : b.type === 'columns' ? b.columns.flatMap(tables) : [],
  );
}

function parseCell(t: string): ClimbCell | undefined {
  const m = /^(\d+)\s*\/\s*(\d+)(?:\n(\d+)\s*\/\s*(\d+))?$/.exec(t.trim());
  if (!m) return undefined;
  return { timeMin: Number(m[1]), fuelLb: Number(m[2]), distNm: m[3] ? Number(m[3]) : undefined, tasKt: m[4] ? Number(m[4]) : undefined };
}

function parseClimb(fig: FigureTable, temp: ClimbTemp): ClimbTable {
  const all = tables(fig.sheets.flatMap((s) => s.blocks));
  const main = all.find((rows) => rows.some((r) => String(r[1]?.t).startsWith('TIME/FUEL')))!;
  const weightsRow = main.find((r) => r.length > 5 && r.every((c) => /^\d{5,6}$/.test(String(c.t))))!;
  const weightsLb = weightsRow.map((c) => Number(c.t));
  const rows: ClimbRow[] = main
    .filter((r) => /^\d{4,5}$/.test(String(r[0]?.t)) && String(r[1]?.t).startsWith('TIME/FUEL'))
    .map((r) => ({ altFt: Number(r[0].t), cells: r.slice(2, 2 + weightsLb.length).map((c) => parseCell(String(c.t))) }));
  const flat = all.flat();
  const after = (label: string) => {
    const row = flat.find((r) => r.some((c) => c.t === label))!;
    return row.slice(row.findIndex((c) => c.t === label) + 1).filter((c) => /^-?\d+$/.test(String(c.t))).map((c) => Number(c.t));
  };
  const elevations = after('AIRPORT ELEVATION');
  const adjustments = after('FUEL ADJUSTMENT');
  return {
    tableId: fig.id,
    figure: fig.source.figure,
    temp,
    weightsLb,
    rows,
    fuelAdjustment: elevations.map((e, i) => ({ elevationFt: e, fuelLb: adjustments[i] })),
  };
}

export const CLIMB_TABLES: Record<ClimbTemp, ClimbTable> = {
  ISA: parseClimb(FIG57_EN_ROUTE_CLIMB_ISA, 'ISA'),
  'ISA+10': parseClimb(FIG58_EN_ROUTE_CLIMB_ISA_PLUS_10, 'ISA+10'),
};

/** FIGURE 56: condiciones V-1 a V-5. windKt positivo = de cara (HW), negativo = de cola (TW). */
export interface ClimbScenario {
  id: string;
  weightLb: number;
  cruiseAltFt: number;
  airportElevationFt: number;
  temp: ClimbTemp;
  windKt: number;
}

export const B737_CLIMB_SCENARIOS: ClimbScenario[] = [
  { id: 'V-1', weightLb: 110000, cruiseAltFt: 33000, airportElevationFt: 2000, temp: 'ISA+10', windKt: 20 },
  { id: 'V-2', weightLb: 95000, cruiseAltFt: 27000, airportElevationFt: 3000, temp: 'ISA', windKt: -20 },
  { id: 'V-3', weightLb: 85000, cruiseAltFt: 35000, airportElevationFt: 2000, temp: 'ISA', windKt: 30 },
  { id: 'V-4', weightLb: 105000, cruiseAltFt: 22000, airportElevationFt: 4000, temp: 'ISA+10', windKt: -10 },
  { id: 'V-5', weightLb: 75000, cruiseAltFt: 31000, airportElevationFt: 2000, temp: 'ISA+10', windKt: 40 },
];
