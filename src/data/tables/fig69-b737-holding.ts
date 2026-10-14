import type { HoldingCell, HoldingRow, HoldingTable } from './types';

const WEIGHTS_KLB = [115, 110, 105, 100, 95, 90, 85, 80, 75, 70, 65];

/** Construye una fila a partir de las tres líneas de la fuente: EPR, IAS y FF por motor. */
function fl(flightLevel: number, epr: number[], ias: number[], ff: number[]): HoldingRow {
  const cells: HoldingCell[] = epr.map((e, i) => ({ epr: e, iasKt: ias[i], ffPerEngineLbHr: ff[i] }));
  return { flightLevel, cells };
}

export const FIG69_B737_HOLDING: HoldingTable = {
  id: 'fig69',
  kind: 'holding',
  title: 'Performance en espera',
  aircraft: 'Boeing 737',
  summary: 'EPR, velocidad indicada y flujo de combustible por motor en espera, según nivel de vuelo y peso bruto.',
  source: {
    figure: 'FIGURE 69',
    originalTitle: 'B-737 – Holding Performance Chart',
    document: 'FAA — Computer Testing Supplement (ATP / Aircraft Dispatcher)',
  },
  engines: 2,
  weightsKlb: WEIGHTS_KLB,
  rows: [
    fl(350,
      [2.13, 2.07, 2.01, 1.95, 1.90, 1.85, 1.80, 1.76, 1.71, 1.67, 1.64],
      [234, 228, 223, 217, 211, 210, 210, 210, 210, 210, 210],
      [2830, 2810, 2630, 2460, 2290, 2180, 2070, 1960, 1870, 1780, 1700]),
    fl(300,
      [1.86, 1.82, 1.79, 1.75, 1.71, 1.67, 1.64, 1.60, 1.57, 1.54, 1.51],
      [231, 226, 220, 215, 210, 210, 210, 210, 210, 210, 210],
      [2740, 2600, 2470, 2370, 2250, 2140, 2050, 1960, 1880, 1790, 1720]),
    fl(250,
      [1.69, 1.66, 1.63, 1.60, 1.57, 1.54, 1.51, 1.48, 1.45, 1.43, 1.41],
      [229, 224, 218, 213, 210, 210, 210, 210, 210, 210, 210],
      [2710, 2610, 2490, 2370, 2260, 2180, 2080, 1980, 1920, 1840, 1780]),
    fl(200,
      [1.56, 1.53, 1.50, 1.48, 1.45, 1.43, 1.40, 1.38, 1.36, 1.34, 1.32],
      [227, 222, 217, 211, 210, 210, 210, 210, 210, 210, 210],
      [2716, 2590, 2490, 2390, 2310, 2230, 2130, 2060, 2000, 1920, 1860]),
    fl(150,
      [1.45, 1.43, 1.40, 1.38, 1.36, 1.34, 1.32, 1.31, 1.29, 1.27, 1.26],
      [226, 221, 216, 210, 210, 210, 210, 210, 210, 210, 210],
      [2790, 2680, 2570, 2470, 2380, 2290, 2220, 2140, 2070, 2000, 1990]),
    fl(100,
      [1.36, 1.34, 1.33, 1.31, 1.29, 1.28, 1.26, 1.25, 1.24, 1.22, 1.21],
      [225, 220, 215, 210, 210, 210, 210, 210, 210, 210, 210],
      [2860, 2780, 2670, 2560, 2470, 2390, 2310, 2240, 2170, 2100, 2030]),
    fl(50,
      [1.29, 1.28, 1.27, 1.25, 1.24, 1.23, 1.21, 1.20, 1.19, 1.18, 1.17],
      [224, 219, 214, 210, 210, 210, 210, 210, 210, 210, 210],
      [2960, 2870, 2770, 2670, 2580, 2500, 2420, 2350, 2290, 2230, 2150]),
    fl(15,
      [1.25, 1.24, 1.23, 1.22, 1.21, 1.20, 1.19, 1.18, 1.17, 1.16, 1.15],
      [224, 219, 214, 210, 210, 210, 210, 210, 210, 210, 210],
      [3050, 2950, 2850, 2790, 2670, 2590, 2510, 2430, 2370, 2300, 2240]),
  ],
  sourceRemarks: [
    'FL 200 · 115 000 lb: el flujo aparece como 2716 lb/h (el resto de valores termina en 0). Se conserva tal cual la fuente.',
    'FL 350: entre 115 000 y 110 000 lb el flujo solo baja 20 lb/h (2830 → 2810), mucho menos que en el resto de la fila. Se conserva tal cual.',
    'FL 150 · 65 000 lb: 1990 lb/h, solo 10 lb/h menos que la columna de 70 000 lb. Se conserva tal cual.',
  ],
  help: {
    purpose:
      'Da los parámetros para volar un circuito de espera con un B-737: el reglaje de empuje (EPR), la velocidad indicada (IAS) y el consumo por motor. Sirve para calcular cuánto combustible se gasta esperando un tiempo determinado y para saber a qué velocidad y empuje volar la espera.',
    glossary: [
      { term: 'FLIGHT LEVEL', meaning: 'Nivel de vuelo en centenas de pies. «015» = 1 500 ft, «050» = 5 000 ft.' },
      { term: 'GROSS WEIGHT 1000 LB', meaning: 'Peso bruto del avión en miles de libras (115 = 115 000 lb).' },
      { term: 'EPR', meaning: 'Engine Pressure Ratio: relación de presiones del motor usada como reglaje de empuje (1.ª línea de cada nivel).' },
      { term: 'IAS KNOTS', meaning: 'Velocidad indicada de espera en nudos (2.ª línea). Nunca baja de 210 kt.' },
      { term: 'FF PER ENGINE LB/HR', meaning: 'Flujo de combustible por motor en libras por hora (3.ª línea).' },
    ],
    steps: [
      'Localiza el nivel de vuelo y el peso bruto. Si no coinciden con la tabla, haz una interpolación doble (primero por peso en cada nivel, luego entre niveles).',
      'Lee el EPR y la IAS para volar la espera.',
      'Lee el flujo de combustible POR MOTOR y multiplícalo por 2 (B-737 bimotor) para obtener el consumo total en lb/h.',
      'Combustible de espera = consumo total (lb/h) × tiempo de espera (min) ÷ 60.',
    ],
    tips: [
      'Error habitual: olvidar multiplicar por el número de motores.',
      'Los niveles no están equiespaciados abajo (015, 050, 100): interpola con los niveles reales.',
      'A pesos bajos la IAS queda limitada a 210 kt, por eso se repite en muchas columnas.',
      'La tabla tiene el peso en orden decreciente: comprueba qué columnas rodean tu peso antes de interpolar.',
    ],
  },
};
