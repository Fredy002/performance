import type { FuelPlanInput, FuelPlanResult } from '@/core/fuelPlanning';
import type { TakeoffEprInput, TakeoffEprResult } from '@/core/takeoffEpr';
import type { B737EprInput, B737EprResult } from '@/core/takeoffEprB737';
import type { ClimbInput, ClimbResult } from '@/core/enRouteClimb';
import { foreignAirports, type RouteAirports } from '@/data/airports';
import { translate, type Locale } from '@/i18n';
import { exerciseDetailsEn } from '@/i18n/messages/exercises';

/**
 * Registro de ejercicios de prueba. Cada ejercicio guarda su enunciado, los datos
 * de entrada y la resolución manual (tal como está escrita) para validar la app.
 */

export interface ExpectedStep<R = FuelPlanResult> {
  /** Texto exactamente como aparece en la resolución manual */
  written: string;
  label: string;
  unit: string;
  /** Lee el valor equivalente del resultado de la app */
  pick: (r: R) => number;
  /** Respuesta final del ejercicio (a, b, c…) */
  answer?: string;
}

/**
 * Ámbito del vuelo. Determina las reglas de reserva:
 * - nacional (todos los aeropuertos del Perú): espera de 45 min según la RAP.
 * - internacional (origen, destino o alterno fuera del Perú): espera de 30 min y
 *   10 % de T.T y T.F como contingencia, que se suman a la autonomía y al FOB.
 */
export type FlightScope = 'nacional' | 'internacional';

export interface ScopeRules {
  label: string;
  holdingMinutes: number;
  /** Fracción de T.T y T.F que se añade (0,10 = 10 %) */
  contingencyPct: number;
  holdingRule: string;
}

export const SCOPES: Record<FlightScope, ScopeRules> = {
  nacional: {
    label: 'Vuelo nacional (Perú)',
    holdingMinutes: 45,
    contingencyPct: 0,
    holdingRule: 'Vuelos nacionales: espera de 45 min según la RAP (Regulaciones Aeronáuticas del Perú).',
  },
  internacional: {
    label: 'Vuelo internacional',
    holdingMinutes: 30,
    contingencyPct: 0.1,
    holdingRule:
      'Vuelos internacionales: espera de 30 min, y se suma el 10 % de T.T y de T.F a la autonomía y al FOB.',
  },
};

/** Internacional si origen, destino o alterno no es un aeropuerto del Perú (OACI que no empieza por SP). */
export function routeScope(route: RouteAirports): FlightScope {
  return foreignAirports(route).length > 0 ? 'internacional' : 'nacional';
}

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
  /** Aeropuertos del ejercicio (códigos OACI); en la herramienta son datos editables */
  airports: RouteAirports;
  expected: ExpectedStep[];
  /** Tablas usadas (ids de src/data/tables) */
  tables: string[];
}

/** EPR de despegue: B-727 (escenarios G de la FIGURE 81) o B-737 (escenarios R de la FIGURE 53). */
interface TakeoffEprExerciseBase {
  id: string;
  kind: 'takeoff-epr';
  status: ExerciseStatus;
  title: string;
  aircraft: string;
  summary: string;
  statement: string[];
  questions: string[];
  assumptions: string[];
  remarks: string[];
  /** Escenario de la tabla de condiciones (G-1 a G-5 o R-1 a R-5) */
  scenario: string;
  tables: string[];
}

export type TakeoffEprExercise = TakeoffEprExerciseBase &
  (
    | { aircraftId: 'b727'; input: TakeoffEprInput; expected: ExpectedStep<TakeoffEprResult>[] }
    | { aircraftId: 'b737'; input: B737EprInput; expected: ExpectedStep<B737EprResult>[] }
  );

