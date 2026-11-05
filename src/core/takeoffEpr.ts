/**
 * EPR máximo de despegue del B-727 (FIGURE 83) con el método del curso:
 *  1. Altitud de presión = elevación + corrección del QNH (FIGURE 82).
 *  2. Columna de OAT (se convierte °C → °F si hace falta).
 *  3. Interpolación lineal entre las filas de altitud (y entre columnas de OAT si no es exacta),
 *     por separado para los motores 1 y 3 y para el motor 2.
 *  4. Correcciones por sangrado (aire acondicionado, antihielo, 6.ª etapa).
 *  5. Resultado redondeado a 2 decimales, como el EPR de la tabla.
 */
import {
  EPR_CORRECTIONS,
  EPR_MAX_OAT_F,
  EPR_MIN_OAT_F,
  EPR_OAT_F,
  MAX_TAKEOFF_EPR,
  QNH_TO_PRESSURE_ALTITUDE,
  type AltimeterUnit,
  type EprRow,
  type QnhRow,
  type TempUnit,
} from '@/data/tables/takeoffEprData';
import { roundTo } from './format';

export class TakeoffEprError extends Error {}

/** Decimales del EPR en la tabla y en el resultado final. */
export const EPR_DECIMALS = 2;

export interface TakeoffEprInput {
  elevationFt: number;
  altimeter: number;
  altimeterUnit: AltimeterUnit;
  temperature: number;
  temperatureUnit: TempUnit;
  /** Aire acondicionado de los motores 1 y 3 conectado */
  airCondEng13: boolean;
  /** Antihielo del motor 2 conectado */
  antiIceEng2: boolean;
  /** Sangrado de 6.ª etapa conectado */
  sixthStageBleed: boolean;
}

export interface PressureAltitudeStep {
  row: QnhRow;
  correctionFt: number;
  pressureAltitudeFt: number;
  /** El QNH coincide con el límite de dos filas (la tabla repite los extremos) */
  boundary?: { otherCorrectionFt: number };
}

/** Interpolación por altitud en una columna: A1 + (B1 − A1)(C − A)/(B − A). */
export interface AltInterpolation {
  lo: EprRow;
  hi: EprRow;
  a1: number;
  b1: number;
  value: number;
  /** Fila exacta o fila «3856 & ABOVE»: no se interpola */
  exact: boolean;
}

export interface EngineEpr {
  /** Interpolación por altitud en cada columna de OAT usada (1 o 2 columnas) */
  byColumn: AltInterpolation[];
  /** Valor de la tabla (interpolado) antes de correcciones */
  table: number;
  corrections: { label: string; value: number }[];
  /** Tabla + correcciones, sin redondear */
  corrected: number;
  /** Resultado final con 2 decimales */
  final: number;
}

export interface TakeoffEprResult {
  pressure: PressureAltitudeStep;
  oatF: number;
  /** Columnas de OAT usadas (índices); dos si se interpola entre columnas */
  columns: number[];
  /** Fracción entre las dos columnas (0–1) cuando la OAT no coincide con una columna */
  oatRatio?: number;
  /** Primer intervalo de OAT (-67 a -9 °F), valor constante */
  coldRange: boolean;
  eng13: EngineEpr;
  eng2: EngineEpr;
}

export const toFahrenheit = (t: number, unit: TempUnit) => (unit === 'F' ? t : (t * 9) / 5 + 32);

export function pressureAltitude(elevationFt: number, altimeter: number, unit: AltimeterUnit): PressureAltitudeStep {
  if (![elevationFt, altimeter].every(Number.isFinite)) throw new TakeoffEprError('Elevación y reglaje deben ser números.');
  const range = (r: QnhRow) => (unit === 'inHg' ? r.inHg : r.mb);
  // Primera fila que contiene el valor. Los extremos se repiten entre filas consecutivas:
  // en ese caso se toma la fila en la que el valor es el límite superior y se avisa.
  const i = QNH_TO_PRESSURE_ALTITUDE.findIndex((r) => altimeter >= range(r)[0] && altimeter <= range(r)[1]);
  if (i < 0) {
    const all = QNH_TO_PRESSURE_ALTITUDE.map(range);
    const [min, max] = [all[0][0], all[all.length - 1][1]];
    throw new TakeoffEprError(
      `El reglaje ${altimeter} ${unit === 'inHg' ? 'in.Hg' : 'mb'} está fuera de la tabla (de ${min} a ${max}). Revisa la unidad: pulgadas o milibares.`,
    );
  }
  const row = QNH_TO_PRESSURE_ALTITUDE[i];
  const next = QNH_TO_PRESSURE_ALTITUDE[i + 1];
  const boundary = next && altimeter === range(row)[1] && altimeter === range(next)[0] ? { otherCorrectionFt: next.correctionFt } : undefined;
  return { row, correctionFt: row.correctionFt, pressureAltitudeFt: elevationFt + row.correctionFt, boundary };
}

