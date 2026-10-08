/**
 * Atmósfera Estándar Internacional (ISA) — troposfera (hasta 36 089 ft).
 * Unidades: pies, °C, hPa.
 */

export const ISA_SEA_LEVEL_TEMP_C = 15;
export const ISA_SEA_LEVEL_PRESSURE_HPA = 1013.25;
export const ISA_LAPSE_RATE_C_PER_FT = 0.0019812; // 1.98 °C / 1000 ft
export const TROPOPAUSE_FT = 36089;

const KELVIN = 273.15;

/** Temperatura ISA a una altitud de presión dada. */
export function isaTemperature(pressureAltitudeFt: number): number {
  const h = Math.min(pressureAltitudeFt, TROPOPAUSE_FT);
  return ISA_SEA_LEVEL_TEMP_C - ISA_LAPSE_RATE_C_PER_FT * h;
}

/** Presión estática ISA (hPa) a una altitud de presión dada. */
export function isaPressure(pressureAltitudeFt: number): number {
  return ISA_SEA_LEVEL_PRESSURE_HPA * Math.pow(1 - 6.8755856e-6 * pressureAltitudeFt, 5.2558797);
}

/** Altitud de presión a partir de la elevación y el QNH. */
export function pressureAltitude(elevationFt: number, qnhHpa: number): number {
  return elevationFt + 145366.45 * (1 - Math.pow(qnhHpa / ISA_SEA_LEVEL_PRESSURE_HPA, 0.190284));
}

/** Relación de densidad σ = ρ / ρ0. */
export function densityRatio(pressureAltitudeFt: number, oatC: number): number {
  const pressureRatio = isaPressure(pressureAltitudeFt) / ISA_SEA_LEVEL_PRESSURE_HPA;
  const tempRatio = (oatC + KELVIN) / (ISA_SEA_LEVEL_TEMP_C + KELVIN);
  return pressureRatio / tempRatio;
}

/** Altitud de densidad exacta (troposfera). */
export function densityAltitude(pressureAltitudeFt: number, oatC: number): number {
  const sigma = densityRatio(pressureAltitudeFt, oatC);
  return 145442.16 * (1 - Math.pow(sigma, 0.234969));
}

/** Regla rápida: DA ≈ PA + 120 × (OAT − ISA). */
export function densityAltitudeRuleOfThumb(pressureAltitudeFt: number, oatC: number): number {
  return pressureAltitudeFt + 120 * (oatC - isaTemperature(pressureAltitudeFt));
}

export interface AtmosphereReport {
  pressureAltitude: number;
  isaTemp: number;
  isaDeviation: number;
  densityAltitude: number;
  densityAltitudeApprox: number;
  densityRatio: number;
  staticPressure: number;
}

export function atmosphereReport(elevationFt: number, qnhHpa: number, oatC: number): AtmosphereReport {
  const pa = pressureAltitude(elevationFt, qnhHpa);
  const isaTemp = isaTemperature(pa);
  return {
    pressureAltitude: pa,
    isaTemp,
    isaDeviation: oatC - isaTemp,
    densityAltitude: densityAltitude(pa, oatC),
    densityAltitudeApprox: densityAltitudeRuleOfThumb(pa, oatC),
    densityRatio: densityRatio(pa, oatC),
    staticPressure: isaPressure(pa),
  };
}