/** Ascenso en ruta del B-737 (FIGURE 56, 57 y 58): combustible consumido o distancia recorrida. */
export interface ClimbExercise {
  id: string;
  kind: 'en-route-climb';
  status: ExerciseStatus;
  title: string;
  aircraft: string;
  summary: string;
  statement: string[];
  questions: string[];
  assumptions: string[];
  remarks: string[];
  /** Escenario de la FIGURE 56 (V-1 a V-5) */
  scenario: string;
  /** Qué pide el ejercicio */
  asks: 'fuel' | 'distance';
  input: ClimbInput;
  expected: ExpectedStep<ClimbResult>[];
  tables: string[];
}

export type Exercise = FuelPlanExercise | TakeoffEprExercise | ClimbExercise;

const V5_STATEMENT = [
  'Weight: 75 000 lb · Cruise press alt: 31 000 ft · Airport elevation: 2000 ft.',
  'ISA temperature: +10° · Avg wind comp: 40 kt HW.',
];
const V5_INPUT: ClimbInput = { weightLb: 75000, cruiseAltFt: 31000, airportElevationFt: 2000, temp: 'ISA+10', windKt: 40, windKind: 'HW' };
const CLIMB_TABLES_USED = ['condiciones-ascenso-ruta-b737', 'ascenso-ruta-280-070-isa', 'ascenso-ruta-280-070-isa-mas-10'];

export const CLIMB_EXERCISES: ClimbExercise[] = [
  {
    id: 'b737-ascenso-combustible-v5',
    kind: 'en-route-climb',
    status: 'pending',
    title: 'Combustible en ascenso en ruta · condiciones V-5',
    aircraft: 'Boeing 737',
    summary: 'Lectura de la tabla ISA +10 °C a 31 000 ft con 75 000 lb y ajuste de combustible por aeropuerto elevado (2000 ft).',
    statement: ['Determinar el combustible consumido durante un ascenso en ruta para las condiciones V-5 (figuras 56, 57 y 58).', ...V5_STATEMENT],
    questions: ['a) Combustible consumido'],
    assumptions: [
      'ISA +10° → tabla «En Route Climb 280/.70 ISA +10 °C» (FIGURE 58).',
      'Fila de 31 000 ft y columna de 75 000 lb: TIME/FUEL 13/2100 y DIST./TAS 70/373.',
      'Aeropuerto a 2000 ft: ajuste de combustible −100 lb (la tabla indica que el efecto en tiempo y distancia es despreciable).',
    ],
    remarks: [],
    scenario: 'V-5',
    asks: 'fuel',
    input: V5_INPUT,
    tables: CLIMB_TABLES_USED,
    expected: [
      { label: 'Tiempo de ascenso (tabla)', written: '13', unit: 'min', pick: (r) => r.timeMin },
      { label: 'Combustible (tabla)', written: '2100', unit: 'lb', pick: (r) => r.tableFuelLb },
      { label: 'Ajuste por aeropuerto a 2000 ft', written: '-100', unit: 'lb', pick: (r) => r.adjustment.fuelLb },
      { label: 'Combustible consumido', written: '2000', unit: 'lb', pick: (r) => r.fuelLb, answer: 'a' },
    ],
  },
  {
    id: 'b737-ascenso-distancia-v5',
    kind: 'en-route-climb',
    status: 'pending',
    title: 'Distancia en ascenso en ruta · condiciones V-5',
    aircraft: 'Boeing 737',
    summary: 'Distancia de la tabla ISA +10 °C corregida por el viento con d = t · v: 40 kt de cara durante 13 minutos.',
    statement: ['Determinar la distancia recorrida durante un ascenso en ruta para las condiciones V-5 (figuras 56, 57 y 58).', ...V5_STATEMENT],
    questions: ['a) Distancia recorrida'],
    assumptions: [
      'ISA +10° → tabla «En Route Climb 280/.70 ISA +10 °C» (FIGURE 58): tiempo 13 min y distancia 70 NM.',
      'Para la distancia hacen falta el tiempo y el viento: d = (13 min ÷ 60) × 40 kt; el viento de cara se resta.',
    ],
    remarks: [],
    scenario: 'V-5',
    asks: 'distance',
    input: V5_INPUT,
    tables: CLIMB_TABLES_USED,
    expected: [
      { label: 'Tiempo de ascenso (tabla)', written: '13', unit: 'min', pick: (r) => r.timeMin },
      { label: 'Distancia (tabla)', written: '70', unit: 'NM', pick: (r) => r.tableDistNm },
      { label: 'Distancia por el viento: 13/60 × 40', written: '8,67', unit: 'NM', pick: (r) => r.windDistNm },
      { label: 'Distancia recorrida: 70 − 8,67', written: '61,33', unit: 'NM', pick: (r) => r.distNm, answer: 'a' },
    ],
  },
];

