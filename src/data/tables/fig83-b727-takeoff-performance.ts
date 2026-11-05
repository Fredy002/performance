import { historicalReferences, SOURCE_EDITION } from './sources';
import type { FigCell, FigRow, FigureTable } from './types';

/** Join stacked source lines, preserving empty entries. */
const L = (...lines: (string | number)[]): string => lines.map(String).join('\n');

/* ---------- MAX TAKEOFF EPR ---------- */

const EPR_OAT: [string, string][] = [
  ['67 TO -9', '-55 TO -23'],
  ['-4', '-20'],
  ['5', '-15'],
  ['14', '-10'],
  ['23', '-5'],
  ['32', '0'],
  ['41', '5'],
  ['50', '10'],
  ['59', '15'],
  ['68', '20'],
  ['77', '25'],
  ['86', '30'],
  ['95', '35'],
  ['104', '40'],
  ['113', '45'],
  ['120', '49'],
];

/** Altitude row: engines 1 and 3 above engine 2, for each OAT column. */
const eprRow = (alt: string, eng13: string[], eng2: string[], first = false): FigCell[] => [
  { t: alt },
  ...(first ? [{ t: '', rs: 6 }] : []),
  { t: L('1 & 3', '2') },
  ...eng13.map((v, i) => ({ t: L(v, eng2[i]) })),
];

const EPR_TABLE: FigRow[] = [
  [
    { t: L('PRESS', 'ALT', 'FT'), h: true, cs: 2, align: 'left', open: ['r'] },
    { t: L('OAT °F', '°C'), h: true, align: 'right', open: ['l'] },
    ...EPR_OAT.map(([f, c]) => ({ t: L(f, c), h: true })),
  ],
  eprRow(
    '-1000',
    ['2.04', '2.04', '2.04', '2.04', '2.04', '2.04', '2.04', '2.04', '2.04', '2.04', '2.04', '2.04', '2.03', '1.99', '1.94', '1.91'],
    ['2.06', '2.06', '2.06', '2.06', '2.06', '2.06', '2.06', '2.06', '2.06', '2.06', '2.06', '2.06', '2.05', '2.00', '1.96', '1.92'],
    true,
  ),
  eprRow(
    'S.L.',
    ['2.10', '2.10', '2.10', '2.10', '2.10', '2.10', '2.10', '2.10', '2.10', '2.10', '2.10', '2.08', '2.03', '1.99', '1.94', '1.91'],
    ['2.11', '2.11', '2.11', '2.11', '2.11', '2.11', '2.11', '2.11', '2.11', '2.11', '2.11', '2.10', '2.05', '2.00', '1.96', '1.92'],
  ),
  eprRow(
    '1000',
    ['2.15', '2.15', '2.15', '2.15', '2.15', '2.15', '2.15', '2.13', '2.12', '2.12', '2.11', '2.08', '2.03', '1.99', '1.94', '1.91'],
    ['2.16', '2.16', '2.16', '2.16', '2.16', '2.16', '2.16', '2.15', '2.13', '2.13', '2.12', '2.10', '2.05', '2.00', '1.96', '1.92'],
  ),
  eprRow(
    '2000',
    ['2.21', '2.21', '2.21', '2.21', '2.21', '2.20', '2.17', '2.14', '2.14', '2.14', '2.11', '2.08', '2.03', '1.99', '1.94', '1.91'],
    ['2.22', '2.22', '2.22', '2.22', '2.22', '2.21', '2.18', '2.16', '2.16', '2.15', '2.12', '2.10', '2.05', '2.00', '1.96', '1.92'],
  ),
  eprRow(
    '3000',
    ['2.26', '2.26', '2.26', '2.25', '2.23', '2.20', '2.17', '2.14', '2.14', '2.14', '2.11', '2.08', '2.03', '1.99', '1.94', '1.91'],
    ['2.28', '2.28', '2.28', '2.27', '2.24', '2.21', '2.18', '2.16', '2.16', '2.15', '2.12', '2.10', '2.05', '2.00', '1.96', '1.92'],
  ),
  eprRow(
    L('3856 &', 'ABOVE'),
    ['2.31', '2.29', '2.27', '2.25', '2.23', '2.20', '2.17', '2.14', '2.14', '2.14', '2.11', '2.08', '2.03', '1.99', '1.94', '1.91'],
    ['2.32', '2.31', '2.29', '2.27', '2.24', '2.21', '2.18', '2.16', '2.16', '2.15', '2.12', '2.10', '2.05', '2.00', '1.96', '1.92'],
  ),
];

