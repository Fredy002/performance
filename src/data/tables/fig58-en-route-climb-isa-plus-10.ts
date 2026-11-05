import { historicalReferences, SOURCE_EDITION } from './sources';
import type { FigureTable } from './types';

export const FIG58_EN_ROUTE_CLIMB_ISA_PLUS_10: FigureTable = {
  kind: 'figure',
  cautions: [
    "La fuente publica 10 min / 2800 lb a 35000 ft y 85000 lb, un tiempo anómalo que se conserva. Consulta las observaciones de la fuente."
],
  id: 'ascenso-ruta-280-070-isa-mas-10',
  title: 'Ascenso en ruta 280/.70 ISA +10 °C',
  category: 'Ascenso en ruta',
  aircraft: 'Boeing 737',
  summary:
    'Tiempo, combustible, distancia y TAS de ascenso en ruta con perfil 280 kt/M .70 a ISA +10 °C, según altitud de presión y peso al soltar frenos, con corrección de combustible para aeropuertos elevados.',
  related: ['condiciones-ascenso-ruta-b737', 'ascenso-ruta-280-070-isa'],
  source: {
    figure: 'FIGURE 58',
    originalTitle: 'En Route Climb 280/.70 ISA +10 °C.',
    document: SOURCE_EDITION,
    references: historicalReferences(109),
  },
  help: {
    purpose:
      'Obtener el tiempo (min) y el combustible (lb) de ascenso desde la suelta de frenos hasta la altitud de presión elegida, junto con la distancia recorrida (NM) y la TAS tabulada (kt), cuando la temperatura es ISA +10 °C.',
    glossary: [
      { term: 'PRESSURE ALTITUDE - FT', meaning: 'Altitud de presión final del ascenso, en pies.' },
      { term: 'BRAKE RELEASE WEIGHT - LB', meaning: 'Peso del avión al soltar frenos para el despegue, en libras.' },
      { term: 'TIME/FUEL', meaning: 'Primera línea de cada celda: tiempo de ascenso (min) / combustible consumido (lb).' },
      { term: 'DIST./TAS', meaning: 'Segunda línea de cada celda: distancia recorrida (NM) / velocidad verdadera (kt).' },
      { term: '280/.70', meaning: 'Perfil de ascenso: 280 kt IAS hasta alcanzar Mach .70, y Mach .70 a partir de ahí.' },
      { term: 'ISA +10 °C', meaning: 'Temperatura 10 °C por encima de la atmósfera estándar a cada altitud.' },
    ],
    steps: [
      'Localiza la fila de la altitud de presión de crucero (las filas entre 22000 y 6000 no están impresas).',
      'Localiza la columna del peso al soltar frenos; si el peso está entre dos columnas, interpola.',
      'Lee la primera línea (tiempo/combustible) y la segunda (distancia/TAS) de la celda.',
      'Si el aeropuerto de salida está elevado, aplica al combustible el ajuste de la tabla inferior según la elevación del aeropuerto.',
    ],
    tips: [
      'Las celdas vacías indican combinaciones de peso y altitud para las que la fuente no da datos; no extrapoles.',
      'El ajuste por elevación solo afecta al combustible; según la propia tabla, el efecto sobre tiempo y distancia es despreciable.',
      'Comprueba que usas la tabla de la temperatura correcta (esta es ISA +10 °C).',
      'Los valores se reproducen tal cual la fuente, incluidas posibles erratas (p. ej. 35000 / 85000).',
    ],
  },
  sheets: [
    {
      caption: 'En Route Climb 280/.70 ISA +10 °C.',
      blocks: [
        { type: 'heading', text: 'EN ROUTE CLIMB 280/.70 ISA +10 °C', size: 'lg', align: 'center' },
        {
          type: 'table',
          dense: true,
          heavy: true,
          headerRows: 2,
          colWidths: ['5.9%', '7.3%', '7.9%', '7.9%', '7.9%', '7.9%', '7.9%', '7.9%', '7.9%', '7.9%', '7.9%', '7.9%', '7.9%'],
          rows: [
            [{ t: 'PRESSURE\nALTITUDE\n-FT', h: true, rs: 2, small: true }, { t: 'UNITS\nMIN/LB\nNM/KNOTS', h: true, rs: 2, small: true }, { t: 'BRAKE RELEASE WEIGHT - LB', h: true, cs: 11 }],
            [{ t: '120000', h: true }, { t: '115000', h: true }, { t: '110000', h: true }, { t: '105000', h: true }, { t: '100000', h: true }, { t: '95000', h: true }, { t: '90000', h: true }, { t: '85000', h: true }, { t: '80000', h: true }, { t: '75000', h: true }, { t: '65000', h: true }],
            [{ t: '37000' }, { t: 'TIME/FUEL\nDIST./TAS' }, { t: '' }, { t: '' }, { t: '42/5700\n263/395' }, { t: '34/4700\n206/391' }, { t: '29/4100\n174/389' }, { t: '25/3700\n151/388' }, { t: '23/3300\n133/386' }, { t: '20/3000\n119/385' }, { t: '18/2700\n107/384' }, { t: '16/2500\n96/384' }, { t: '13/2100\n78/382' }],
            [{ t: '36000' }, { t: 'TIME/FUEL\nDIST./TAS' }, { t: '' }, { t: '43/5900\n266/394' }, { t: '35/5000\n211/391' }, { t: '30/4400\n179/389' }, { t: '26/3900\n156/387' }, { t: '23/3500\n138/385' }, { t: '21/3200\n123/384' }, { t: '19/2900\n111/383' }, { t: '17/2700\n100/383' }, { t: '16/2400\n90/382' }, { t: '13/2000\n74/381' }],
            [{ t: '35000' }, { t: 'TIME/FUEL\nDIST./TAS' }, { t: '45/6200\n275/394' }, { t: '36/5300\n219/390' }, { t: '31/4600\n186/388' }, { t: '27/4100\n162/386' }, { t: '24/3700\n143/385' }, { t: '22/3400\n128/384' }, { t: '20/3100\n115/383' }, { t: '10/2800\n104/382' }, { t: '16/2600\n94/381' }, { t: '15/2400\n85/380' }, { t: '12/2000\n70/379' }],
            [{ t: '34000' }, { t: 'TIME/FUEL\nDIST./TAS' }, { t: '38/5600\n228/390' }, { t: '32/4900\n193/387' }, { t: '28/4400\n168/386' }, { t: '25/3900\n149/384' }, { t: '23/3600\n133/383' }, { t: '21/3300\n120/382' }, { t: '19/3000\n108/381' }, { t: '17/2700\n98/380' }, { t: '16/2500\n89/379' }, { t: '14/2300\n81/379' }, { t: '12/1900\n67/378' }],
            [{ t: '33000' }, { t: 'TIME/FUEL\nDIST./TAS' }, { t: '34/5100\n200/387' }, { t: '30/4600\n174/385' }, { t: '26/4100\n154/383' }, { t: '24/3800\n138/382' }, { t: '22/3400\n124/381' }, { t: '20/3100\n113/380' }, { t: '18/2900\n102/379' }, { t: '16/2600\n93/378' }, { t: '15/2400\n85/378' }, { t: '14/2200\n77/377' }, { t: '11/1900\n64/376' }],
            [{ t: '32000' }, { t: 'TIME/FUEL\nDIST./TAS' }, { t: '31/4800\n180/384' }, { t: '28/4400\n160/382' }, { t: '25/4000\n143/381' }, { t: '23/3600\n129/379' }, { t: '21/3300\n116/378' }, { t: '19/3000\n106/378' }, { t: '17/2800\n96/377' }, { t: '16/2600\n88/376' }, { t: '14/2400\n80/376' }, { t: '13/2200\n73/375' }, { t: '11/1800\n61/374' }],
            [{ t: '31000' }, { t: 'TIME/FUEL\nDIST./TAS' }, { t: '29/4600\n165/381' }, { t: '26/4200\n147/379' }, { t: '23/3800\n133/378' }, { t: '21/3500\n120/377' }, { t: '20/3200\n109/376' }, { t: '18/2900\n100/375' }, { t: '16/2700\n91/375' }, { t: '15/2500\n83/374' }, { t: '14/2300\n76/374' }, { t: '13/2100\n70/373' }, { t: '11/1800\n58/372' }],
            [{ t: '30000' }, { t: 'TIME/FUEL\nDIST./TAS' }, { t: '27/4400\n152/378' }, { t: '24/4000\n137/376' }, { t: '22/3700\n124/375' }, { t: '20/3400\n113/374' }, { t: '19/3100\n103/374' }, { t: '17/2900\n94/373' }, { t: '16/2600\n86/372' }, { t: '14/2400\n79/372' }, { t: '13/2200\n72/371' }, { t: '12/2100\n66/371' }, { t: '10/1700\n55/370' }],
            [{ t: '29000' }, { t: 'TIME/FUEL\nDIST./TAS' }, { t: '25/4200\n141/375' }, { t: '23/3800\n128/374' }, { t: '21/3500\n116/373' }, { t: '19/3200\n106/372' }, { t: '18/3000\n97/371' }, { t: '16/2800\n89/370' }, { t: '15/2600\n82/370' }, { t: '14/2400\n75/369' }, { t: '13/2200\n69/369' }, { t: '12/2000\n63/369' }, { t: '10/1700\n52/368' }],
            [{ t: '28000' }, { t: 'TIME/FUEL\nDIST./TAS' }, { t: '24/4000\n131/371' }, { t: '22/3700\n119/370' }, { t: '20/3400\n109/369' }, { t: '18/3100\n100/369' }, { t: '17/2900\n91/368' }, { t: '16/2700\n84/368' }, { t: '14/2500\n77/367' }, { t: '13/2300\n71/367' }, { t: '12/2100\n65/366' }, { t: '11/1900\n60/366' }, { t: '9/1600\n50/365' }],
            [{ t: '27000' }, { t: 'TIME/FUEL\nDIST./TAS' }, { t: '22/3800\n121/368' }, { t: '21/3500\n111/367' }, { t: '19/3300\n102/366' }, { t: '18/3000\n93/366' }, { t: '16/2800\n86/365' }, { t: '15/2600\n79/364' }, { t: '14/2400\n73/364' }, { t: '13/2200\n67/364' }, { t: '12/2000\n61/363' }, { t: '11/1900\n56/363' }, { t: '9/1600\n47/363' }],
            [{ t: '26000' }, { t: 'TIME/FUEL\nDIST./TAS' }, { t: '21/3600\n110/363' }, { t: '19/3400\n101/362' }, { t: '18/3100\n93/362' }, { t: '16/2900\n86/361' }, { t: '15/2700\n79/361' }, { t: '14/2500\n73/360' }, { t: '13/2300\n67/360' }, { t: '12/2100\n62/360' }, { t: '11/2000\n57/359' }, { t: '10/1800\n52/359' }, { t: '9/1500\n44/359' }],
            [{ t: '25000' }, { t: 'TIME/FUEL\nDIST./TAS' }, { t: '19/3400\n101/358' }, { t: '18/3200\n93/358' }, { t: '17/3000\n85/357' }, { t: '15/2800\n79/357' }, { t: '14/2600\n73/357' }, { t: '13/2400\n67/356' }, { t: '12/2200\n62/356' }, { t: '11/2000\n57/356' }, { t: '10/1900\n53/356' }, { t: '10/1700\n48/355' }, { t: '8/1500\n41/355' }],
            [{ t: '24000' }, { t: 'TIME/FUEL\nDIST./TAS' }, { t: '18/3300\n92/354' }, { t: '17/3000\n85/354' }, { t: '16/2800\n78/353' }, { t: '15/2600\n72/353' }, { t: '13/2400\n67/353' }, { t: '12/2300\n62/352' }, { t: '12/2100\n57/352' }, { t: '11/1900\n53/352' }, { t: '10/1800\n49/352' }, { t: '9/1700\n45/352' }, { t: '8/1400\n38/351' }],
            [{ t: '23000' }, { t: 'TIME/FUEL\nDIST./TAS' }, { t: '17/3100\n84/350' }, { t: '16/2900\n78/350' }, { t: '15/2900\n72/350' }, { t: '14/2500\n67/349' }, { t: '13/2300\n62/349' }, { t: '12/2200\n57/349' }, { t: '11/2000\n53/349' }, { t: '10/1900\n49/348' }, { t: '9/1700\n45/348' }, { t: '9/1600\n42/348' }, { t: '7/1300\n35/348' }],
            [{ t: '22000' }, { t: 'TIME/FUEL\nDIST./TAS' }, { t: '16/3000\n77/346' }, { t: '15/2800\n71/346' }, { t: '14/2600\n66/346' }, { t: '13/2400\n61/346' }, { t: '12/2200\n57/345' }, { t: '11/2100\n53/345' }, { t: '10/1900\n49/345' }, { t: '10/1800\n45/345' }, { t: '9/1700\n42/345' }, { t: '8/1500\n38/345' }, { t: '7/1300\n32/344' }],
            { break: true, lines: 2 },
            [{ t: '' }, { t: '' }, { t: '' }, { t: '' }, { t: '' }, { t: '' }, { t: '' }, { t: '' }, { t: '' }, { t: '' }, { t: '' }, { t: '' }, { t: '' }],
            { break: true, lines: 2 },
            [{ t: '6000' }, { t: 'TIME/FUEL\nDIST./TAS' }, { t: '5/1100\n10/301' }, { t: '4/1000\n10/301' }, { t: '4/900\n9/301' }, { t: '4/900\n9/301' }, { t: '4/800\n8/301' }, { t: '3/800\n8/301' }, { t: '3/700\n7/301' }, { t: '3/700\n7/301' }, { t: '3/600\n6/301' }, { t: '3/600\n6/301' }, { t: '2/500\n5/301' }],
            [{ t: '1500' }, { t: 'TIME/FUEL' }, { t: '3/600' }, { t: '2/600' }, { t: '2/500' }, { t: '2/500' }, { t: '2/500' }, { t: '2/500' }, { t: '2/400' }, { t: '2/400' }, { t: '2/400' }, { t: '1/300' }, { t: '1/300' }],
          ],
        },
        {
          type: 'table',
          dense: true,
          colWidths: ['5.7%', '30.7%', '13.1%', '5%', '4.8%', '5.3%', '3.7%', '4.4%', '4.1%', '23.2%'],
          rows: [
            [{ t: '', bare: true }, { t: 'FUEL ADJUSTMENT FOR HIGH ELEVATION AIRPORTS', bold: true, small: true }, { t: 'AIRPORT ELEVATION', bold: true, small: true }, { t: '2000', bold: true, small: true }, { t: '4000', bold: true, small: true }, { t: '6000', bold: true, small: true }, { t: '8000', bold: true, small: true }, { t: '10000', bold: true, small: true }, { t: '12000', bold: true, small: true }, { t: '', bare: true }],
            [{ t: '', bare: true }, { t: 'EFFECT ON TIME AND DISTANCE IS NEGLIGIBLE', bold: true, small: true }, { t: 'FUEL ADJUSTMENT', bold: true, small: true }, { t: '-100', bold: true, small: true }, { t: '-300', bold: true, small: true }, { t: '-400', bold: true, small: true }, { t: '-500', bold: true, small: true }, { t: '-600', bold: true, small: true }, { t: '-800', bold: true, small: true }, { t: '', bare: true }],
          ],
        },
      ],
    },
  ],
  uncertain: [
    "35000 ft / 85000 lb: 10/2800 coincide con ambas publicaciones FAA consultadas; se conserva aunque rompe la progresión del tiempo.",
    "23000 ft / 110000 lb: 15/2900 también coincide con el suplemento FAA. La cabecera de unidades se ha contrastado como MIN/LB."
],
};
