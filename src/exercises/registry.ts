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

/**
 * Ámbito del vuelo. Determina las reglas de reserva: en vuelos nacionales del Perú
 * la espera es de 45 min según la RAP. (Internacional: pendiente.)
 */
export type FlightScope = 'nacional';

export const SCOPES: Record<FlightScope, { label: string; holdingMinutes: number; holdingRule: string }> = {
  nacional: {
    label: 'Vuelo nacional (Perú)',
    holdingMinutes: 45,
    holdingRule: 'Vuelos nacionales: espera de 45 min según la RAP (Regulaciones Aeronáuticas del Perú).',
  },
};

/**
 * pending: en la sección Pruebas, a la espera de que el usuario lo verifique.
 * verified: ya comprobado; se ofrece como ejercicio resuelto en su herramienta.
 */
export type ExerciseStatus = 'pending' | 'verified';

export interface FuelPlanExercise {
  id: string;
  kind: 'fuel-plan';
  status: ExerciseStatus;
  scope: FlightScope;
  title: string;
  aircraft: string;
  summary: string;
  /** Enunciado, línea a línea */
  statement: string[];
  questions: string[];
  /** Datos que no figuran en el enunciado y se toman de la resolución */
  assumptions: string[];
  /** Observaciones sobre la resolución manual (erratas, redondeos) */
  remarks: string[];
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
    status: 'verified',
    scope: 'nacional',
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
      'Espera de 45 min (vuelo nacional, según la RAP) a 1 500 ft (FL 015): la resolución usa 2510 lb/h por motor (FL 015, 85 000 lb).',
      'Los niveles de vuelo del enunciado (FL 350 y FL 180) no intervienen: la planificación abreviada da tiempo y combustible para su altitud recomendada.',
    ],
    remarks: [
      'La resolución suma T.T = 80,4 y T.F = 7825,4 ya redondeados; por eso FOB y autonomía difieren en 0,01–0,02.',
      'Δ combustible del alterno: la resolución escribe 318,794; el valor exacto es 318,792 (4750 × 30 ÷ 447).',
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
  {
    id: 'b737-combustible-spur-spjc',
    kind: 'fuel-plan',
    status: 'pending',
    scope: 'nacional',
    title: 'Planificación de combustible SPUR – SPJC',
    aircraft: 'Boeing 737',
    summary:
      'Tramo de 750 NM (fila exacta) y alterno de 145 NM, que se interpola entre 60 y 260 NM. Espera con 92 500 lb interpolada entre 95 000 y 90 000 lb.',
    statement: [
      'Un B737 tiene programado realizar una operación:',
      'Origen – destino: SPUR – SPJC, distancia 750 NM, FL 350 (50 kt de cola, TW).',
      'Destino – alterno: SPJC – SPSO, distancia 145 NM, FL 190 (30 kt de cara, HW).',
      'Holding con 92 500 lb (peso de la aeronave).',
      'Combustible para el taxi: 400 lb.',
    ],
    questions: ['a) Tiempo de viaje (T.T)', 'b) Combustible de viaje (T.F)', 'c) Combustible a bordo (FOB)', 'd) Autonomía'],
    assumptions: [
      'Espera de 45 min (vuelo nacional, según la RAP; 30 min en internacional) a 1 500 ft (FL 015), como en la resolución.',
      '145 NM está en el tramo sin filas publicadas (70–250 NM): se interpola entre las filas de 60 y 260 NM.',
      'Los niveles de vuelo del enunciado (FL 350 y FL 190) no intervienen en la planificación abreviada.',
    ],
    remarks: [
      'En la lista de respuestas de la resolución, c) FOB aparece como 3945, que es el combustible de espera; el desarrollo da FOB = 16 972,16, que es el valor que se valida.',
      'En un renglón del combustible del alterno aparece «3096,25»; el valor correcto, el que se usa en el resto del desarrollo, es 3076,25.',
    ],
    route: { trip: ['SPUR', 'SPJC'], alternate: ['SPJC', 'SPSO'] },
    input: {
      trip: { distanceNm: 750, windKt: 50, windKind: 'TW', flightLevel: 350 },
      alternate: { distanceNm: 145, windKt: 30, windKind: 'HW', flightLevel: 190 },
      holding: { weightLb: 92500, flightLevel: 15, minutes: 45 },
      taxiFuelLb: 400,
    },
    tables: ['planificacion-abreviada', 'espera-b737'],
    expected: [
      { label: 'Origen · TAS (fila exacta)', written: '433', unit: 'kt', pick: (r) => r.trip.lookup.tasKt },
      { label: 'Origen · tiempo en calma', written: '109', unit: 'min', pick: (r) => r.trip.lookup.airTimeMin },
      { label: 'Origen · combustible en calma', written: '10500', unit: 'lb', pick: (r) => r.trip.lookup.fuelLb },
      { label: 'Origen · Δ tiempo (cola)', written: '12,59', unit: 'min', pick: (r) => Math.abs(r.trip.deltaTimeMin) },
      { label: 'Origen · Δ combustible (cola)', written: '1212,47', unit: 'lb', pick: (r) => Math.abs(r.trip.deltaFuelLb) },
      { label: 'Alterno · TAS interpolada', written: '350,4', unit: 'kt', pick: (r) => r.alternate.lookup.tasKt },
      { label: 'Alterno · tiempo en calma interpolado', written: '29,05', unit: 'min', pick: (r) => r.alternate.lookup.airTimeMin },
      { label: 'Alterno · combustible en calma interpolado', written: '3076,25', unit: 'lb', pick: (r) => r.alternate.lookup.fuelLb },
      { label: 'Alterno · Δ tiempo (cara)', written: '2,49', unit: 'min', pick: (r) => r.alternate.deltaTimeMin },
      { label: 'Alterno · Δ combustible (cara)', written: '263,38', unit: 'lb', pick: (r) => r.alternate.deltaFuelLb },
      { label: 'Alterno · tiempo (A.T)', written: '31,54', unit: 'min', pick: (r) => r.alternate.timeMin },
      { label: 'Alterno · combustible (A.F)', written: '3339,63', unit: 'lb', pick: (r) => r.alternate.fuelLb },
      { label: 'Espera · FF por motor interpolado', written: '2630', unit: 'lb/h', pick: (r) => r.holding.lookup.ffPerEngineLbHr },
      { label: 'Espera · combustible por motor', written: '1972,5', unit: 'lb', pick: (r) => r.holding.fuelPerEngineLb },
      { label: 'Espera · combustible (2 motores)', written: '3945', unit: 'lb', pick: (r) => r.holding.fuelLb },
      { label: 'Tiempo de viaje (T.T)', written: '96,41', unit: 'min', pick: (r) => r.trip.timeMin, answer: 'a' },
      { label: 'Combustible de viaje (T.F)', written: '9287,53', unit: 'lb', pick: (r) => r.trip.fuelLb, answer: 'b' },
      { label: 'Combustible a bordo (FOB)', written: '16972,16', unit: 'lb', pick: (r) => r.fobLb, answer: 'c' },
      { label: 'Autonomía', written: '172,95', unit: 'min', pick: (r) => r.enduranceMin, answer: 'd' },
    ],
  },
];

export const pendingExercises = () => EXERCISES.filter((e) => e.status === 'pending');
export const verifiedExercises = () => EXERCISES.filter((e) => e.status === 'verified');

export function getExercise(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}
