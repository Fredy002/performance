/**
 * Tipos de las tablas de performance digitalizadas.
 * Los datos se transcriben tal cual aparecen en la fuente (FAA, suplemento de
 * examen ATP / Dispatcher). No se corrige ni se completa ningún valor.
 */

export interface TableSource {
  /** Figura de referencia, p. ej. "FIGURE 67" */
  figure: string;
  /** Título original en inglés */
  originalTitle: string;
  document: string;
}

export interface TableHelp {
  /** Para qué sirve la tabla */
  purpose: string;
  /** Glosario de términos y abreviaturas */
  glossary: { term: string; meaning: string }[];
  /** Procedimiento de uso, paso a paso */
  steps: string[];
  /** Advertencias y errores frecuentes */
  tips: string[];
}

interface TableBase {
  id: string;
  title: string;
  aircraft?: string;
  summary: string;
  source: TableSource;
  help: TableHelp;
  /** Tablas que se usan junto con esta */
  related?: string[];
}

/* ---------- Figura 66: escenarios de planificación ---------- */

export type WindKind = 'HW' | 'TW';

export interface OperatingCondition {
  id: string;
  distanceNm: number;
  wind: { speedKt: number; kind: WindKind };
}

export interface ConditionsTable extends TableBase {
  kind: 'conditions';
  conditions: OperatingCondition[];
}

/* ---------- Figura 67: planificación abreviada (1 entrada) ---------- */

export interface FlightPlanningRow {
  distanceNm: number;
  /** Altitud recomendada, rango en pies */
  recAltFt: [number, number];
  tasKt: number;
  airTimeMin: number;
  fuelLb: number;
}

export interface FlightPlanningTable extends TableBase {
  kind: 'flight-planning';
  /** Perfil de vuelo impreso en la cabecera */
  profile: string[];
  rows: FlightPlanningRow[];
  /** Tramos de la fuente que no se incluyeron (filas omitidas en el original) */
  gaps: { afterNm: number; beforeNm: number; note: string }[];
  windCorrection: {
    formulas: string[];
    rule: string;
    example: { distanceNm: number; timeMin: number; fuelLb: number; windKt: number; tasKt: number; deltaFuelLb: number };
  };
}

/* ---------- Figura 69: espera (2 entradas, 3 valores por celda) ---------- */

export interface HoldingCell {
  epr: number;
  iasKt: number;
  /** Flujo de combustible POR MOTOR, lb/h */
  ffPerEngineLbHr: number;
}

export interface HoldingRow {
  /** Nivel de vuelo (015 = 1 500 ft) */
  flightLevel: number;
  /** Una celda por cada peso de `weights`, en el mismo orden */
  cells: HoldingCell[];
}

export interface HoldingTable extends TableBase {
  kind: 'holding';
  engines: number;
  /** Pesos brutos en miles de libras, en el orden de la fuente (decreciente) */
  weightsKlb: number[];
  /** Filas en el orden de la fuente (FL decreciente) */
  rows: HoldingRow[];
  /** Valores que parecen anómalos pero se mantienen tal cual la fuente */
  sourceRemarks: string[];
}

export type PerformanceTable = ConditionsTable | FlightPlanningTable | HoldingTable;
