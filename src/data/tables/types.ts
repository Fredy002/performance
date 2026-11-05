/**
 * Tipos de las tablas de performance digitalizadas.
 * Los datos se transcriben tal cual aparecen en la fuente (FAA, suplemento de
 * examen ATP / Dispatcher). No se corrige ni se completa ningún valor.
 */

export interface TableSource {
  /** Figura del documento original (solo trazabilidad; no se muestra en la interfaz) */
  figure: string;
  /** Título original en inglés */
  originalTitle: string;
  document: string;
  /** Publication links identify the reviewed edition instead of mixing revisions. */
  references?: { label: string; url: string }[];
  /** Equivalent source sheets share one library entry. */
  equivalentFigures?: string[];
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
  /** Identificador estable; también es el segmento de la URL */
  id: string;
  title: string;
  /** Área de operación a la que pertenece (p. ej. «Planificación de vuelo») */
  category: string;
  aircraft?: string;
  summary: string;
  source: TableSource;
  help: TableHelp;
  /** Tablas que se usan junto con esta */
  related?: string[];
}

/* ---------- Escenarios de planificación (datos de ejercicio) ---------- */

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

/* ---------- Planificación de vuelo abreviada (1 entrada) ---------- */

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

/* ---------- Performance de espera (2 entradas, 3 valores por celda) ---------- */

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

/* ---------- Digitized source content with semantic cell relationships ---------- */

/**
 * Source text with `\n` line breaks.
 * Minimal markup: `_{…}` for subscripts and `^{…}` for superscripts.
 */
export type FigText = string;

export type FigAlign = 'left' | 'center' | 'right';

export interface FigCell {
  t: FigText;
  /** colspan */
  cs?: number;
  /** rowspan */
  rs?: number;
  /** Header cell */
  h?: boolean;
  align?: FigAlign;
  /** Source vertical alignment hint */
  valign?: 'top' | 'middle' | 'bottom';
  bold?: boolean;
  /** Shaded area in the source */
  shaded?: boolean;
  /** Source cell without borders */
  bare?: boolean;
  /** Open source borders: top, right, bottom, left */
  open?: ('t' | 'r' | 'b' | 'l')[];
  /** Source small-print hint */
  small?: boolean;
  /** Source arrow label, such as TEMP LIMIT EPR */
  arrow?: boolean;
  /** Independent pressure limit linked by a pointer in the source */
  pointer?: boolean;
  /** Source staggered range layout hint */
  stagger?: boolean;
}

/** A break identifies rows omitted from the publication */
export interface FigBreakRow {
  break: true;
  /** Number of parallel lines in the source break marker */
  lines?: number;
}

export type FigRow = FigCell[] | FigBreakRow;

export interface FigScaleMark {
  label: FigText;
  /** Vertical position from 0 (top) to 1 (bottom) */
  pos: number;
}

export type FigBlock =
  | { type: 'heading'; text: FigText; size?: 'xl' | 'lg' | 'md' | 'sm'; align?: FigAlign; boxed?: boolean }
  | { type: 'text'; text: FigText; align?: FigAlign; bold?: boolean; size?: 'sm' | 'md' | 'lg'; boxed?: boolean }
  | { type: 'list'; items: { marker: FigText; text: FigText }[] }
  | {
      type: 'table';
      rows: FigRow[];
      /** Number of initial header rows */
      headerRows?: number;
      /** Source heavy-border hint */
      heavy?: boolean;
      /** Source relative column-width hints */
      colWidths?: string[];
      /** Source dense-table hint */
      dense?: boolean;
      align?: FigAlign;
    }
  | {
      /** Vertical ruler with left and right scales */
      type: 'scale';
      title: FigText;
      leftUnit: FigText;
      rightUnit: FigText;
      left: FigScaleMark[];
      right: FigScaleMark[];
      /** Number of minor divisions across the ruler */
      minorTicks: number;
    }
  | { type: 'columns'; widths?: string[]; align?: 'start' | 'center' | 'end' | 'stretch'; columns: FigBlock[][] }
  | { type: 'spacer'; size?: 'sm' | 'md' | 'lg' };

export interface FigureTable extends TableBase {
  kind: 'figure';
  /** Source limitations that affect interpretation and must stay visible. */
  cautions?: string[];
  /** One or more source sheets, rendered with the application design system */
  sheets: {
    blocks: FigBlock[];
    /** Original caption without the traceability prefix stored in source.figure */
    caption: FigText;
  }[];
  /** Source uncertainties and review findings */
  uncertain?: string[];
}

export type PerformanceTable = ConditionsTable | FlightPlanningTable | HoldingTable | FigureTable;