const EPR_CORRECTIONS: FigRow[] = [
  [
    { t: 'EPR BLEED CORRECTIONS', align: 'left' },
    { t: 'ENG 1 & 3' },
    { t: 'ENG 2' },
  ],
  [{ t: 'AIR CONDITIONING', align: 'left' }, { t: 'OFF +.04' }, { t: '-' }],
  [{ t: 'ENGINE ANTI-ICE ON', align: 'left' }, { t: '-' }, { t: '-.03' }],
];

/* ---------- V1, VR, V2 ---------- */

/**
 * OAT ranges use three columns (lower bound, TO, upper bound) and two rows
 * (Fahrenheit above Celsius); TO spans both rows.
 */
type OatGroup = { f: [string, string]; c: [string, string] } | { span: number; t: string; joinNext?: boolean };
const oat = (fLo: string, fHi: string, cLo: string, cHi: string): OatGroup => ({ f: [fLo, fHi], c: [cLo, cHi] });
const EMPTY: OatGroup = { span: 1, t: '' };

/** Pressure altitude band with separate Fahrenheit and Celsius rows. */
const altRows = (alt: string, ...groups: OatGroup[]): FigRow[] => {
  // The source leaves borders open between labels, units and range endpoints.
  const fRow: FigCell[] = [{ t: alt, rs: 2, align: 'left', open: ['r'] }, { t: '°F', open: ['l', 'b'] }];
  const cRow: FigCell[] = [{ t: '°C', open: ['l', 't'] }];
  let joinPrev = false;
  for (const g of groups) {
    if ('span' in g) {
      fRow.push({ t: g.t, cs: 3 * g.span, rs: 2, ...(g.joinNext ? { open: ['r'] as const } : {}) });
      joinPrev = !!g.joinNext;
      continue;
    }
    const lo = joinPrev ? (['l', 'r'] as const) : (['r'] as const);
    fRow.push(
      { t: g.f[0], align: 'right', open: [...lo, 'b'] },
      { t: 'TO', rs: 2, open: ['l', 'r'] },
      { t: g.f[1], align: 'left', open: ['l', 'b'] },
    );
    cRow.push({ t: g.c[0], align: 'right', open: [...lo, 't'] }, { t: g.c[1], align: 'left', open: ['l', 't'] });
    joinPrev = false;
  }
  return [fRow, cRow];
};

/** Weight band: [V1=VR, V2] for each of the four OAT columns. */
type Band = { gw: string; cols: [string, string][] };

const speedRows = (flaps: string, bands: Band[]): FigRow[] =>
  bands.map((b, i) => [
    ...(i === 0 ? [{ t: flaps, rs: bands.length } as FigCell] : []),
    { t: b.gw },
    ...b.cols.flatMap(([v1, v2]): FigCell[] => [
      { t: v1, cs: 2, align: 'left', open: ['r'] },
      { t: v2, align: 'right', open: ['l'] },
    ]),
  ]);

const GW1 = L(210, 200, 190);
const GW2 = L(180, 170, 160, 150);
const GW3 = L(140, 130, 120);

