/**
 * Datos numéricos para calcular el EPR de despegue del B-727 (FIGURE 81, 82/54 y 83) y del
 * B-737 (FIGURE 53, 54 y 55), leídos de las mismas filas que muestran las láminas.
 */
import { QNH_ROWS } from './fig54-altimeter-setting-pressure-altitude';
import { EPR_OAT, MAX_TAKEOFF_EPR_ROWS } from './fig83-b727-takeoff-performance';
import { OAT_F as B737_OAT_F_SRC, OAT_C as B737_OAT_C_SRC, TEMP_LIMIT as B737_TEMP_LIMIT_SRC } from './fig55-b737-takeoff-performance';

export type AltimeterUnit = 'inHg' | 'mb';
export type TempUnit = 'F' | 'C';

/** FIGURE 82 (= 54): intervalo de QNH → corrección a la elevación (ft). */
export interface QnhRow {
  inHg: [number, number];
  mb: [number, number];
  correctionFt: number;
}

export const QNH_TO_PRESSURE_ALTITUDE: QnhRow[] = QNH_ROWS.map(([a, b, corr, c, d]) => ({
  inHg: [Number(a), Number(b)],
  mb: [Number(c), Number(d)],
  correctionFt: Number(corr),
}));

/**
 * FIGURE 83, MAX TAKEOFF EPR. Columnas de OAT en °F; la primera es el intervalo «-67 TO -9 °F»
 * (-55 a -23 °C), que se toma como valor constante y se sitúa en -9 °F para interpolar.
 */
export const EPR_OAT_F: number[] = EPR_OAT.map(([f], i) => (i === 0 ? -9 : Number(f)));
export const EPR_OAT_C: number[] = EPR_OAT.map(([, c], i) => (i === 0 ? -23 : Number(c)));
/** Límite inferior del primer intervalo de OAT (-67 °F = -55 °C). */
export const EPR_MIN_OAT_F = -67;
export const EPR_MAX_OAT_F = 120;

export interface EprRow {
  label: string;
  altFt: number;
  eng13: number[];
  eng2: number[];
}

export const MAX_TAKEOFF_EPR: EprRow[] = MAX_TAKEOFF_EPR_ROWS.map((r) => ({
  label: r.label.replace('\n', ' '),
  altFt: r.altFt,
  eng13: r.eng13.map(Number),
  eng2: r.eng2.map(Number),
}));

/** EPR BLEED CORRECTIONS y nota de la 6.ª etapa (FIGURE 83). */
export const EPR_CORRECTIONS = {
  /** Aire acondicionado OFF: +.04 a los motores 1 y 3 (la tabla supone ON). */
  airCondOffEng13: 0.04,
  /** Antihielo del motor ON: −.03 al motor 2. */
  antiIceOnEng2: -0.03,
  /** 6.ª etapa ON (si está instalada): −.05 al motor 2 con OAT de 10 °C (50 °F) o más. */
  sixthStageOnEng2: -0.05,
  sixthStageMinOatF: 50,
} as const;

/** FIGURE 81: condiciones de los ejercicios G-1 a G-5. */
export interface B727Scenario {
  id: string;
  elevationFt: number;
  altimeter: number;
  altimeterUnit: AltimeterUnit;
  temperature: number;
  temperatureUnit: TempUnit;
  /** AIR COND ENGS 1 AND 3 */
  airCondEng13: boolean;
  /** ANTI-ICE ENG 2 */
  antiIceEng2: boolean;
  grossWeightKlb: number;
  /** 6TH STAGE BLEED */
  sixthStageBleed: boolean;
  flapsDeg: number;
  cgStation: number;
}

export const B727_TAKEOFF_SCENARIOS: B727Scenario[] = [
  { id: 'G-1', elevationFt: 1050, altimeter: 29.36, altimeterUnit: 'inHg', temperature: 23, temperatureUnit: 'F', airCondEng13: false, antiIceEng2: true, grossWeightKlb: 140, sixthStageBleed: false, flapsDeg: 15, cgStation: 911.2 },
  { id: 'G-2', elevationFt: 2000, altimeter: 1016, altimeterUnit: 'mb', temperature: 10, temperatureUnit: 'C', airCondEng13: true, antiIceEng2: false, grossWeightKlb: 190, sixthStageBleed: true, flapsDeg: 5, cgStation: 882.2 },
  { id: 'G-3', elevationFt: 4350, altimeter: 30.1, altimeterUnit: 'inHg', temperature: 68, temperatureUnit: 'F', airCondEng13: true, antiIceEng2: false, grossWeightKlb: 180, sixthStageBleed: true, flapsDeg: 25, cgStation: 914.8 },
  { id: 'G-4', elevationFt: 3050, altimeter: 1010, altimeterUnit: 'mb', temperature: -5, temperatureUnit: 'C', airCondEng13: true, antiIceEng2: true, grossWeightKlb: 160, sixthStageBleed: false, flapsDeg: 15, cgStation: 932.9 },
  { id: 'G-5', elevationFt: 2150, altimeter: 29.54, altimeterUnit: 'inHg', temperature: 5, temperatureUnit: 'F', airCondEng13: true, antiIceEng2: true, grossWeightKlb: 120, sixthStageBleed: false, flapsDeg: 5, cgStation: 925.6 },
];

