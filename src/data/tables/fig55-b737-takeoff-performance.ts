import { historicalReferences, SOURCE_EDITION } from './sources';
import type { FigCell, FigRow, FigureTable } from './types';

const r = (t: string): FigCell => ({ t, align: 'right' });
const c = (t: string): FigCell => ({ t, align: 'center' });
const bare = (t = ''): FigCell => ({ t, bare: true });
const ptr = (t: string): FigCell => ({ t, pointer: true, bare: true, small: true, align: 'right' });

const OAT_F = ['-65', '-49', '-40', '-31', '-22', '-13', '-4', '5', '14', '23', '32', '41', '50', '59', '68', '77', '86', '95', '104', '120'];
const OAT_C = ['-54', '-45', '-40', '-35', '-30', '-25', '-20', '-15', '-10', '-5', '0', '5', '10', '15', '20', '25', '30', '35', '40', '49'];
const TEMP_LIMIT = ['2.31', '2.31', '2.31', '2.29', '2.27', '2.24', '2.22', '2.19', '2.17', '2.14', '2.11', '2.07', '2.04', '2.01', '2.01', '2.01', '2.00', '1.95', '1.91', '1.82'];

/** OAT ranges by pressure altitude: Fahrenheit above Celsius. */
const altRow = (alt: string, ...ranges: string[]): FigCell[] => [
  { t: alt, cs: 2, align: 'center' },
  { t: 'F°\nC°', arrow: true, small: true, align: 'left' },
  ...ranges.map(c),
];

/** The final OAT band connects to the speed columns in the source scan. */
const lastAltRow = (alt: string, ...ranges: string[]): FigCell[] => [
  ...altRow(alt).slice(0, 2),
  ...ranges.map((t): FigCell => ({ t, align: 'center', open: ['b'] })),
];

/**
 * Connector row between the source OAT bands and speed columns.
 */
const connectorRow: FigCell[] = [
  { t: '', open: ['r'] },
  { t: '', open: ['l', 'r'] },
  { t: '', open: ['l', 'r'] },
  { t: '', open: ['l', 't', 'b'] },
  ...Array.from({ length: 5 }, (): FigCell => ({ t: '', open: ['t', 'b'] })),
];

/** Flap group: weights and six V1/VR/V2 columns; blank lines preserve missing data. */
const flapRow = (flaps: string, weights: string[], ...cols: string[][]): FigCell[] => [
  c(flaps),
  { t: weights.join('\n'), cs: 2, align: 'center' },
  ...cols.map((lines) => c(lines.join('\n'))),
];

/** Speed headers aligned with their source OAT bands. */
const VSPEEDS_HEAD: FigCell = { t: 'V_{1} V_{R} V_{2}', h: true, align: 'center', open: ['t'] };

