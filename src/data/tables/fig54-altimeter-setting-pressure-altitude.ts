import { historicalReferences, SOURCE_EDITION } from './sources';
import type { FigCell, FigRow, FigureTable } from './types';

/** QNH ranges in in.Hg and millibars, with the published correction in feet. */
function row(inFrom: string, inTo: string, correction: string, mbFrom: string, mbTo: string): FigRow {
  const range = (from: string, to: string): FigCell => ({ t: `${from}\nto ${to}`, align: 'left', stagger: true });
  return [range(inFrom, inTo), { t: correction, bold: true, valign: 'top' }, range(mbFrom, mbTo)];
}

export const FIG54_ALTIMETER_SETTING_PRESSURE_ALTITUDE: FigureTable = {
  id: 'reglaje-altimetrico-altitud-presion',
  kind: 'figure',
  title: 'Reglaje altimétrico a altitud de presión',
  category: 'Altimetría',
  summary:
    'Corrección que se suma a la elevación según el QNH (in.Hg o milibares) para obtener la altitud de presión, con una regla de presión de estación QFE.',
  source: {
    figure: 'FIGURE 54',
    originalTitle: 'Altimeter Setting to Pressure Altitude.',
    document: SOURCE_EDITION,
    references: historicalReferences(106),
    equivalentFigures: ['FIGURE 82'],
  },
  related: ['condiciones-despegue-b737', 'condiciones-despegue-b727'],
  help: {
    purpose:
      'Obtener la altitud de presión de un aeródromo a partir de su elevación y del reglaje altimétrico (QNH), sumando la corrección tabulada para el intervalo de QNH correspondiente.',
    glossary: [
      { term: 'QNH', meaning: 'Reglaje altimétrico: con él, el altímetro indica la elevación del aeródromo en tierra.' },
      { term: 'QFE', meaning: 'Presión atmosférica a la elevación de la estación (presión de estación).' },
      { term: 'IN. HG.', meaning: 'Pulgadas de mercurio, unidad del QNH en la columna izquierda.' },
      { term: 'MILLIBARS / MBS', meaning: 'Milibares (equivalentes a hectopascales), unidad del QNH en la columna derecha y de la regla QFE.' },
      { term: 'PRESS. ALT', meaning: 'Altitud de presión: altitud en la atmósfera estándar correspondiente a la presión dada.' },
      { term: '1000 FT', meaning: 'Escala derecha de la regla, en miles de pies.' },
    ],
    steps: [
      'Localiza el intervalo que contiene el QNH, en la columna de in.Hg o en la de milibares.',
      'Lee en la columna central la corrección en pies de esa misma fila (positiva o negativa).',
      'Suma la corrección a la elevación del aeródromo: el resultado es la altitud de presión.',
      'Comprueba el procedimiento con el ejemplo impreso: elevación 2500 ft, QNH 29.48 in.Hg, corrección 400 ft, altitud de presión 2900 ft.',
      'Con la regla vertical, a una presión de estación (QFE) en milibares a la izquierda le corresponde la altitud de presión en miles de pies a la derecha.',
    ],
    tips: [
      'Las correcciones negativas (QNH alto) se restan de la elevación.',
      'Los extremos de intervalos consecutivos se repiten (p. ej. 28.91 cierra una fila y abre la siguiente); la tabla no indica cuál aplicar en ese valor exacto.',
      'La escala de pies de la regla no es lineal: interpola solo entre marcas cercanas.',
      'No confundas la columna de in.Hg con la de milibares al buscar el intervalo.',
    ],
  },
  sheets: [
    {
      caption: 'Altimeter Setting to Pressure Altitude.',
      blocks: [
        { type: 'heading', text: 'ALTIMETER SETTING\nTO\nSTATION PRESSURE', size: 'sm', align: 'center', boxed: true },
        { type: 'spacer', size: 'md' },
        {
          type: 'columns',
          widths: ['22%', '78%'],
          align: 'stretch',
          columns: [
            [
              {
                type: 'scale',
                title: 'QFE\nSTATION\nPRESSURE',
                leftUnit: 'MBS',
                rightUnit: '1000 FT',
                left: [
                  { label: '700', pos: 0.045 },
                  { label: '750', pos: 0.181 },
                  { label: '800', pos: 0.318 },
                  { label: '850', pos: 0.453 },
                  { label: '900', pos: 0.589 },
                  { label: '950', pos: 0.724 },
                  { label: '1000', pos: 0.861 },
                  { label: '1050', pos: 0.997 },
                ],
                right: [
                  { label: '10', pos: 0.037 },
                  { label: '9', pos: 0.112 },
                  { label: '8', pos: 0.188 },
                  { label: '7', pos: 0.267 },
                  { label: '6', pos: 0.35 },
                  { label: '5', pos: 0.435 },
                  { label: '4', pos: 0.522 },
                  { label: '3', pos: 0.612 },
                  { label: '2', pos: 0.704 },
                  { label: '1', pos: 0.799 },
                  { label: '0', pos: 0.897 },
                  { label: '-1', pos: 0.999 },
                ],
                minorTicks: 73,
              },
            ],
            [
              { type: 'heading', text: 'QNH TO PRESSURE ALTITUDE', size: 'sm', align: 'center' },
              {
                type: 'table',
                headerRows: 1,
                colWidths: ['34%', '32%', '34%'],
                rows: [
                  [
                    { t: 'QNH\nIN. HG.', h: true, bold: true },
                    { t: 'CORRECTION\nTO\nELEVATION\nFOR\nPRESS. ALT\nFT', h: true, bold: true },
                    { t: 'QNH\nMILLIBARS', h: true, bold: true },
                  ],
                  row('28.81', '28.91', '1000', '976', '979'),
                  row('28.91', '29.02', '900', '979', '983'),
                  row('29.02', '29.12', '800', '983', '986'),
                  row('29.12', '29.23', '700', '986', '990'),
                  row('29.23', '29.34', '600', '990', '994'),
                  row('29.34', '29.44', '500', '994', '997'),
                  row('29.44', '29.55', '400', '997', '1001'),
                  row('29.55', '29.66', '300', '1001', '1004'),
                  row('29.66', '29.76', '200', '1004', '1008'),
                  row('29.76', '29.87', '100', '1008', '1012'),
                  row('29.87', '29.97', '0', '1012', '1015'),
                  row('29.97', '30.08', '-100', '1015', '1019'),
                  row('30.08', '30.19', '-200', '1019', '1022'),
                  row('30.19', '30.30', '-300', '1022', '1026'),
                  row('30.30', '30.41', '-400', '1026', '1030'),
                  row('30.41', '30.52', '-500', '1030', '1034'),
                  row('30.52', '30.63', '-600', '1034', '1037'),
                  row('30.63', '30.74', '-700', '1037', '1041'),
                  row('30.74', '30.85', '-800', '1041', '1045'),
                  row('30.85', '30.96', '-900', '1045', '1048'),
                  row('30.96', '31.07', '-1000', '1048', '1052'),
                ],
              },
              {
                type: 'text',
                text: 'EXAMPLE:  ELEVATION = 2500 FT\nQNH = 29.48 IN.HG\nCORRECTION = 400 FT.\nPRESS ALT = 2900 FT',
                align: 'center',
                size: 'sm',
              },
            ],
          ],
        },
      ],
    },
  ],
  uncertain: [
    "Las dos láminas de altimetría aportadas contienen los mismos 21 intervalos, ejemplo y escala QFE. Se ofrece una sola tabla.",
    "Las posiciones de las marcas QFE se tomaron del escaneo: la regla es una referencia visual, no un conversor de precisión. Los intervalos QNH comparten sus extremos sin indicar una prioridad."
],
};