export const TAKEOFF_EPR_EXERCISES: TakeoffEprExercise[] = [
  {
    id: 'b727-epr-despegue-g5',
    kind: 'takeoff-epr',
    status: 'pending',
    title: 'EPR de despegue B727 · condiciones G-5',
    aircraft: 'Boeing 727',
    summary:
      'Altitud de presión con el reglaje altimétrico, interpolación del EPR máximo entre 2000 y 3000 ft y corrección por el antihielo del motor 2.',
    statement: [
      'Determinar el EPR para despegue según las condiciones G-5 (figuras 81, 82 y 83).',
      'Field elevation: 2150 ft · Altimeter setting: 29.54" · Temperature: +5 °F.',
      'Air cond engs 1 and 3: ON · Anti-ice eng 2: ON · 6th stage bleed: OFF.',
      'Gross weight: 120 000 lb · Flap position: 5°.',
    ],
    questions: ['a) EPR de los motores 1 y 3', 'b) EPR del motor 2'],
    assumptions: [
      '29.54" está en la fila 29.44 – 29.55 de la FIGURE 82: corrección +400 ft.',
      '+5 °F coincide con una columna de la tabla: solo se interpola por altitud.',
      'El peso bruto y los flaps no intervienen en el EPR (sí en V1, VR y V2).',
      'El EPR final se redondea a 2 decimales, como en la tabla.',
    ],
    remarks: [],
    scenario: 'G-5',
    aircraftId: 'b727',
    input: {
      elevationFt: 2150,
      altimeter: 29.54,
      altimeterUnit: 'inHg',
      temperature: 5,
      temperatureUnit: 'F',
      airCondEng13: true,
      antiIceEng2: true,
      sixthStageBleed: false,
    },
    tables: ['condiciones-despegue-b727', 'reglaje-altimetrico-altitud-presion', 'performance-despegue-b727'],
    expected: [
      { label: 'Corrección del reglaje (FIGURE 82)', written: '400', unit: 'ft', pick: (r) => r.pressure.correctionFt },
      { label: 'Altitud de presión', written: '2550', unit: 'ft', pick: (r) => r.pressure.pressureAltitudeFt },
      { label: 'Motores 1 y 3 · EPR interpolado', written: '2,2375', unit: '', pick: (r) => r.eng13.table },
      { label: 'Motor 2 · EPR interpolado', written: '2,253', unit: '', pick: (r) => r.eng2.table },
      { label: 'Motor 2 · corrección por antihielo', written: '-0,03', unit: '', pick: (r) => r.eng2.corrections.reduce((a, c) => a + c.value, 0) },
      { label: 'EPR motores 1 y 3', written: '2,24', unit: '', pick: (r) => r.eng13.final, answer: 'a' },
      { label: 'EPR motor 2', written: '2,22', unit: '', pick: (r) => r.eng2.final, answer: 'b' },
    ],
  },
  {
    id: 'b737-epr-despegue-r5',
    kind: 'takeoff-epr',
    status: 'pending',
    title: 'EPR de despegue B737 · condiciones R-5',
    aircraft: 'Boeing 737',
    summary:
      'Altitud de presión negativa (−150 ft), límite por temperatura con el aire acondicionado OFF, límite por presión interpolado entre S.L. y −1000 ft, y se usa el menor.',
    statement: [
      'Determinar el EPR para despegue para las condiciones R-5 (figuras 53, 54 y 55).',
      'Field elevation: 50 ft · Altimeter setting: 30.15" · Temperature (OAT): +95 °F.',
      'Weight: 95 000 lb · Flap position: 1° · Wind component: 7 kt HW · Runway slope: 1,5 % UP.',
      'Air conditioning: OFF · Engine anti-ice: OFF.',
    ],
    questions: ['a) EPR de despegue'],
    assumptions: [
      '30.15" está en la fila 30.08 – 30.19 de la FIGURE 54: corrección −200 ft, así que la altitud de presión es −150 ft.',
      'Pasos de la tabla: ① límite por temperatura, ② límite por presión, ③ se usa el menor.',
      'El aire acondicionado OFF suma 0,03 al límite por temperatura antes de comparar, como en la resolución. El antihielo no corrige (ZERO).',
      'Peso, flaps, viento y pendiente no intervienen en el EPR (sí en V1, VR y V2).',
    ],
    remarks: [],
    scenario: 'R-5',
    aircraftId: 'b737',
    input: {
      elevationFt: 50,
      altimeter: 30.15,
      altimeterUnit: 'inHg',
      temperature: 95,
      temperatureUnit: 'F',
      airConditioning: false,
      engineAntiIce: false,
    },
    tables: ['condiciones-despegue-b737', 'reglaje-altimetrico-altitud-presion', 'performance-despegue-b737'],
    expected: [
      { label: 'Corrección del reglaje (FIGURE 54)', written: '-200', unit: 'ft', pick: (r) => r.pressure.correctionFt },
      { label: 'Altitud de presión', written: '-150', unit: 'ft', pick: (r) => r.pressure.pressureAltitudeFt },
      { label: 'Límite por temperatura (tabla, 95 °F)', written: '1,95', unit: '', pick: (r) => r.temp.table },
      { label: 'Límite por temperatura + 0,03 (A/C OFF)', written: '1,98', unit: '', pick: (r) => r.temp.limit },
      { label: 'Límite por presión (S.L. a −1000 ft)', written: '2,0025', unit: '', pick: (r) => r.press.limit },
      { label: 'EPR de despegue (el menor)', written: '1,98', unit: '', pick: (r) => r.final, answer: 'a' },
    ],
  },
];

