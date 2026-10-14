import { FIG66_OPERATING_CONDITIONS } from './fig66-operating-conditions';
import { FIG67_ABBREVIATED_FLIGHT_PLANNING } from './fig67-abbreviated-flight-planning';
import { FIG69_B737_HOLDING } from './fig69-b737-holding';
import type { PerformanceTable } from './types';

export * from './types';
export { FIG66_OPERATING_CONDITIONS, FIG67_ABBREVIATED_FLIGHT_PLANNING, FIG69_B737_HOLDING };

/** Biblioteca de tablas de performance de aeronaves digitalizadas. */
export const PERFORMANCE_TABLES: PerformanceTable[] = [
  FIG66_OPERATING_CONDITIONS,
  FIG67_ABBREVIATED_FLIGHT_PLANNING,
  FIG69_B737_HOLDING,
];

export function getTable(id: string): PerformanceTable | undefined {
  return PERFORMANCE_TABLES.find((t) => t.id === id);
}

/**
 * Corrección de tiempo y combustible por viento (planificación de vuelo abreviada).
 * Positivo = se suma (viento de cara), negativo = se resta (viento de cola).
 */
export function windCorrection(timeMin: number, fuelLb: number, windKt: number, tasKt: number, kind: 'HW' | 'TW') {
  const sign = kind === 'HW' ? 1 : -1;
  const deltaTime = (timeMin * windKt) / tasKt;
  const deltaFuel = (fuelLb * windKt) / tasKt;
  return {
    deltaTimeMin: sign * deltaTime,
    deltaFuelLb: sign * deltaFuel,
    timeMin: timeMin + sign * deltaTime,
    fuelLb: fuelLb + sign * deltaFuel,
  };
}
