/**
 * EPR de despegue del B-737 (FIGURE 55, TAKEOFF EPR) con el método impreso en la tabla:
 *  ① TEMP LIMIT EPR: fila de la OAT (interpolando entre columnas si hace falta);
 *     con el aire acondicionado OFF se suma +.03 (como en la resolución del curso).
 *  ② PRESS LIMIT EPR: recuadros por altitud de presión, interpolando entre ellos.
 *  ③ Se usa el menor de los dos límites. Antihielo de motor: corrección cero.
 * La altitud de presión sale del reglaje (FIGURE 54), igual que en el B-727.
 */
import {
  B737_EPR_CORRECTIONS,
  B737_EPR_OAT_F,
  B737_PRESS_LIMIT_EPR,
  B737_TEMP_LIMIT_EPR,
  type AltimeterUnit,
  type TempUnit,
} from '@/data/tables/takeoffEprData';
import { roundTo } from './format';
import { EPR_DECIMALS, pressureAltitude, TakeoffEprError, toFahrenheit, type PressureAltitudeStep } from './takeoffEpr';

export interface B737EprInput {
  elevationFt: number;
  altimeter: number;
  altimeterUnit: AltimeterUnit;
  temperature: number;
  temperatureUnit: TempUnit;
  airConditioning: boolean;
  engineAntiIce: boolean;
}

export interface B737TempLimit {
  /** Columnas usadas (índices); dos si la OAT está entre columnas */
  columns: number[];
  ratio?: number;
  /** Valor leído de la fila TEMP LIMIT EPR */
  table: number;
  /** Corrección por aire acondicionado OFF (+.03) o 0 */
  airCondCorrection: number;
  /** Límite por temperatura ya corregido */
  limit: number;
}

export interface B737PressLimit {
  lo: (typeof B737_PRESS_LIMIT_EPR)[number];
  hi: (typeof B737_PRESS_LIMIT_EPR)[number];
  /** Recuadro exacto o «5660 AND ABOVE»: no se interpola */
  exact: boolean;
  limit: number;
}

export interface B737EprResult {
  pressure: PressureAltitudeStep;
  oatF: number;
  temp: B737TempLimit;
  press: B737PressLimit;
  /** Límite que manda: el menor de los dos */
  governing: 'temp' | 'press';
  /** Menor de los dos límites, sin redondear */
  epr: number;
  /** Resultado con 2 decimales */
  final: number;
}

const TOLERANCE_F = 0.5;

export function solveB737TakeoffEpr(input: B737EprInput): B737EprResult {
  const pressure = pressureAltitude(input.elevationFt, input.altimeter, input.altimeterUnit);
  if (!Number.isFinite(input.temperature)) throw new TakeoffEprError('La temperatura debe ser un número.');
  const oatF = toFahrenheit(input.temperature, input.temperatureUnit);
  const cols = B737_EPR_OAT_F;
  const [minF, maxF] = [cols[0], cols[cols.length - 1]];
  // tolerancia por la conversión: 49 °C = 120,2 °F figura en la columna de 120 °F
  if (oatF < minF - TOLERANCE_F || oatF > maxF + TOLERANCE_F) {
    throw new TakeoffEprError(`La OAT (${roundTo(oatF, 1)} °F) está fuera de la tabla (de ${minF} a ${maxF} °F).`);
  }
  const t = Math.min(Math.max(oatF, minF), maxF);

  // ① límite por temperatura
  let columns: number[];
  let ratio: number | undefined;
  const exact = cols.findIndex((f) => Math.abs(f - t) < 1e-9);
  if (exact >= 0) columns = [exact];
  else {
    const k = cols.findIndex((f, j) => t > f && t < cols[j + 1]);
    columns = [k, k + 1];
    ratio = (t - cols[k]) / (cols[k + 1] - cols[k]);
  }
  const tv = columns.map((c) => B737_TEMP_LIMIT_EPR[c]);
  const tempTable = tv.length === 1 ? tv[0] : tv[0] + (tv[1] - tv[0]) * (ratio ?? 0);
  const airCondCorrection = input.airConditioning ? 0 : B737_EPR_CORRECTIONS.airCondOff;
  const temp: B737TempLimit = { columns, ratio, table: tempTable, airCondCorrection, limit: tempTable + airCondCorrection };

  // ② límite por presión
  const pa = pressure.pressureAltitudeFt;
  const boxes = B737_PRESS_LIMIT_EPR;
  const first = boxes[0];
  const last = boxes[boxes.length - 1];
  if (pa < first.altFt) throw new TakeoffEprError(`La altitud de presión (${pa} ft) está por debajo de la tabla (${first.altFt} ft).`);
  let press: B737PressLimit;
  if (pa >= last.altFt) press = { lo: last, hi: last, exact: true, limit: last.epr };
  else {
    const k = boxes.findIndex((b, j) => pa >= b.altFt && pa < boxes[j + 1].altFt);
    const [lo, hi] = [boxes[k], boxes[k + 1]];
    press =
      pa === lo.altFt
        ? { lo, hi: lo, exact: true, limit: lo.epr }
        : { lo, hi, exact: false, limit: lo.epr + ((hi.epr - lo.epr) * (pa - lo.altFt)) / (hi.altFt - lo.altFt) };
  }

  // ③ el menor de los dos
  const governing = temp.limit <= press.limit ? 'temp' : 'press';
  const epr = Math.min(temp.limit, press.limit);
  return { pressure, oatF, temp, press, governing, epr, final: roundTo(epr, EPR_DECIMALS) };
}