const SPEEDS_TABLE: FigRow[] = [
  [
    { t: L('PRESSURE', 'ALT - 1000 FT'), h: true, cs: 2, align: 'left' },
    { t: 'OAT', h: true, cs: 12 },
  ],
  ...altRows('9 TO 11', { span: 2, t: '(ABOVE CERTIFIED ALTITUDE)', joinNext: true }, oat('-65', '25', '-54', '-4'), oat('26', '87', '-3', '31')),
  ...altRows('7 TO 9', EMPTY, oat('-65', '9', '-54', '-13'), oat('10', '75', '-12', '24'), oat('76', '104', '25', '40')),
  ...altRows(
    '5 TO 7',
    oat('-65', '-10', '-54', '-23'),
    oat('-8', '42', '-22', '5'),
    oat('43', '97', '6', '36'),
    oat('98', '111', '37', '44'),
  ),
  ...altRows(
    '3 TO 5',
    oat('-65', '32', '-54', '0'),
    oat('33', '90', '1', '32'),
    oat('91', '113', '33', '45'),
    oat('114', '120', '46', '49'),
  ),
  ...altRows('1 TO 3', oat('-65', '83', '-54', '28'), oat('84', '106', '29', '41'), oat('107', '120', '42', '49'), EMPTY),
  ...altRows('-1 TO 1', oat('-65', '99', '-54', '37'), oat('100', '120', '38', '49'), EMPTY, EMPTY),
  [
    { t: 'FLAPS', h: true },
    { t: L('GROSS', 'WEIGHT', '1000 LB'), h: true },
    ...[1, 2, 3, 4].flatMap((): FigCell[] => [
      { t: 'V_{1} =V_{R}', h: true, cs: 2, align: 'left', open: ['r'] },
      { t: 'V_{2}', h: true, align: 'right', open: ['l'] },
    ]),
  ],
  ...speedRows('5', [
    {
      gw: GW1,
      cols: [
        [L(165, 160, 155), L(175, 171, 167)],
        [L(166, 162, 157), L(175, 171, 167)],
        [L('', '', 158), L('', '', 167)],
        ['', ''],
      ],
    },
    {
      gw: GW2,
      cols: [
        [L(150, 144, 140, 135), L(163, 159, 154, 149)],
        [L(152, 147, 141, 136), L(163, 159, 153, 149)],
        [L(154, 149, 143, 138), L(163, 159, 153, 149)],
        [L('', 150, 145, 140), L('', 158, 153, 148)],
      ],
    },
    {
      gw: GW3,
      cols: [
        [L(129, 124, 119), L(145, 140, 135)],
        [L(130, 125, 120), L(145, 139, 134)],
        [L(132, 126, 120), L(144, 138, 134)],
        [L(134, 128, 121), L(144, 138, 133)],
      ],
    },
  ]),
  ...speedRows('15', [
    {
      gw: GW1,
      cols: [
        [L(156, 151, 146), L(166, 162, 158)],
        [L(157, 153, 148), L(166, 162, 158)],
        [L('', '', 149), L('', '', 158)],
        ['', ''],
      ],
    },
    {
      gw: GW2,
      cols: [
        [L(141, 136, 132, 127), L(154, 150, 146, 141)],
        [L(143, 138, 133, 128), L(154, 150, 145, 141)],
        [L(145, 140, 135, 130), L(154, 150, 145, 141)],
        [L('', 141, 137, 132), L('', 149, 145, 140)],
      ],
    },
    {
      gw: GW3,
      cols: [
        [L(122, 117, 112), L(137, 133, 128)],
        [L(123, 118, 113), L(137, 132, 127)],
        [L(124, 118, 113), L(136, 131, 127)],
        [L(126, 120, 115), L(136, 131, 126)],
      ],
    },
  ]),
  ...speedRows('20', [
    {
      gw: GW1,
      cols: [
        [L(151, 146, 141), L(161, 157, 153)],
        [L(152, 148, 143), L(161, 157, 153)],
        [L('', '', 144), L('', '', 153)],
        ['', ''],
      ],
    },
    {
      gw: GW2,
      cols: [
        [L(136, 132, 128, 123), L(150, 146, 142, 137)],
        [L(138, 133, 129, 124), L(150, 146, 141, 137)],
        [L(140, 135, 131, 126), L(149, 145, 141, 136)],
        [L('', 136, 133, 128), L('', 145, 141, 136)],
      ],
    },
    {
      gw: GW3,
      cols: [
        [L(118, 113, 109), L(133, 129, 124)],
        [L(119, 114, 109), L(133, 128, 123)],
        [L(120, 114, 109), L(132, 127, 123)],
        [L(122, 116, 111), L(132, 127, 122)],
      ],
    },
  ]),
  ...speedRows('25', [
    {
      gw: GW1,
      cols: [
        [L(146, 141, 137), L(157, 153, 149)],
        [L(147, 143, 138), L(157, 153, 149)],
        [L('', '', 139), L('', '', 149)],
        ['', ''],
      ],
    },
    {
      gw: GW2,
      cols: [
        [L(132, 127, 123, 119), L(145, 141, 137, 133)],
        [L(134, 129, 124, 120), L(145, 141, 137, 133)],
        [L(136, 131, 126, 122), L(145, 141, 137, 133)],
        [L('', 132, 128, 124), L('', 140, 136, 132)],
      ],
    },
    {
      gw: GW3,
      cols: [
        [L(114, 109, 105), L(129, 125, 120)],
        [L(115, 110, 106), L(129, 124, 120)],
        [L(116, 110, 106), L(128, 124, 119)],
        [L(118, 112, 108), L(128, 123, 118)],
      ],
    },
  ]),
];

