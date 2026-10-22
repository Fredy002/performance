import type { FuelPlanInput, FuelPlanResult } from '@/core/fuelPlanning';

/**
 * Registro de ejercicios de prueba. Cada ejercicio guarda su enunciado, los datos
 * de entrada y la resolución manual (tal como está escrita) para validar la app.
 */

export interface ExpectedStep {
  /** Texto exactamente como aparece en la resolución manual */
  written: string;
  label: string;
  unit: string;
  /** Lee el valor equivalente del resultado de la app */
  pick: (r: FuelPlanResult) => number;
  /** Respuesta final del ejercicio (a, b, c…) */
  answer?: string;
}

export interface FuelPlanExercise {
  id: string;
  kind: 'fuel-plan';
  title: string;
  aircraft: string;
  summary: string;
  /** Enunciado, línea a línea */
  statement: string[];
  questions: string[];
  /** Datos que no figuran en el enunciado y se toman de la resolución */
  assumptions: string[];
  input: FuelPlanInput;
  route: { trip: [string, string]; alternate: [string, string] };
  expected: ExpectedStep[];
  /** Tablas usadas (ids de src/data/tables) */
  tables: string[];
}

export type Exercise = FuelPlanExercise;

export const EXERCISES: Exercise[] = [
  {
    id: 'b737-combustible-spjc-spqt',
    kind: 'fuel-plan',
    title: 'Planificación de combustible SPJC – SPQT',
    aircraft: 'Boeing 737',
    summary:
      'Tiempo y combustible de viaje, combustible a bordo y autonomía con alternativo, espera y rodaje. Usa la planificación de vuelo abreviada, la performance de espera e interpolación lineal.',
    statement: [
      'Un B737 tiene programado realizar una operación:',
      'Origen – destino: SPJC – SPQT, distancia 622 NM, FL 350 (55 kt de cola, TW).',
      'Destino – alterno: SPQT – SPST, 270 NM, FL 180 (30 kt de cara, HW).',
      'Holding con 85 000 lb.',
      'Combustible para el taxi: 400 lb.',
    ],
    questions: ['a) Tiempo de viaje (T.T)', 'b) Combustible de viaje (T.F)', 'c) Combustible a bordo (FOB)', 'd) Autonomía'],
    assumptions: [
      'Espera de 45 min a 1 500 ft (FL 015): el enunciado no los indica; se toman de la resolución, que usa 2510 lb/h por motor (FL 015, 85 000 lb).',
      'Los niveles de vuelo del enunciado (FL 350 y FL 180) no intervienen: la planificación abreviada da tiempo y combustible para su altitud recomendada.',
    ],
    route: { trip: ['SPJC', 'SPQT'], alternate: ['SPQT', 'SPST'] },
    input: {
      trip: { distanceNm: 622, windKt: 55, windKind: 'TW', flightLevel: 350 },
      alternate: { distanceNm: 270, windKt: 30, windKind: 'HW', flightLevel: 180 },
      holding: { weightLb: 85000, flightLevel: 15, minutes: 45 },
      taxiFuelLb: 400,
    },
    tables: ['planificacion-abreviada', 'espera-b737'],
    expected: [
      { label: 'Origen · TAS interpolada', written: '433', unit: 'kt', pick: (r) => r.trip.lookup.tasKt },
      { label: 'Origen · tiempo en calma interpolado', written: '92,08', unit: 'min', pick: (r) => r.trip.lookup.airTimeMin },
      { label: 'Origen · combustible en calma interpolado', written: '8964', unit: 'lb', pick: (r) => r.trip.lookup.fuelLb },
      { label: 'Origen · Δ tiempo (cola)', written: '11,696', unit: 'min', pick: (r) => Math.abs(r.trip.deltaTimeMin) },
      { label: 'Origen · Δ combustible (cola)', written: '1138,61', unit: 'lb', pick: (r) => Math.abs(r.trip.deltaFuelLb) },
      { label: 'Alterno · TAS', written: '447', unit: 'kt', pick: (r) => r.alternate.lookup.tasKt },
      { label: 'Alterno · tiempo en calma', written: '45', unit: 'min', pick: (r) => r.alternate.lookup.airTimeMin },
      { label: 'Alterno · combustible en calma', written: '4750', unit: 'lb', pick: (r) => r.alternate.lookup.fuelLb },
      { label: 'Alterno · Δ tiempo (cara)', written: '3,02', unit: 'min', pick: (r) => r.alternate.deltaTimeMin },
      { label: 'Alterno · Δ combustible (cara)', written: '318,794', unit: 'lb', pick: (r) => r.alternate.deltaFuelLb },
      { label: 'Alterno · tiempo (A.T)', written: '48,02', unit: 'min', pick: (r) => r.alternate.timeMin },
      { label: 'Alterno · combustible (A.F)', written: '5068,79', unit: 'lb', pick: (r) => r.alternate.fuelLb },
      { label: 'Espera · FF por motor', written: '2510', unit: 'lb/h', pick: (r) => r.holding.lookup.ffPerEngineLbHr },
      { label: 'Espera · combustible por motor', written: '1882,5', unit: 'lb', pick: (r) => r.holding.fuelPerEngineLb },
      { label: 'Espera · combustible (2 motores)', written: '3765', unit: 'lb', pick: (r) => r.holding.fuelLb },
      { label: 'Tiempo de viaje (T.T)', written: '80,4', unit: 'min', pick: (r) => r.trip.timeMin, answer: 'a' },
      { label: 'Combustible de viaje (T.F)', written: '7825,4', unit: 'lb', pick: (r) => r.trip.fuelLb, answer: 'b' },
      { label: 'Combustible a bordo (FOB)', written: '17059,19', unit: 'lb', pick: (r) => r.fobLb, answer: 'c' },
      { label: 'Autonomía', written: '173,42', unit: 'min', pick: (r) => r.enduranceMin, answer: 'd' },
    ],
  },
];

export function getExercise(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}