export const FUEL_EXERCISES: FuelPlanExercise[] = [
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
    airports: { origin: 'SPJC', destination: 'SPQT', alternate: 'SPST' },
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
    airports: { origin: 'SPUR', destination: 'SPJC', alternate: 'SPSO' },
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
  {
    id: 'b737-combustible-segu-spjc',
    kind: 'fuel-plan',
    status: 'pending',
    scope: 'internacional',
    title: 'Planificación de combustible SEGU – SPJC',
    aircraft: 'Boeing 737',
    summary:
      'Vuelo internacional desde Guayaquil (Ecuador): espera de 30 min y 10 % de T.T y T.F sumado a la autonomía y al FOB. Tramo de 730 NM interpolado entre 700 y 750 NM; alterno de 120 NM entre 60 y 260 NM.',
    statement: [
      'Un B737 tiene programado realizar una operación:',
      'Origen – destino: SEGU (Guayaquil) – SPJC, distancia 730 NM, FL 350 (40 kt de cara, HW).',
      'Destino – alterno: SPJC – SPSO, distancia 120 NM, FL 190 (25 kt de cola, TW).',
      'Holding con 73 000 lb.',
      'Combustible para el taxi: 400 lb.',
    ],
    questions: ['a) Tiempo de viaje (T.T)', 'b) Combustible de viaje (T.F)', 'c) Combustible a bordo (FOB)', 'd) Autonomía'],
    assumptions: [
      'Vuelo internacional porque el origen (SEGU, Guayaquil) no es del Perú: espera de 30 min y se suma el 10 % de T.T y de T.F.',
      'Espera a 1 500 ft (FL 015), como en la resolución: 73 000 lb se interpola entre 75 000 lb (2370 lb/h) y 70 000 lb (2300 lb/h).',
      '120 NM está en el tramo sin filas publicadas (70–250 NM): se interpola entre las filas de 60 y 260 NM.',
      'Los niveles de vuelo del enunciado (FL 350 y FL 190) no intervienen en la planificación abreviada.',
    ],
    remarks: [
      'En la lista de respuestas, c) FOB aparece como 17606,29; la suma del desarrollo da 17607,29, que es el valor que se valida.',
      'La suma del FOB usa A.F = 2536,7; con 2536,67, el valor del desarrollo, la suma da 17607,26.',
    ],
    airports: { origin: 'SEGU', destination: 'SPJC', alternate: 'SPSO' },
    input: {
      trip: { distanceNm: 730, windKt: 40, windKind: 'HW', flightLevel: 350 },
      alternate: { distanceNm: 120, windKt: 25, windKind: 'TW', flightLevel: 190 },
      holding: { weightLb: 73000, flightLevel: 15, minutes: 30 },
      taxiFuelLb: 400,
      contingencyPct: 0.1,
    },
    tables: ['planificacion-abreviada', 'espera-b737'],
    expected: [
      { label: 'Origen · TAS', written: '433', unit: 'kt', pick: (r) => r.trip.lookup.tasKt },
      { label: 'Origen · tiempo en calma interpolado', written: '106,2', unit: 'min', pick: (r) => r.trip.lookup.airTimeMin },
      { label: 'Origen · combustible en calma interpolado', written: '10260', unit: 'lb', pick: (r) => r.trip.lookup.fuelLb },
      { label: 'Origen · Δ tiempo (cara)', written: '9,81', unit: 'min', pick: (r) => Math.abs(r.trip.deltaTimeMin) },
      { label: 'Origen · Δ combustible (cara)', written: '947,81', unit: 'lb', pick: (r) => Math.abs(r.trip.deltaFuelLb) },
      { label: '10 % T.T (contingencia)', written: '11,60', unit: 'min', pick: (r) => r.contingency.timeMin },
      { label: '10 % T.F (contingencia)', written: '1120,78', unit: 'lb', pick: (r) => r.contingency.fuelLb },
      { label: 'Alterno · TAS interpolada', written: '329,4', unit: 'kt', pick: (r) => r.alternate.lookup.tasKt },
      { label: 'Alterno · tiempo en calma interpolado', written: '25,8', unit: 'min', pick: (r) => r.alternate.lookup.airTimeMin },
      { label: 'Alterno · combustible en calma interpolado', written: '2745', unit: 'lb', pick: (r) => r.alternate.lookup.fuelLb },
      { label: 'Alterno · Δ tiempo (cola)', written: '1,96', unit: 'min', pick: (r) => Math.abs(r.alternate.deltaTimeMin) },
      { label: 'Alterno · Δ combustible (cola)', written: '208,33', unit: 'lb', pick: (r) => Math.abs(r.alternate.deltaFuelLb) },
      { label: 'Alterno · tiempo (A.T)', written: '23,84', unit: 'min', pick: (r) => r.alternate.timeMin },
      { label: 'Alterno · combustible (A.F)', written: '2536,67', unit: 'lb', pick: (r) => r.alternate.fuelLb },
      { label: 'Espera · FF por motor interpolado', written: '2342', unit: 'lb/h', pick: (r) => r.holding.lookup.ffPerEngineLbHr },
      { label: 'Espera · combustible por motor (30 min)', written: '1171', unit: 'lb', pick: (r) => r.holding.fuelPerEngineLb },
      { label: 'Espera · combustible (2 motores)', written: '2342', unit: 'lb', pick: (r) => r.holding.fuelLb },
      { label: 'Tiempo de viaje (T.T)', written: '116,01', unit: 'min', pick: (r) => r.trip.timeMin, answer: 'a' },
      { label: 'Combustible de viaje (T.F)', written: '11207,81', unit: 'lb', pick: (r) => r.trip.fuelLb, answer: 'b' },
      { label: 'Combustible a bordo (FOB)', written: '17607,29', unit: 'lb', pick: (r) => r.fobLb, answer: 'c' },
      { label: 'Autonomía', written: '181,45', unit: 'min', pick: (r) => r.enduranceMin, answer: 'd' },
    ],
  },
];