/* ---------- STAB TRIM SETTING ---------- */

const trimRow = (cg: string, f5: string, f1520: string, f25: string): FigCell[] => [
  { t: cg },
  { t: f5, align: 'left' },
  { t: f1520, align: 'left' },
  { t: f25, align: 'left' },
];

const STAB_TRIM_TABLE: FigRow[] = [
  [
    { t: 'CG', h: true, rs: 3, valign: 'top', align: 'left' },
    { t: 'FLAPS', h: true, cs: 3 },
  ],
  [
    { t: '5', h: true },
    { t: '15 / 20', h: true },
    { t: '25', h: true },
  ],
  [{ t: 'UNITS AIRPLANE NOSE UP', h: true, cs: 3 }],
  trimRow(L(10, 12, 14, 16), L('6 3/4', '6 1/2', '6 1/4', '6'), L('7 1/2', '7 1/4', '7', '6 3/4'), L('8 1/4', '8', '7 3/4', '7 1/2')),
  trimRow(L(18, 20, 22, 24), L('5 3/4', '5 1/2', '5', '4 3/4'), L('6 1/2', '6', '5 3/4', '5 1/4'), L('7', '6 1/2', '6 1/4', '5 3/4')),
  trimRow(L(26, 28, 30, 32), L('4 1/2', '4', '3 3/4', '3 1/2'), L('4 3/4', '4 1/2', '4', '3 3/4'), L('5 1/4', '4 3/4', '4 1/4', '4')),
  trimRow(
    L(34, 36, 38, 40, 42),
    L('3 1/4', '2 3/4', '2 1/2', '2 1/2', '2 1/2'),
    L('3 1/4', '3', '2 1/2', '2 1/2', '2 1/2'),
    L('3 1/2', '3', '2 1/2', '2 1/2', '2 1/2'),
  ),
];

/* ---------- FLAP RETRACTION / MANEUVERING SPEEDS ---------- */

const FLAP_SPEEDS_TABLE: FigRow[] = [
  [
    { t: L('GROSS', 'WEIGHT', 'LB'), h: true, rs: 2 },
    { t: 'FLAP POSITION', h: true, cs: 4 },
  ],
  [
    { t: '15', h: true },
    { t: '5', h: true },
    { t: '2', h: true },
    { t: '0', h: true },
  ],
  [{ t: L('154500', '& BELOW') }, { t: '150' }, { t: '160' }, { t: '190' }, { t: '200' }],
  [{ t: L('154501', 'TO', '176000') }, { t: '160' }, { t: '170' }, { t: '200' }, { t: '210' }],
  [{ t: L('176001', 'TO', '191000') }, { t: '170' }, { t: '180' }, { t: '210' }, { t: '220' }],
  [{ t: L('ABOVE', '191000') }, { t: '180' }, { t: '190' }, { t: '225' }, { t: '235' }],
];

