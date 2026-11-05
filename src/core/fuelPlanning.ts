/**
 * Planificación de combustible de un tramo con alternativo y espera,
 * usando la planificación de vuelo abreviada y la performance de espera.
 */
import { FIG67_ABBREVIATED_FLIGHT_PLANNING, FIG69_B737_HOLDING } from '@/data/tables';
import type { FlightPlanningTable, HoldingTable, WindKind } from '@/data/tables/types';
import { roundTo } from './format';
import { lookupFlightPlanning, lookupHolding, type FlightPlanningLookup, type HoldingLookup } from './tableLookup';

/**
 * Opciones de cálculo.
 * decimals: redondea cada paso a esos decimales antes de usarlo en el siguiente, como en una
 * resolución a mano; así los totales son la suma exacta de los valores mostrados. Sin él, cálculo exacto.
 */
export interface SolveOptions {
  decimals?: number;
}

type Round = (v: number) => number;

export interface LegInput {
  distanceNm: number;
  windKt: number;
  windKind: WindKind;
  /** Nivel de vuelo del enunciado. Informativo: la tabla abreviada asume su altitud recomendada. */
  flightLevel?: number;
}

export interface FuelPlanInput {
  trip: LegInput;
  alternate: LegInput;
  holding: { weightLb: number; flightLevel: number; minutes: number };
  taxiFuelLb: number;
  /**
   * Contingencia sobre el tramo origen – destino (fracción: 0,10 = 10 %).
   * Vuelos internacionales: 10 % de T.T y de T.F, que se suman a la autonomía y al FOB.
   * Vuelos nacionales: 0.
   */
  contingencyPct?: number;
}

export interface LegResult {
  lookup: FlightPlanningLookup;
  deltaTimeMin: number;
  deltaFuelLb: number;
  timeMin: number;
  fuelLb: number;
}

export interface HoldingResult {
  lookup: HoldingLookup;
  engines: number;
  minutes: number;
  /** Combustible por motor durante la espera */
  fuelPerEngineLb: number;
  fuelLb: number;
}

export interface FuelPlanResult {
  trip: LegResult;
  alternate: LegResult;
  holding: HoldingResult;
  taxiFuelLb: number;
  /** Contingencia: porcentaje de T.T y T.F (0 en vuelos nacionales) */
  contingency: { pct: number; timeMin: number; fuelLb: number };
  /** Combustible a bordo: viaje + contingencia + alternativo + espera + rodaje */
  fobLb: number;
  /** Autonomía: tiempo de viaje + contingencia + alternativo + espera (min) */
  enduranceMin: number;
}

function solveLeg(table: FlightPlanningTable, leg: LegInput, r: Round): LegResult {
  const raw = lookupFlightPlanning(table, leg.distanceNm);
  // valores interpolados redondeados como se escriben en el desarrollo
  const lookup = { ...raw, tasKt: r(raw.tasKt), airTimeMin: r(raw.airTimeMin), fuelLb: r(raw.fuelLb) };
  // misma fórmula que windCorrection(): Δ = valor × viento ÷ TAS; se suma con HW y se resta con TW
  const sign = leg.windKind === 'HW' ? 1 : -1;
  const dTime = r((lookup.airTimeMin * leg.windKt) / lookup.tasKt);
  const dFuel = r((lookup.fuelLb * leg.windKt) / lookup.tasKt);
  return {
    lookup,
    deltaTimeMin: sign * dTime,
    deltaFuelLb: sign * dFuel,
    timeMin: r(lookup.airTimeMin + sign * dTime),
    fuelLb: r(lookup.fuelLb + sign * dFuel),
  };
}

export function solveFuelPlan(
  input: FuelPlanInput,
  tables: { planning: FlightPlanningTable; holding: HoldingTable } = {
    planning: FIG67_ABBREVIATED_FLIGHT_PLANNING,
    holding: FIG69_B737_HOLDING,
  },
  { decimals }: SolveOptions = {},
): FuelPlanResult {
  const r: Round = decimals === undefined ? (v) => v : (v) => roundTo(v, decimals);
  const trip = solveLeg(tables.planning, input.trip, r);
  const alternate = solveLeg(tables.planning, input.alternate, r);

  const raw = lookupHolding(tables.holding, input.holding.flightLevel, input.holding.weightLb / 1000);
  const hl = { ...raw, ffPerEngineLbHr: r(raw.ffPerEngineLbHr) };
  const fuelPerEngineLb = r((hl.ffPerEngineLbHr * input.holding.minutes) / 60);
  const holding: HoldingResult = {
    lookup: hl,
    engines: tables.holding.engines,
    minutes: input.holding.minutes,
    fuelPerEngineLb,
    fuelLb: r(fuelPerEngineLb * tables.holding.engines),
  };

  const pct = input.contingencyPct ?? 0;
  const contingency = { pct, timeMin: r(trip.timeMin * pct), fuelLb: r(trip.fuelLb * pct) };

  return {
    trip,
    alternate,
    holding,
    taxiFuelLb: input.taxiFuelLb,
    contingency,
    // la suma de valores ya redondeados se vuelve a redondear solo para quitar el ruido binario
    fobLb: r(trip.fuelLb + contingency.fuelLb + alternate.fuelLb + holding.fuelLb + input.taxiFuelLb),
    enduranceMin: r(trip.timeMin + contingency.timeMin + alternate.timeMin + holding.minutes),
  };
}
