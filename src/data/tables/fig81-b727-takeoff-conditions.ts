import { historicalReferences, SOURCE_EDITION } from './sources';
import type { FigCell, FigureTable } from './types';

const row = (label: string, ...values: string[]): FigCell[] => [
  { t: label, align: 'left' },
  ...values.map((t): FigCell => ({ t, align: 'right' })),
];

export const FIG81_B727_TAKEOFF_CONDITIONS: FigureTable = {
  id: 'condiciones-despegue-b727',
  kind: 'figure',
  title: 'Condiciones de despegue del Boeing 727',
  category: 'Despegue',
  aircraft: 'Boeing 727',
  summary:
    'Cinco escenarios de despegue (G-1 a G-5) con elevación del campo, reglaje altimétrico, temperatura, sangrados, peso bruto, flaps y posición del centro de gravedad.',
  source: {
    figure: 'FIGURE 81',
    originalTitle: 'B-727 – Takeoff.',
    document: SOURCE_EDITION,
    references: historicalReferences(122),
  },
  related: ['reglaje-altimetrico-altitud-presion', 'performance-despegue-b727'],
  sheets: [
    {
      caption: 'B-727 – Takeoff.',
      blocks: [
        {
          type: 'table',
          heavy: true,
          headerRows: 1,
          colWidths: ['39%', '12.2%', '12.2%', '12.2%', '12.2%', '12.2%'],
          rows: [
            [
              { t: 'OPERATING CONDITIONS', h: true, bold: true, align: 'left' },
              ...['G-1', 'G-2', 'G-3', 'G-4', 'G-5'].map((t): FigCell => ({ t, h: true, bold: true, align: 'right' })),
            ],
            row('FIELD ELEVATION FT', '1,050', '2,000', '4,350', '3,050', '2,150'),
            row('ALTIMETER SETTING', '29.36"', '1016 mb', '30.10"', '1010 mb', '29.54"'),
            row('TEMPERATURE', '+23 °F', '+10 °C', '+68 °F', '–5 °C', '+5 °F'),
            row('AIR COND ENGS 1 AND 3', 'OFF', 'ON', 'ON', 'ON', 'ON'),
            row('ANTI-ICE ENG 2', 'ON', 'OFF', 'OFF', 'ON', 'ON'),
            row('GROSS WEIGHT (X1000)', '140', '190', '180', '160', '120'),
            row('6TH STAGE BLEED', 'OFF', 'ON', 'ON', 'OFF', 'OFF'),
            row('FLAP POSITION', '15°', '5°', '25°', '15°', '5°'),
            row('CG STATION', '911.2', '882.2', '914.8', '932.9', '925.6'),
            [{ t: 'LEMAC – STA 860.5, MAC 180.9"', cs: 6, align: 'center', small: true }],
          ],
        },
      ],
    },
  ],
  help: {
    purpose:
      'Define los datos de entrada de cada ejercicio de despegue del Boeing 727 (G-1 a G-5). Con ellos se obtiene la altitud de presión y se entra en las tablas de performance de despegue para calcular EPR, velocidades V y ajuste del compensador.',
    glossary: [
      { term: 'FIELD ELEVATION FT', meaning: 'Elevación del aeródromo, en pies.' },
      { term: 'ALTIMETER SETTING', meaning: 'Reglaje altimétrico (QNH), en pulgadas de mercurio (") o en milibares (mb).' },
      { term: 'AIR COND ENGS 1 AND 3', meaning: 'Sangrado de aire acondicionado de los motores 1 y 3, conectado (ON) o desconectado (OFF).' },
      { term: 'ANTI-ICE ENG 2', meaning: 'Antihielo del motor 2, conectado (ON) o desconectado (OFF).' },
      { term: '6TH STAGE BLEED', meaning: 'Sangrado de la 6.ª etapa del compresor, conectado (ON) o desconectado (OFF).' },
      { term: 'GROSS WEIGHT (X1000)', meaning: 'Peso bruto de despegue en miles de libras.' },
      { term: 'LEMAC / MAC', meaning: 'Estación del borde de ataque de la cuerda aerodinámica media y longitud de esa cuerda; sirven para expresar el CG en % de MAC.' },
    ],
    steps: [
      'Elige el escenario que pide el ejercicio (G-1 a G-5).',
      'Calcula la altitud de presión a partir de la elevación del campo y el reglaje altimétrico con la tabla de reglaje altimétrico.',
      'Convierte la temperatura a la unidad que pida la tabla de performance (°F o °C).',
      'Si se pide el compensador, calcula el CG en % de MAC: (CG STATION − LEMAC) ÷ MAC × 100.',
      'Entra en la performance de despegue del B-727 con peso, flaps y estado de los sangrados, y aplica sus correcciones.',
    ],
    tips: [
      'Fíjate en la unidad del reglaje: unos escenarios usan pulgadas (") y otros milibares (mb).',
      'Las temperaturas mezclan °F y °C; conviértelas antes de entrar en las tablas.',
      'Los sangrados (aire acondicionado, antihielo, 6.ª etapa) modifican el EPR: revisa cada uno según el escenario.',
    ],
  },
};
