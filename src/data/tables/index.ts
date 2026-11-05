import { FIG53_B737_TAKEOFF_CONDITIONS } from './fig53-b737-takeoff-conditions';
import { FIG54_ALTIMETER_SETTING_PRESSURE_ALTITUDE } from './fig54-altimeter-setting-pressure-altitude';
import { FIG55_B737_TAKEOFF_PERFORMANCE } from './fig55-b737-takeoff-performance';
import { FIG56_B737_EN_ROUTE_CLIMB_CONDITIONS } from './fig56-b737-en-route-climb-conditions';
import { FIG57_EN_ROUTE_CLIMB_ISA } from './fig57-en-route-climb-isa';
import { FIG58_EN_ROUTE_CLIMB_ISA_PLUS_10 } from './fig58-en-route-climb-isa-plus-10';
import { FIG66_OPERATING_CONDITIONS } from './fig66-operating-conditions';
import { FIG67_ABBREVIATED_FLIGHT_PLANNING } from './fig67-abbreviated-flight-planning';
import { FIG69_B737_HOLDING } from './fig69-b737-holding';
import { FIG81_B727_TAKEOFF_CONDITIONS } from './fig81-b727-takeoff-conditions';
import { FIG83_B727_TAKEOFF_PERFORMANCE } from './fig83-b727-takeoff-performance';
import type { PerformanceTable } from './types';

export * from './types';
export {
  FIG53_B737_TAKEOFF_CONDITIONS,
  FIG54_ALTIMETER_SETTING_PRESSURE_ALTITUDE,
  FIG55_B737_TAKEOFF_PERFORMANCE,
  FIG56_B737_EN_ROUTE_CLIMB_CONDITIONS,
  FIG57_EN_ROUTE_CLIMB_ISA,
  FIG58_EN_ROUTE_CLIMB_ISA_PLUS_10,
  FIG66_OPERATING_CONDITIONS,
  FIG67_ABBREVIATED_FLIGHT_PLANNING,
  FIG69_B737_HOLDING,
  FIG81_B727_TAKEOFF_CONDITIONS,
  FIG83_B727_TAKEOFF_PERFORMANCE,
};

/** Biblioteca de tablas de performance de aeronaves digitalizadas. */
export const PERFORMANCE_TABLES: PerformanceTable[] = [
  FIG66_OPERATING_CONDITIONS,
  FIG67_ABBREVIATED_FLIGHT_PLANNING,
  FIG69_B737_HOLDING,
  FIG53_B737_TAKEOFF_CONDITIONS,
  FIG54_ALTIMETER_SETTING_PRESSURE_ALTITUDE,
  FIG55_B737_TAKEOFF_PERFORMANCE,
  FIG56_B737_EN_ROUTE_CLIMB_CONDITIONS,
  FIG57_EN_ROUTE_CLIMB_ISA,
  FIG58_EN_ROUTE_CLIMB_ISA_PLUS_10,
  FIG81_B727_TAKEOFF_CONDITIONS,
  FIG83_B727_TAKEOFF_PERFORMANCE,
];

export function getTable(id: string): PerformanceTable | undefined {
  return PERFORMANCE_TABLES.find((t) => t.id === id);
}

export interface TableGroup {
  primaryId: string;
  title: string;
  summary?: string;
  variants: { id: string; label: string }[];
}

/** One library entry per subject; variants retain their own data and stable URLs. */
export const PERFORMANCE_TABLE_GROUPS: TableGroup[] = [
  {
    primaryId: FIG67_ABBREVIATED_FLIGHT_PLANNING.id,
    title: FIG67_ABBREVIATED_FLIGHT_PLANNING.title,
    variants: [
      { id: FIG67_ABBREVIATED_FLIGHT_PLANNING.id, label: 'Planificación' },
      { id: FIG66_OPERATING_CONDITIONS.id, label: 'Condiciones y ejemplo' },
    ],
  },
  { primaryId: FIG69_B737_HOLDING.id, title: FIG69_B737_HOLDING.title, variants: [{ id: FIG69_B737_HOLDING.id, label: 'Espera' }] },
  {
    primaryId: FIG55_B737_TAKEOFF_PERFORMANCE.id,
    title: 'Despegue del Boeing 737',
    summary: 'EPR, velocidades y ajuste del estabilizador, con las condiciones de los ejercicios de despegue del Boeing 737.',
    variants: [
      { id: FIG55_B737_TAKEOFF_PERFORMANCE.id, label: 'Performance' },
      { id: FIG53_B737_TAKEOFF_CONDITIONS.id, label: 'Condiciones' },
    ],
  },
  { primaryId: FIG54_ALTIMETER_SETTING_PRESSURE_ALTITUDE.id, title: FIG54_ALTIMETER_SETTING_PRESSURE_ALTITUDE.title, variants: [{ id: FIG54_ALTIMETER_SETTING_PRESSURE_ALTITUDE.id, label: 'Altimetría' }] },
  {
    primaryId: FIG57_EN_ROUTE_CLIMB_ISA.id,
    title: 'Ascenso en ruta del Boeing 737',
    summary: 'Tiempo, combustible, distancia y TAS del ascenso 280 kt / Mach .70. Incluye ISA, ISA +10 °C y las condiciones de los ejercicios.',
    variants: [
      { id: FIG57_EN_ROUTE_CLIMB_ISA.id, label: 'ISA' },
      { id: FIG58_EN_ROUTE_CLIMB_ISA_PLUS_10.id, label: 'ISA +10 °C' },
      { id: FIG56_B737_EN_ROUTE_CLIMB_CONDITIONS.id, label: 'Condiciones' },
    ],
  },
  {
    primaryId: FIG83_B727_TAKEOFF_PERFORMANCE.id,
    title: 'Despegue del Boeing 727',
    summary: 'EPR, velocidades y ajuste del estabilizador, con las condiciones de los ejercicios de despegue del Boeing 727.',
    variants: [
      { id: FIG83_B727_TAKEOFF_PERFORMANCE.id, label: 'Performance' },
      { id: FIG81_B727_TAKEOFF_CONDITIONS.id, label: 'Condiciones' },
    ],
  },
];

export function getTableGroup(id: string): TableGroup | undefined {
  return PERFORMANCE_TABLE_GROUPS.find(group => group.variants.some(variant => variant.id === id));
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
