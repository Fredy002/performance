import { historicalReferences, SOURCE_EDITION } from './sources';
import type { FigCell, FigureTable } from './types';

const W = '7.67%';

const dataRow = (alt: string, units: string, ...values: string[]): FigCell[] => [
  { t: alt, align: 'center' },
  { t: units, align: 'center' },
  ...values.map((t): FigCell => ({ t, align: 'right' })),
];

const footCell = (t: string): FigCell => ({ t, bold: true, small: true, align: 'center' });

export const FIG57_EN_ROUTE_CLIMB_ISA: FigureTable = {
  id: 'ascenso-ruta-280-070-isa',
  kind: 'figure',
  title: 'Ascenso en ruta 280/.70 ISA',
  category: 'Ascenso en ruta',
  aircraft: 'Boeing 737',
  summary:
    'Tiempo (min), combustible (lb), distancia (NM) y TAS (kt) del ascenso en ruta a 280 kt/M .70 en atmósfera estándar, según altitud de presión y peso al soltar frenos, con ajuste de combustible para aeropuertos elevados.',
  source: {
    figure: 'FIGURE 57',
    originalTitle: 'En Route Climb 280/.70 ISA.',
    document: SOURCE_EDITION,
    references: historicalReferences(108),
  },
  related: ['condiciones-ascenso-ruta-b737', 'ascenso-ruta-280-070-isa-mas-10'],
  sheets: [
    {
      caption: 'En Route Climb 280/.70 ISA.',
      blocks: [
        { type: 'heading', text: 'EN ROUTE CLIMB 280/.70 ISA', size: 'xl', align: 'center' },
        {
          type: 'table',
          dense: true,
          headerRows: 2,
          colWidths: ['6.9%', '8.7%', W, W, W, W, W, W, W, W, W, W, W],
          rows: [
            [
              { t: 'PRESSURE\nALTITUDE\n-FT', h: true, bold: true, small: true, rs: 2 },
              { t: 'UNITS\nMIN/LB\nNM/KNOTS', h: true, bold: true, small: true, rs: 2 },
              { t: 'BRAKE RELEASE WEIGHT - LB', h: true, cs: 11 },
            ],
            ['120000', '115000', '110000', '105000', '100000', '95000', '90000', '85000', '80000', '75000', '65000'].map(
              (t): FigCell => ({ t, h: true }),
            ),
            dataRow('37000', 'TIME/FUEL\nDIST./TAS', '', '41/5700\n251/387', '32/4700\n192/384', '27/4100\n162/382', '24/3700\n140/380', '21/3400\n124/379', '19/3100\n111/378', '17/2800\n100/377', '16/2500\n90/376', '14/2300\n82/375', '12/1900\n67/374'),
            dataRow('36000', 'TIME/FUEL\nDIST./TAS', '41/5900\n246/386', '33/4900\n194/383', '28/4300\n164/381', '25/3900\n143/379', '22/3500\n127/378', '20/3200\n114/377', '18/2900\n103/376', '16/2700\n93/375', '15/2500\n84/374', '14/2300\n77/374', '11/1900\n63/373'),
            dataRow('35000', 'TIME/FUEL\nDIST./TAS', '33/5100\n197/382', '29/4500\n168/380', '25/4100\n147/378', '23/3700\n131/377', '21/3400\n117/376', '19/3100\n106/375', '17/2800\n96/374', '16/2600\n87/373', '14/2400\n80/373', '13/2200\n73/372', '11/1800\n60/371'),
            dataRow('34000', 'TIME/FUEL\nDIST./TAS', '29/4700\n171/379', '26/4300\n150/377', '23/3900\n134/376', '21/3500\n120/375', '19/3200\n109/374', '18/3000\n99/373', '16/2700\n90/372', '15/2500\n82/372', '14/2300\n75/371', '12/2100\n69/371', '10/1800\n57/370'),
            dataRow('33000', 'TIME/FUEL\nDIST./TAS', '27/4400\n153/376', '24/4000\n137/375', '22/3700\n123/374', '20/3400\n112/373', '18/3100\n102/372', '17/2900\n93/371', '15/2700\n85/370', '14/2500\n78/370', '13/2300\n71/369', '12/2100\n65/369', '10/1700\n54/368'),
            dataRow('32000', 'TIME/FUEL\nDIST./TAS', '25/4200\n139/374', '23/3900\n126/372', '21/3600\n114/371', '19/3300\n104/370', '17/3000\n95/370', '16/2800\n87/369', '15/2600\n80/368', '14/2400\n74/368', '12/2200\n67/367', '11/2000\n62/367', '10/1700\n51/366'),
            dataRow('31000', 'TIME/FUEL\nDIST./TAS', '23/4000\n128/371', '21/3700\n117/370', '19/3400\n107/369', '18/3200\n98/368', '16/2900\n90/367', '15/2700\n82/367', '14/2500\n76/366', '13/2300\n70/366', '12/2100\n64/365', '11/2000\n59/365', '9/1700\n49/364'),
            dataRow('30000', 'TIME/FUEL\nDIST./TAS', '22/3900\n119/368', '20/3600\n109/367', '18/3300\n100/366', '17/3100\n92/365', '16/2800\n84/365', '15/2600\n78/364', '13/2400\n72/364', '12/2300\n66/363', '11/2100\n61/363', '11/1900\n56/363', '9/1600\n47/362'),
            dataRow('29000', 'TIME/FUEL\nDIST./TAS', '21/3700\n111/365', '19/3400\n102/364', '18/3200\n93/363', '16/3000\n86/363', '15/2700\n79/362', '14/2500\n73/362', '13/2400\n68/361', '12/2200\n62/361', '11/2000\n57/361', '10/1900\n53/360', '9/1600\n44/360'),
            dataRow('28000', 'TIME/FUEL\nDIST./TAS', '19/3600\n103/362', '18/3300\n95/361', '17/3100\n88/360', '15/2900\n81/360', '14/2700\n75/359', '13/2500\n69/359', '12/2300\n64/359', '11/2100\n59/358', '11/2000\n54/358', '10/1800\n50/358', '8/1500\n42/357'),
            dataRow('27000', 'TIME/FUEL\nDIST./TAS', '19/3400\n96/358', '17/3200\n89/358', '16/3000\n82/357', '15/2800\n76/357', '14/2600\n71/356', '13/2400\n65/356', '12/2200\n60/356', '11/2100\n56/356', '10/1900\n52/355', '9/1800\n47/355', '8/1500\n40/355'),
            dataRow('26000', 'TIME/FUEL\nDIST./TAS', '17/3300\n88/354', '16/3000\n82/354', '15/2800\n76/353', '14/2600\n70/353', '13/2500\n65/352', '12/2300\n60/352', '11/2100\n56/352', '10/2000\n52/352', '10/1800\n48/351', '9/1700\n44/351', '7/1400\n37/351'),
            dataRow('25000', 'TIME/FUEL\nDIST./TAS', '16/3100\n81/350', '15/2900\n75/350', '14/2700\n70/349', '13/2500\n65/349', '12/2400\n60/349', '11/2200\n56/348', '11/2000\n52/348', '10/1900\n48/348', '9/1800\n45/348', '8/1600\n41/348', '7/1400\n35/347'),
            dataRow('24000', 'TIME/FUEL\nDIST./TAS', '15/3000\n75/346', '14/2800\n69/346', '13/2600\n65/345', '12/2400\n60/345', '12/2300\n56/345', '11/2100\n52/345', '10/2000\n48/345', '9/1800\n45/344', '9/1700\n41/344', '8/1600\n38/344', '7/1300\n32/344'),
            dataRow('23000', 'TIME/FUEL\nDIST./TAS', '14/2800\n69/342', '13/2700\n64/342', '13/2500\n60/342', '12/2300\n56/342', '11/2200\n52/342', '10/2000\n48/341', '9/1900\n45/341', '9/1800\n41/341', '8/1600\n38/341', '8/1500\n35/341', '6/1300\n30/341'),
            dataRow('22000', 'TIME/FUEL\nDIST./TAS', '14/2700\n63/339', '13/2500\n59/339', '12/2400\n55/338', '11/2200\n51/338', '10/2100\n48/338', '10/1900\n45/338', '9/1800\n41/338', '8/1700\n38/338', '8/1600\n36/338', '7/1400\n33/338', '6/1200\n28/337'),
            { break: true, lines: 4 },
            dataRow('6000', 'TIME/FUEL\nDIST./TAS', '4/1000\n9/295', '4/1000\n9/295', '4/900\n8/295', '4/800\n8/295', '3/800\n7/295', '3/700\n7/295', '3/700\n6/295', '3/700\n6/295', '3/600\n5/295', '2/600\n5/295', '2/500\n4/295'),
            dataRow('1500', 'TIME/FUEL', '2/600', '2/600', '2/500', '2/500', '2/500', '2/400', '2/400', '2/400', '1/400', '1/300', '1/300'),
          ],
        },
        {
          type: 'columns',
          widths: ['6.9%', '83.9%', '9.2%'],
          align: 'start',
          columns: [
            [],
            [
              {
                type: 'table',
                dense: true,
                colWidths: ['43.3%', '18.3%', '6.9%', '6.8%', '6.4%', '6.4%', '5.9%', '6%'],
                rows: [
                  [
                    { t: 'FUEL ADJUSTMENT FOR HIGH ELEVATION AIRPORTS\nEFFECT ON TIME AND DISTANCE IS NEGLIGIBLE', bold: true, small: true, rs: 2 },
                    footCell('AIRPORT ELEVATION'),
                    ...['2000', '4000', '6000', '8000', '10000', '12000'].map(footCell),
                  ],
                  [footCell('FUEL ADJUSTMENT'), ...['-100', '-200', '-400', '-500', '-600', '-700'].map(footCell)],
                ],
              },
            ],
            [],
          ],
        },
      ],
    },
  ],
  help: {
    purpose:
      'Permite obtener el tiempo, el combustible, la distancia y la TAS tabulada del ascenso en ruta a 280 kt / Mach .70 con temperatura ISA, desde la salida hasta la altitud de presión de crucero, en función del peso al soltar frenos.',
    glossary: [
      { term: 'PRESSURE ALTITUDE', meaning: 'Altitud de presión de destino del ascenso, en pies.' },
      { term: 'BRAKE RELEASE WEIGHT', meaning: 'Peso al soltar frenos al inicio del despegue, en libras.' },
      { term: 'TIME/FUEL', meaning: 'Línea superior de cada celda: tiempo en minutos / combustible en libras.' },
      { term: 'DIST./TAS', meaning: 'Línea inferior de cada celda: distancia en millas náuticas / velocidad verdadera en nudos.' },
      { term: '280/.70', meaning: 'Perfil de ascenso a 280 kt de velocidad indicada y, más arriba, a Mach .70.' },
      { term: 'FUEL ADJUSTMENT', meaning: 'Corrección de combustible (lb) según la elevación del aeropuerto de salida.' },
    ],
    steps: [
      'Comprueba que la temperatura es ISA; si es ISA +10°, usa la tabla correspondiente.',
      'Localiza la fila de la altitud de presión de crucero y la columna del peso al soltar frenos.',
      'Lee en la línea superior el tiempo (min) y el combustible (lb), y en la inferior la distancia (NM) y la TAS (kt).',
      'Si el aeropuerto está elevado, suma al combustible el ajuste (negativo) de la elevación correspondiente; la fuente considera despreciable el efecto sobre el tiempo y la distancia.',
      'Corrige la distancia por el viento medio usando el tiempo de ascenso si el ejercicio lo pide.',
    ],
    tips: [
      'Hay filas omitidas entre 22000 y 6000 ft (marca de corte): no se pueden leer directamente.',
      'La fila de 1500 ft solo da tiempo y combustible.',
      'Algunas celdas están vacías en la fuente (p. ej. 37000 ft con 120000 lb): no hay dato para esa combinación.',
      'Los valores se transcriben tal cual la fuente; interpola entre pesos o altitudes solo si el ejercicio lo admite.',
    ],
  },
};