/* ======================================================================
   Boeing 737 (FIGURE 53 y 55): TAKEOFF EPR con límite por temperatura y por presión
   ====================================================================== */

export const B737_EPR_OAT_F: number[] = B737_OAT_F_SRC.map(Number);
export const B737_EPR_OAT_C: number[] = B737_OAT_C_SRC.map(Number);
/** Fila TEMP LIMIT EPR (una por columna de OAT). */
export const B737_TEMP_LIMIT_EPR: number[] = B737_TEMP_LIMIT_SRC.map(Number);

/**
 * Recuadros PRESS LIMIT EPR, de menor a mayor altitud de presión.
 * La lámina los dibuja como flechas bajo la fila de OAT; label es el texto de cada recuadro.
 */
export const B737_PRESS_LIMIT_EPR: { altFt: number; label: string; epr: number }[] = [
  { altFt: -1000, label: '-1000', epr: 1.96 },
  { altFt: 0, label: 'S.L.', epr: 2.01 },
  { altFt: 1000, label: '1000', epr: 2.06 },
  { altFt: 2000, label: '2000', epr: 2.11 },
  { altFt: 3000, label: '3000', epr: 2.16 },
  { altFt: 4000, label: '4000', epr: 2.22 },
  { altFt: 5660, label: 'ALT  5660 AND ABOVE', epr: 2.31 },
];

/** EPR BLEED CORRECTIONS del B737: aire acondicionado OFF +.03; antihielo de motor ZERO. */
export const B737_EPR_CORRECTIONS = { airCondOff: 0.03, antiIce: 0 } as const;

/** FIGURE 53: condiciones R-1 a R-5. */
export interface B737Scenario {
  id: string;
  elevationFt: number;
  altimeter: number;
  altimeterUnit: AltimeterUnit;
  temperature: number;
  temperatureUnit: TempUnit;
  weightKlb: number;
  flapsDeg: number;
  /** Viento en kt: positivo de cara (HW), negativo de cola (TW) */
  windKt: number;
  /** Pendiente de pista en %: positiva hacia arriba (UP) */
  slopePct: number;
  airConditioning: boolean;
  engineAntiIce: boolean;
  cgStation: number;
}

export const B737_TAKEOFF_SCENARIOS: B737Scenario[] = [
  { id: 'R-1', elevationFt: 100, altimeter: 29.5, altimeterUnit: 'inHg', temperature: 50, temperatureUnit: 'F', weightKlb: 90, flapsDeg: 15, windKt: 5, slopePct: 1, airConditioning: true, engineAntiIce: false, cgStation: 635.7 },
  { id: 'R-2', elevationFt: 4000, altimeter: 1032, altimeterUnit: 'mb', temperature: -15, temperatureUnit: 'C', weightKlb: 110, flapsDeg: 5, windKt: -5, slopePct: -1, airConditioning: true, engineAntiIce: true, cgStation: 643.8 },
  { id: 'R-3', elevationFt: 950, altimeter: 29.4, altimeterUnit: 'inHg', temperature: 59, temperatureUnit: 'F', weightKlb: 100, flapsDeg: 5, windKt: 20, slopePct: 1, airConditioning: false, engineAntiIce: false, cgStation: 665.2 },
  { id: 'R-4', elevationFt: 2000, altimeter: 1017, altimeterUnit: 'mb', temperature: 0, temperatureUnit: 'C', weightKlb: 85, flapsDeg: 1, windKt: -10, slopePct: -2, airConditioning: true, engineAntiIce: true, cgStation: 657.2 },
  { id: 'R-5', elevationFt: 50, altimeter: 30.15, altimeterUnit: 'inHg', temperature: 95, temperatureUnit: 'F', weightKlb: 95, flapsDeg: 1, windKt: 7, slopePct: 1.5, airConditioning: false, engineAntiIce: false, cgStation: 638.4 },
];
