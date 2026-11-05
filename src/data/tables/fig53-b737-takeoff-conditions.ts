import { historicalReferences, SOURCE_EDITION } from './sources';
import type { FigCell, FigureTable } from './types';

const row = (label: string, ...values: string[]): FigCell[] => [
  { t: label, align: 'left' },
  ...values.map((t): FigCell => ({ t, align: 'right' })),
];

export const FIG53_B737_TAKEOFF_CONDITIONS: FigureTable = {
  id: 'condiciones-despegue-b737',
  kind: 'figure',
  title: 'Condiciones de despegue del Boeing 737',
  category: 'Despegue',
  aircraft: 'Boeing 737',
  summary:
    'Cinco escenarios de despegue (R-1 a R-5) con elevación del campo, reglaje altimétrico, temperatura, peso, flaps, viento, pendiente de pista, sangrados y posición del centro de gravedad.',
  source: {
    figure: 'FIGURE 53',
    originalTitle: 'B-737 – Takeoff.',
    document: SOURCE_EDITION,
    references: historicalReferences(105),
  },
  related: ['reglaje-altimetrico-altitud-presion', 'performance-despegue-b737'],
  sheets: [
    {
      caption: 'B-737 – Takeoff.',
      blocks: [
        {
          type: 'table',
          heavy: true,
          headerRows: 1,
          colWidths: ['34%', '13.2%', '13.2%', '13.2%', '13.2%', '13.2%'],
          rows: [
            [
              { t: 'OPERATING CONDITIONS', h: true, bold: true, align: 'left' },
              ...['R-1', 'R-2', 'R-3', 'R-4', 'R-5'].map((t): FigCell => ({ t, h: true, bold: true, align: 'right' })),
            ],
            row('FIELD ELEVATION', '100', '4,000', '950', '2,000', '50'),
            row('ALTIMETER SETTING', '29.50"', '1032 mb', '29.40"', '1017 mb', '30.15"'),
            row('TEMPERATURE (OAT)', '+50 °F', '–15 °C', '+59 °F', '0 °C', '+95 °F'),
            row('WEIGHT (X1000)', '90', '110', '100', '85', '95'),
            row('FLAP POSITION', '15°', '5°', '5°', '1°', '1°'),
            row('WIND COMPONENT (KTS)', '5 HW', '5 TW', '20 HW', '10 TW', '7 HW'),
            row('RUNWAY SLOPE %', '1% UP', '1% DN', '1% UP', '2% DN', '1.5% UP'),
            row('AIR CONDITIONING', 'ON', 'ON', 'OFF', 'ON', 'OFF'),
            row('ENGINE ANTI-ICE', 'OFF', 'ON', 'OFF', 'ON', 'OFF'),
            row('CG STATION', '635.7', '643.8', '665.2', '657.2', '638.4'),
            [{ t: 'LEMAC STA 625.0, MAC 134.0', cs: 6, align: 'center' }],
          ],
        },
      ],
    },
  ],
  help: {
    purpose:
      'Define los datos de entrada de cada ejercicio de despegue del Boeing 737 (R-1 a R-5). Con ellos se obtiene la altitud de presión y se entra en las tablas de performance de despegue para calcular EPR, velocidades V y ajuste del compensador.',
    glossary: [
      { term: 'FIELD ELEVATION', meaning: 'Elevación del aeródromo, en pies.' },
      { term: 'ALTIMETER SETTING', meaning: 'Reglaje altimétrico (QNH), en pulgadas de mercurio (") o en milibares (mb).' },
      { term: 'TEMPERATURE (OAT)', meaning: 'Temperatura exterior del aire, en °F o °C según el escenario.' },
      { term: 'WEIGHT (X1000)', meaning: 'Peso de despegue en miles de libras.' },
      { term: 'HW / TW', meaning: 'Componente de viento de cara (headwind) o de cola (tailwind), en nudos.' },
      { term: 'RUNWAY SLOPE % (UP / DN)', meaning: 'Pendiente de la pista en porcentaje, ascendente (UP) o descendente (DN).' },
      { term: 'CG STATION', meaning: 'Estación (posición longitudinal) del centro de gravedad, en pulgadas.' },
      { term: 'LEMAC / MAC', meaning: 'Borde de ataque de la cuerda aerodinámica media (estación) y longitud de esa cuerda; sirven para expresar el CG en % de MAC.' },
    ],
    steps: [
      'Elige el escenario que pide el ejercicio (R-1 a R-5).',
      'Calcula la altitud de presión a partir de la elevación del campo y el reglaje altimétrico con la tabla de reglaje altimétrico.',
      'Convierte la temperatura a la unidad que pida la tabla de performance (°F o °C).',
      'Si se pide el compensador, calcula el CG en % de MAC: (CG STATION − LEMAC) ÷ MAC × 100.',
      'Entra en la performance de despegue del B-737 con peso, flaps, viento, pendiente y estado de aire acondicionado y antihielo.',
    ],
    tips: [
      'Fíjate en la unidad del reglaje: unos escenarios usan pulgadas (") y otros milibares (mb).',
      'Las temperaturas mezclan °F y °C; conviértelas antes de entrar en las tablas.',
      'El aire acondicionado y el antihielo de motor afectan al EPR: aplica las correcciones que indique la tabla de performance.',
    ],
  },
  uncertain: [
    "La edición de 2005 y la imagen aportada indican +95 °F en R-5. La edición FAA-CT-8080-7D (2019) imprime +95 °C; no se mezclan ambos escenarios."
],
};