export const FIG83_B727_TAKEOFF_PERFORMANCE: FigureTable = {
  kind: 'figure',
  cautions: [
    "El primer intervalo de EPR tiene un signo inconsistente entre °F y °C en la publicación original. No se ha supuesto una temperatura corregida."
],
  id: 'performance-despegue-b727',
  title: 'Performance de despegue del Boeing 727',
  aircraft: 'Boeing 727',
  category: 'Despegue',
  summary:
    'EPR máximo de despegue por altitud de presión y OAT, velocidades V1 = VR y V2 por flaps, peso y OAT, ajuste del compensador de estabilizador por CG y velocidades de retracción de flaps/maniobra. Se usa con las condiciones de despegue del Boeing 727.',
  source: {
    figure: 'FIGURE 83',
    originalTitle: 'Takeoff Performance.',
    document: SOURCE_EDITION,
    references: historicalReferences(124),
  },
  related: ['condiciones-despegue-b727', 'reglaje-altimetrico-altitud-presion'],
  help: {
    purpose:
      'Obtener los datos de despegue de un trirreactor: EPR máximo de despegue de los motores 1 y 3 y del motor 2, correcciones por sangrado, velocidades V1, VR y V2, unidades de compensador de estabilizador y velocidades mínimas de retracción de flaps y de maniobra.',
    glossary: [
      { term: 'EPR', meaning: 'Engine Pressure Ratio: relación de presiones del motor usada como indicador de empuje.' },
      { term: 'OAT', meaning: 'Outside Air Temperature: temperatura del aire exterior, en °F (línea superior) y °C (línea inferior).' },
      { term: 'PRESS ALT', meaning: 'Altitud de presión del aeródromo (en pies, o en miles de pies en la tabla de velocidades).' },
      { term: 'AIRBLEED', meaning: 'Sangrado de aire del motor: la tabla de EPR supone sangrado activo en los motores 1 y 3 y sin sangrado en el motor 2.' },
      { term: 'V1 = VR', meaning: 'Velocidad de decisión, igual aquí a la velocidad de rotación (nudos).' },
      { term: 'V2', meaning: 'Velocidad de seguridad de despegue (nudos).' },
      { term: 'STAB TRIM', meaning: 'Ajuste del compensador del estabilizador horizontal, en unidades de morro arriba (AIRPLANE NOSE UP).' },
      { term: 'CG', meaning: 'Posición del centro de gravedad en porcentaje de la cuerda aerodinámica media (% MAC). Se calcula con (estación del CG − LEMAC) ÷ MAC × 100.' },
      { term: 'ANTI-SKID OPERATIVE', meaning: 'Las velocidades son válidas con el sistema antideslizante de frenos operativo.' },
    ],
    steps: [
      'Determina la altitud de presión y la OAT del aeródromo, el peso bruto, la posición de flaps de despegue y el CG.',
      'EPR: entra en MAX TAKEOFF EPR por la fila de altitud de presión y la columna de OAT; lee el valor superior para los motores 1 y 3 y el inferior para el motor 2.',
      'Aplica las correcciones de sangrado (EPR BLEED CORRECTIONS) y, si procede, la nota de reducción del EPR del motor 2 con el sangrado de 6.ª etapa.',
      'Velocidades: en la tabla PRESSURE ALT - 1000 FT localiza la fila de altitud de presión y la columna cuyo rango de OAT contiene la temperatura; baja por esa columna hasta los flaps y el peso bruto y lee V1 = VR (izquierda) y V2 (derecha).',
      'Compensador: en STAB TRIM SETTING cruza el CG con la posición de flaps (5, 15 / 20 o 25) para obtener las unidades de morro arriba.',
      'Retracción de flaps: en FLAP RETRACTION/ MANEUVERING SPEEDS elige la banda de peso y lee la velocidad mínima para cada posición de flaps (15, 5, 2, 0).',
    ],
    tips: [
      'Los pesos brutos de la tabla V1, VR, V2 están en miles de libras (1000 LB); los de la tabla de retracción de flaps, en libras.',
      'Las casillas vacías de la tabla de velocidades no tienen dato: no extrapoles fuera de lo publicado.',
      'En estos ejercicios, interpola entre pesos solo si el enunciado y los límites de la tabla lo permiten.',
      'Tras el despegue, para virajes de más de 15° de alabeo mantén al menos V2 +10 con flaps de despegue, como indica la nota.',
    ],
  },
  sheets: [
    {
      caption: 'Takeoff Performance.',
      blocks: [
        { type: 'heading', text: 'TAKEOFF EPR, SPEEDS\nAND\nSTAB TRIM SETTING', size: 'xl', align: 'center' },
        {
          type: 'columns',
          widths: ['40%', '22%', '38%'],
          align: 'end',
          columns: [
            [{ type: 'heading', text: 'MAX TAKEOFF EPR', size: 'lg', align: 'left' }],
            [{ type: 'text', text: '0 - 60 KNOTS', align: 'right' }],
            [
              {
                type: 'table',
                rows: [
                  [
                    { t: 'ENG 1 & 3', bare: true, align: 'left' },
                    { t: 'AIRBLEED ON', bare: true, align: 'left' },
                  ],
                  [
                    { t: 'ENG 2', bare: true, align: 'left' },
                    { t: 'NO AIRBLEED', bare: true, align: 'left' },
                  ],
                ],
              },
            ],
          ],
        },
        {
          type: 'table',
          rows: EPR_TABLE,
          headerRows: 1,
          dense: true,
          colWidths: ['7%', '3%', '7%', '8%', ...Array<string>(15).fill('5%')],
        },
        {
          type: 'columns',
          widths: ['40%', '60%'],
          align: 'start',
          columns: [
            [
              { type: 'table', rows: EPR_CORRECTIONS, dense: true, colWidths: ['56%', '22%', '22%'] },
              {
                type: 'text',
                text: 'REDUCE ENG 2 EPR BY .05 WITH 6TH\nSTAGE BLEED ON (IF INSTALLED) FOR 10 °C\n(50 °F) OAT & WARMER',
                size: 'sm',
              },
              { type: 'spacer', size: 'sm' },
              { type: 'text', text: 'V_{1}, V_{R}, V_{2}\nANTI-SKID OPERATIVE', size: 'lg', boxed: true, align: 'center' },
              { type: 'spacer', size: 'md' },
              { type: 'heading', text: 'STAB TRIM\nSETTING', size: 'lg', align: 'center' },
              { type: 'table', rows: STAB_TRIM_TABLE, headerRows: 3, dense: true, align: 'center' },
              { type: 'spacer', size: 'md' },
              { type: 'heading', text: 'FLAP RETRACTION/\nMANEUVERING SPEEDS', size: 'lg', align: 'center' },
              { type: 'table', rows: FLAP_SPEEDS_TABLE, headerRows: 2, dense: true, align: 'center' },
              {
                type: 'text',
                text: 'FOR MANEUVERS IMMEDIATELY AFTER\nTAKEOFF EXCEEDING 15° BANK MAINTAIN\nAT LEAST V_{2} +10 AT TAKEOFF FLAPS',
                size: 'sm',
                align: 'center',
              },
            ],
            [
              {
                type: 'table',
                rows: SPEEDS_TABLE,
                headerRows: 1,
                dense: true,
                colWidths: ['10%', '13%', ...Array.from({ length: 4 }, () => ['7%', '5.25%', '7%']).flat()],
              },
            ],
          ],
        },
      ],
    },
  ],
  uncertain: [
    "El encabezado del primer intervalo EPR aparece como «67 TO -9» en °F y «-55 TO -23» en °C también en el PDF de 2005. Se conserva la impresión y se señala la inconsistencia.",
    "La publicación de mayor resolución permite confirmar 3856 ft en la última fila EPR y V2 = 136 kt con flaps 15, 140000 lb y cuarta banda de OAT.",
    "Se confirmaron 116 kt con flaps 20, 130000 lb y cuarta banda de OAT, y 166 kt con flaps 5, 210000 lb y segunda banda de OAT."
],
};