const vRows: FigRow[] = [
  [
    { t: 'PRESSURE\nALTITUDE\n1000 FT', cs: 2, h: true, bold: true, align: 'center', small: true },
    { t: 'OAT', cs: 7, h: true, bold: true, align: 'center' },
  ],
  altRow('9 to 10', '', '', '-65 to -19\n-54 to -28', '-18 to 18\n-27 to -8', '19 to 45\n-7 to 7', '46 to 86\n8 to 30'),
  altRow('7 to 9', '', '-65 to -21\n-54 to -29', '-20 to 10\n-28 to -23', '11 to 39\n-22 to 4', '40 to 87\n5 to 31', '88 to 101\n32 to 38'),
  altRow('5 to 7', '-65 to -15\n-54 to -26', '-14 to 15\n-27 to -9', '16 to 40\n-8 to 4', '41 to 87\n5 to 31', '88 to 105\n32 to 40', '106 to 109\n41 to 43'),
  altRow('3 to 5', '-65 to 20\n-54 to -8', '21 to 42\n-7 to 6', '43 to 88\n7 to 31', '89 to 103\n32 to 39', '104 to 116\n40 to 46', ''),
  altRow('1 to 3', '-65 to 46\n-54 to 8', '47 to 89\n9 to 32', '90 to 104\n33 to 40', '105 to 120\n41 to 49', '', ''),
  lastAltRow('-1 to 1', '-65 to 91\n-54 to 33', '92 to 105\n34 to 40', '106 to 120\n41 to 49', '', '', ''),
  connectorRow,
  [
    { t: 'FLAPS', h: true, align: 'center', valign: 'top', small: true },
    { t: 'GROSS WT\n-1000 LB', cs: 2, h: true, align: 'center', small: true },
    VSPEEDS_HEAD,
    VSPEEDS_HEAD,
    VSPEEDS_HEAD,
    VSPEEDS_HEAD,
    VSPEEDS_HEAD,
    VSPEEDS_HEAD,
  ],
  flapRow(
    '1',
    ['120', '110', '100', '90', '80', '70'],
    ['159 161 164', '150 152 155', '141 143 147', '131 133 138', '122 124 130', '112 116 123'],
    ['160 162 164', '151 153 155', '142 143 147', '132 134 138', '122 125 130', '113 117 123'],
    ['', '152 154 155', '142 144 147', '133 135 138', '123 126 130', '113 117 122'],
    ['', '', '143 145 147', '133 136 138', '124 126 130', '114 118 122'],
    ['', '', '144 146 147', '134 136 138', '125 127 130', '115 119 122'],
    ['', '', '', '135 137 138', '125 128 130', '116 119 122'],
  ),
  flapRow(
    '5',
    ['120', '110', '100', '90', '80', '70'],
    ['153 155 158', '144 146 150', '135 137 142', '126 128 133', '116 118 125', '106 109 118'],
    ['154 156 158', '145 147 150', '136 138 142', '127 129 133', '117 119 125', '107 110 118'],
    ['', '', '137 139 142', '128 130 133', '118 121 125', '108 111 117'],
    ['', '', '138 140 142', '129 131 133', '119 122 125', '109 112 117'],
    ['', '', '', '130 132 133', '120 123 125', '110 113 117'],
    ['', '', '', '', '121 124 125', '112 114 117'],
  ),
  flapRow(
    '15',
    ['100', '90', '80', '70'],
    ['130 130 135', '120 121 128', '111 112 119', '105 105 112'],
    ['131 131  135', '121 122 128', '112 113 119', '101 103 112'],
    ['132 132 135', '123 123 128', '113 114 119', '102 105 112'],
    ['', '124 124 128', '114 115 119', '103 106 112'],
    ['', '125 125 128', '115 116 119', '105 107 112'],
    ['', '126 126 128', '117 117 119', '106 108 112'],
  ),
  flapRow(
    '25',
    ['100', '90', '80', '70'],
    ['124 126 132', '115 117 124', '105 108 116', '105 105 108'],
    ['126 127 132', '116 118 124', '107 109 116', '104 104 108'],
    ['', '117 119 124', '108 110 116', '101 101 108'],
    ['', '118 120 124', '109 111 116', '99 102 108'],
    ['', '', '110 112 116', '100 103 108'],
    ['', '', '111 113 116', '101 104 108'],
  ),
  [
    {
      t: 'SHADED AREA INDICATES PERFORMANCE AFFECTED BY MINIMUM CONTROL SPEED, MINIMUM\nFIELD LENGTH FOR LIGHTEST WEIGHT ABOVE SHADED AREA IS REQUIRED.',
      cs: 9,
      align: 'center',
      small: true,
    },
  ],
];

