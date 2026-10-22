/**
 * Planificación de combustible de un tramo con alternativo y espera,
 * usando la planificación de vuelo abreviada y la performance de espera.
 */
import { FIG67_ABBREVIATED_FLIGHT_PLANNING, FIG69_B737_HOLDING, windCorrection } from '@/data/tables';
import type { FlightPlanningTable, HoldingTable, WindKind } from '@/data/tables/types';
import { lookupFlightPlanning, lookupHolding, type FlightPlanningLookup, type HoldingLookup } from './tableLookup';

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
  /** Combustible a bordo: viaje + alternativo + espera + rodaje */
  fobLb: number;
  /** Autonomía: tiempo de viaje + alternativo + espera (min) */
  enduranceMin: number;
}

function solveLeg(table: FlightPlanningTable, leg: LegInput): LegResult {
  const lookup = lookupFlightPlanning(table, leg.distanceNm);
  const w = windCorrection(lookup.airTimeMin, lookup.fuelLb, leg.windKt, lookup.tasKt, leg.windKind);
  return { lookup, deltaTimeMin: w.deltaTimeMin, deltaFuelLb: w.deltaFuelLb, timeMin: w.timeMin, fuelLb: w.fuelLb };
}

export function solveFuelPlan(
  input: FuelPlanInput,
  tables: { planning: FlightPlanningTable; holding: HoldingTable } = {
    planning: FIG67_ABBREVIATED_FLIGHT_PLANNING,
    holding: FIG69_B737_HOLDING,
  },
): FuelPlanResult {
  const trip = solveLeg(tables.planning, input.trip);
  const alternate = solveLeg(tables.planning, input.alternate);

  const hl = lookupHolding(tables.holding, input.holding.flightLevel, input.holding.weightLb / 1000);
  const fuelPerEngineLb = (hl.ffPerEngineLbHr * input.holding.minutes) / 60;
  const holding: HoldingResult = {
    lookup: hl,
    engines: tables.holding.engines,
    minutes: input.holding.minutes,
    fuelPerEngineLb,
    fuelLb: fuelPerEngineLb * tables.holding.engines,
  };

  return {
    trip,
    alternate,
    holding,
    taxiFuelLb: input.taxiFuelLb,
    fobLb: trip.fuelLb + alternate.fuelLb + holding.fuelLb + input.taxiFuelLb,
    enduranceMin: trip.timeMin + alternate.timeMin + holding.minutes,
  };
}