export const EXERCISES: Exercise[] = [...FUEL_EXERCISES, ...TAKEOFF_EPR_EXERCISES, ...CLIMB_EXERCISES];

export const pendingExercises = () => EXERCISES.filter((e) => e.status === 'pending');
export const verifiedExercises = () => EXERCISES.filter((e) => e.status === 'verified');
/** Ejercicios de combustible verificados: se ofrecen como ejemplos resueltos en la herramienta. */
export const verifiedFuelExercises = () => FUEL_EXERCISES.filter((e) => e.status === 'verified');

export const getFuelExercise = (id: string) => FUEL_EXERCISES.find((e) => e.id === id);
export const getTakeoffEprExercise = (id: string) => TAKEOFF_EPR_EXERCISES.find((e) => e.id === id);
export const getClimbExercise = (id: string) => CLIMB_EXERCISES.find((e) => e.id === id);

export function getExercise(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}

export function getExerciseDisplay(exercise: Exercise, locale: Locale) {
  if (locale === 'es') {
    return {
      title: exercise.title,
      summary: exercise.summary,
      scopeLabel: exercise.kind === 'fuel-plan'
        ? SCOPES[exercise.scope].label
        : exercise.kind === 'takeoff-epr'
          ? `Despegue · condiciones ${exercise.scenario}`
          : `Ascenso en ruta · condiciones ${exercise.scenario}`,
      statement: exercise.statement,
      questions: exercise.questions,
      assumptions: exercise.assumptions,
      remarks: exercise.remarks,
      expectedLabels: exercise.expected.map((step) => step.label),
    };
  }
  const details = exercise.status === 'pending' ? exerciseDetailsEn[exercise.id] : undefined;
  if (exercise.status === 'pending' && !details) {
    throw new Error(`Missing en exercise details for ${exercise.id}`);
  }
  if (details) {
    const fields = [
      ['statement', details.statement.length, exercise.statement.length],
      ['questions', details.questions.length, exercise.questions.length],
      ['assumptions', details.assumptions.length, exercise.assumptions.length],
      ['remarks', details.remarks.length, exercise.remarks.length],
      ['expectedLabels', details.expectedLabels.length, exercise.expected.length],
    ] as const;
    for (const [field, translatedCount, sourceCount] of fields) {
      if (translatedCount !== sourceCount) {
          throw new Error(`English exercise ${field} count mismatch for ${exercise.id}: expected ${sourceCount}, got ${translatedCount}`);
      }
    }
  }
  const scopeLabel =
    exercise.kind === 'fuel-plan'
      ? translate(locale, `exercise.scope.${exercise.scope === 'nacional' ? 'national' : 'international'}`)
      : translate(locale, `exercise.scope.${exercise.kind === 'takeoff-epr' ? 'takeoff' : 'climb'}`, { scenario: exercise.scenario });
  return {
    title: translate(locale, `exercise.${exercise.id}.title`),
    summary: translate(locale, `exercise.${exercise.id}.summary`),
    scopeLabel,
    statement: details?.statement ?? exercise.statement,
    questions: details?.questions ?? exercise.questions,
    assumptions: details?.assumptions ?? exercise.assumptions,
    remarks: details?.remarks ?? exercise.remarks,
    expectedLabels: details?.expectedLabels ?? exercise.expected.map((step) => step.label),
  };
}