export const FIG55_B737_TAKEOFF_PERFORMANCE: FigureTable = {
  id: 'performance-despegue-b737',
  kind: 'figure',
  cautions: [
    "La fuente contiene intervalos °F/°C que no son equivalentes, por ejemplo −20 a 10 °F / −28 a −23 °C a 7000–9000 ft. Se mantienen los valores publicados.",
    "El escaneo no permite identificar las celdas sombreadas por velocidad mínima de control. Esta limitación impide reconstruir esa restricción de la tabla."
],
  title: 'Performance de despegue del Boeing 737',
  category: 'Despegue',
  aircraft: 'Boeing 737',
  summary:
    'EPR de despegue (límite por temperatura y por altitud de presión, con correcciones por sangrado), velocidades V1, VR y V2 según altitud de presión, OAT, flaps y peso, velocidades de retracción de flaps, ajuste del compensador del estabilizador y correcciones de V1 por viento y pendiente.',
  source: {
    figure: 'FIGURE 55',
    originalTitle: 'B-737 – Takeoff Performance.',
    document: SOURCE_EDITION,
    references: historicalReferences(107),
  },
  related: ['condiciones-despegue-b737', 'reglaje-altimetrico-altitud-presion'],
  sheets: [
    {
      caption: 'B-737 – Takeoff Performance.',
      blocks: [
        {
          type: 'columns',
          widths: ['46%', '18%', '36%'],
          align: 'end',
          columns: [
            [
              { type: 'text', text: '0 TO 60 KTS', align: 'center', size: 'sm' },
              { type: 'heading', text: 'TAKEOFF EPR', size: 'lg', align: 'center' },
            ],
            [{ type: 'text', text: 'A/C ON', align: 'center', size: 'sm' }],
            [
              {
                type: 'table',
                dense: true,
                rows: [
                  [
                    { t: 'EPR BLEED CORRECTIONS', align: 'left' },
                    { t: 'Δ EPR', align: 'center', bold: true },
                  ],
                  [
                    { t: 'AIR CONDITIONING OFF', align: 'left' },
                    { t: '+.03', align: 'center' },
                  ],
                  [
                    { t: 'ENGINE ANTI-ICE', align: 'center' },
                    { t: 'ZERO', align: 'center' },
                  ],
                ],
              },
            ],
          ],
        },
        {
          type: 'table',
          dense: true,
          colWidths: ['7%', '3%', ...Array<string>(20).fill('4.5%')],
          rows: [
            [
              { t: 'OAT', rs: 2, bold: true, align: 'center' },
              { t: '°F', h: true, align: 'left' },
              ...OAT_F.map(r),
            ],
            [{ t: '°C', h: true, align: 'left' }, ...OAT_C.map(r)],
            [{ t: 'TEMP\nLIMIT\nEPR', cs: 2, arrow: true, bare: true, align: 'left' }, ...TEMP_LIMIT.map(r)],
            [
              { t: 'PRESS', cs: 2, arrow: true, bare: true, align: 'left' },
              bare(),
              { t: 'EPR', bare: true, small: true, align: 'right', valign: 'top' },
              ptr('2.31\nALT  5660 AND ABOVE'),
              bare(),
              bare(),
              bare(),
              ptr('2.22\n4000'),
              bare(),
              ptr('2.16\n3000'),
              bare(),
              ptr('2.11\n2000'),
              ptr('2.06\n1000'),
              bare(),
              bare(),
              bare(),
              ptr('2.01\nS.L.'),
              ptr('1.96\n-1000'),
              bare(),
              bare(),
              bare(),
            ],
          ],
        },
        {
          type: 'list',
          items: [
            { marker: '①', text: 'FIND TEMP LIMIT EPR' },
            { marker: '②', text: 'FIND PRESS LIMIT EPR' },
            { marker: '③', text: 'USE THE SMALLER OF THE TWO LIMITS' },
          ],
        },
        { type: 'spacer', size: 'md' },
        {
          type: 'columns',
          widths: ['24%', '76%'],
          columns: [
            [
              {
                type: 'table',
                heavy: true,
                rows: [
                  [{ t: 'V_{1} , V_{R}, V_{2}', bold: true, align: 'center' }],
                  [{ t: 'ANTI-SKID ON', bold: true, align: 'center' }],
                ],
              },
              { type: 'spacer', size: 'lg' },
              { type: 'heading', text: 'FLAP\nRETRACTION/\nMANEUVERING\nSPEED', size: 'xl', align: 'center' },
              {
                type: 'table',
                dense: true,
                align: 'center',
                headerRows: 1,
                rows: [
                  [
                    { t: 'FLAP\nPOS', h: true, align: 'center', small: true },
                    { t: 'KTS IAS', h: true, align: 'center' },
                  ],
                  [
                    c('0\n1\n2\n5\n10\n15\n25'),
                    r('210\n190\n180\n170\n160\n150\n140'),
                  ],
                ],
              },
              {
                type: 'text',
                text: 'FOR MANEUVERS IMMEDIATELY\nAFTER TAKE-OFF EXCEEDING 15°\nBANK, MAINTAIN AT LEAST\nV2 + 15 AT TAKEOFF FLAPS',
                align: 'left',
                size: 'sm',
                boxed: true,
              },
              { type: 'spacer', size: 'sm' },
              {
                type: 'table',
                dense: true,
                align: 'center',
                headerRows: 2,
                rows: [
                  [{ t: 'STAB, TRIM SETTING\n-UNITS AIRPLANE NOSE UP', cs: 2, h: true, align: 'left' }],
                  [
                    { t: 'CG', h: true, align: 'center' },
                    { t: 'FLAPS\nALL', h: true, align: 'center' },
                  ],
                  [
                    r('6\n8\n10\n12\n14\n16\n18\n20\n22\n24\n26\n28\n30\n32'),
                    c('8\n7-3/4\n7-1/2\n7\n6-3/4\n6-1/4\n5-3/4\n5-1/2\n5\n4-1/2\n4\n3-1/2\n3\n2-1/2'),
                  ],
                ],
              },
            ],
            [
              {
                type: 'table',
                dense: true,
                headerRows: 1,
                colWidths: ['6.75%', '5.27%', '6.75%', ...Array<string>(6).fill('13.54%')],
                rows: vRows,
              },
              {
                type: 'columns',
                widths: ['42%', '46%', '12%'],
                align: 'start',
                columns: [
                  [
                    {
                      type: 'text',
                      text: 'SPEEDS NOT VALID WHEN\nWEIGHTS ARE PREDICTED\nON USE OF CLEARWAY,\nSTOPWAY, IMPROVED\nCLIMB OR ARE LIMITED\nBY BRAKE ENERGY',
                      align: 'left',
                      size: 'sm',
                    },
                  ],
                  [
                    {
                      type: 'table',
                      dense: true,
                      headerRows: 2,
                      rows: [
                        [{ t: 'V_{1}ADJUSTMENTS*', cs: 2, h: true, align: 'center' }],
                        [
                          { t: 'WIND', h: true, align: 'center' },
                          { t: 'SLOPE', h: true, align: 'center' },
                        ],
                        [
                          { t: 'ADD 1 KT PER\n20 KTS HEADWIND\n\nSUBTRACT 1 KT PER\n5 KTS TAILWIND', align: 'left' },
                          { t: 'ADD 1 KT PER\n1% UP SLOPE\n\nSUBTRACT 1 KT PER\n1% DOWN SLOPE', align: 'left' },
                        ],
                      ],
                    },
                    { type: 'text', text: '*V_{1} MUST NOT EXCEED V_{R}', align: 'center', size: 'sm' },
                  ],
                  [],
                ],
              },
            ],
          ],
        },
      ],
    },
  ],
  help: {
    purpose:
      'Permite obtener los datos de despegue del Boeing 737: el EPR de despegue (el menor entre el límite por temperatura y el límite por altitud de presión, corregido por sangrados), las velocidades V1, VR y V2, las velocidades de retracción de flaps y el ajuste del compensador del estabilizador.',
    glossary: [
      { term: 'EPR', meaning: 'Engine Pressure Ratio: relación de presiones del motor usada como indicación de empuje.' },
      { term: 'TEMP LIMIT EPR / PRESS LIMIT EPR', meaning: 'EPR máximo limitado por la temperatura exterior (OAT) y EPR máximo limitado por la altitud de presión.' },
      { term: 'OAT', meaning: 'Temperatura exterior del aire, en °F (F°) o °C (C°).' },
      { term: 'V_{1} / V_{R} / V_{2}', meaning: 'Velocidad de decisión, velocidad de rotación y velocidad de seguridad en el despegue, en nudos.' },
      { term: 'GROSS WT -1000 LB', meaning: 'Peso bruto de despegue en miles de libras.' },
      { term: 'STAB TRIM', meaning: 'Ajuste del compensador del estabilizador, en unidades de morro arriba, según el CG en % de MAC.' },
      { term: 'ANTI-SKID ON', meaning: 'Las velocidades son válidas con el sistema antideslizante de frenos operativo.' },
    ],
    steps: [
      'Obtén la altitud de presión y la OAT del escenario de despegue.',
      'EPR: busca el límite por temperatura en la fila TEMP LIMIT EPR y el límite por altitud en los recuadros PRESS; usa el menor de los dos y aplica la corrección de sangrado (aire acondicionado OFF: +.03; antihielo de motor: cero).',
      'Velocidades: en la tabla de altitud de presión localiza la fila de tu altitud y la columna cuyo rango contenga la OAT; baja por esa columna hasta el bloque de flaps y la fila del peso para leer V1, VR y V2.',
      'Corrige V1 por viento y pendiente según V1 ADJUSTMENTS, sin superar VR.',
      'Para el compensador, calcula el CG en % de MAC y lee las unidades en la tabla STAB TRIM SETTING.',
    ],
    tips: [
      'Cada celda de velocidades contiene tres valores en el orden V1, VR, V2.',
      'Las celdas vacías indican que no hay datos para esa combinación de peso y condiciones.',
      'La nota inferior indica que en el área sombreada la performance está afectada por la velocidad mínima de control; en esta reproducción el sombreado no es visible.',
      'Las velocidades no son válidas si los pesos se basan en clearway, stopway, ascenso mejorado o están limitados por energía de frenado.',
    ],
  },
  uncertain: [
    "El límite de EPR 1.96 corresponde a −1000 ft en la edición de 2005 y en la imagen aportada; la edición de 2019 imprime 1000 sin signo menos.",
    "Los límites de presión y temperatura son independientes: las flechas del original no relacionan una altitud con la columna de temperatura situada encima.",
    "En FLAPS 15, segunda columna, 70000 lb se conserva 101/103/112, coincidente con la publicación FAA; no se sustituye por una progresión estimada."
],
};