function interpolateAltitude(pa: number, col: number, engine: 'eng13' | 'eng2'): AltInterpolation {
  const rows = MAX_TAKEOFF_EPR;
  const first = rows[0];
  const last = rows[rows.length - 1];
  if (pa < first.altFt) throw new TakeoffEprError(`La altitud de presión (${pa} ft) está por debajo de la tabla (${first.altFt} ft).`);
  // «3856 & ABOVE»: desde 3856 ft se usa esa fila sin interpolar
  if (pa >= last.altFt) return { lo: last, hi: last, a1: last[engine][col], b1: last[engine][col], value: last[engine][col], exact: true };
  const k = rows.findIndex((r, j) => pa >= r.altFt && pa < rows[j + 1].altFt);
  const lo = rows[k];
  const hi = rows[k + 1];
  const a1 = lo[engine][col];
  const b1 = hi[engine][col];
  if (pa === lo.altFt) return { lo, hi: lo, a1, b1: a1, value: a1, exact: true };
  return { lo, hi, a1, b1, value: a1 + ((b1 - a1) * (pa - lo.altFt)) / (hi.altFt - lo.altFt), exact: false };
}

export function solveTakeoffEpr(input: TakeoffEprInput): TakeoffEprResult {
  const pressure = pressureAltitude(input.elevationFt, input.altimeter, input.altimeterUnit);
  if (!Number.isFinite(input.temperature)) throw new TakeoffEprError('La temperatura debe ser un número.');
  const oatF = toFahrenheit(input.temperature, input.temperatureUnit);
  // tolerancia por la conversión: 49 °C = 120,2 °F figura en la columna de 120 °F
  if (oatF < EPR_MIN_OAT_F - 0.5 || oatF > EPR_MAX_OAT_F + 0.5) {
    throw new TakeoffEprError(`La OAT (${roundTo(oatF, 1)} °F) está fuera de la tabla (de ${EPR_MIN_OAT_F} a ${EPR_MAX_OAT_F} °F).`);
  }
  const t = Math.min(Math.max(oatF, EPR_MIN_OAT_F), EPR_MAX_OAT_F);
  const coldRange = t <= EPR_OAT_F[0];
  let columns: number[];
  let oatRatio: number | undefined;
  if (coldRange) columns = [0];
  else {
    const exact = EPR_OAT_F.findIndex((f) => Math.abs(f - t) < 1e-9);
    if (exact >= 0) columns = [exact];
    else {
      const k = EPR_OAT_F.findIndex((f, j) => t > f && t < EPR_OAT_F[j + 1]);
      columns = [k, k + 1];
      oatRatio = (t - EPR_OAT_F[k]) / (EPR_OAT_F[k + 1] - EPR_OAT_F[k]);
    }
  }

  const engine = (key: 'eng13' | 'eng2'): EngineEpr => {
    const byColumn = columns.map((c) => interpolateAltitude(pressure.pressureAltitudeFt, c, key));
    const table = byColumn.length === 1 ? byColumn[0].value : byColumn[0].value + (byColumn[1].value - byColumn[0].value) * (oatRatio ?? 0);
    const corrections: { label: string; value: number }[] = [];
    if (key === 'eng13' && !input.airCondEng13) corrections.push({ label: 'Aire acondicionado OFF', value: EPR_CORRECTIONS.airCondOffEng13 });
    if (key === 'eng2' && input.antiIceEng2) corrections.push({ label: 'Antihielo del motor 2 ON', value: EPR_CORRECTIONS.antiIceOnEng2 });
    if (key === 'eng2' && input.sixthStageBleed && oatF >= EPR_CORRECTIONS.sixthStageMinOatF) {
      corrections.push({ label: '6.ª etapa ON con OAT ≥ 10 °C (50 °F)', value: EPR_CORRECTIONS.sixthStageOnEng2 });
    }
    const corrected = corrections.reduce((acc, c) => acc + c.value, table);
    return { byColumn, table, corrections, corrected, final: roundTo(corrected, EPR_DECIMALS) };
  };

  return { pressure, oatF, columns, oatRatio, coldRange, eng13: engine('eng13'), eng2: engine('eng2') };
}
