import { historicalReferences, SOURCE_EDITION } from './sources';
import type { FigCell, FigureTable } from './types';

const row = (label: string, ...values: string[]): FigCell[] => [
  { t: label, align: 'left' },
  ...values.map((t): FigCell => ({ t, align: 'right' })),
];

export const FIG56_B737_EN_ROUTE_CLIMB_CONDITIONS: FigureTable = {
  id: 'condiciones-ascenso-ruta-b737',
  kind: 'figure',
  title: 'Condiciones de ascenso en ruta del Boeing 737',
  category: 'Ascenso en ruta',
  aircraft: 'Boeing 737',
  summary:
    'Cinco escenarios de ascenso en ruta (V-1 a V-5) con peso al soltar frenos, altitud de presión de crucero, elevación del aeropuerto, temperatura respecto a ISA y viento medio.',
  source: {
    figure: 'FIGURE 56',
    originalTitle: 'B-737 – En Route Climb.',
    document: SOURCE_EDITION,
    references: historicalReferences(108),
  },
  related: ['ascenso-ruta-280-070-isa', 'ascenso-ruta-280-070-isa-mas-10'],
  sheets: [
    {
      caption: 'B-737 – En Route Climb.',
      blocks: [
        {
          type: 'table',
          heavy: true,
          headerRows: 1,
          colWidths: ['36%', '12.8%', '12.8%', '12.8%', '12.8%', '12.8%'],
          rows: [
            [
              { t: 'OPERATING CONDITIONS', h: true, bold: true, align: 'left' },
              ...['V-1', 'V-2', 'V-3', 'V-4', 'V-5'].map((t): FigCell => ({ t, h: true, bold: true, align: 'right' })),
            ],
            row('BRK REL WEIGHT (X1000)', '110', '95', '85', '105', '75'),
            row('CRUISE PRESS ALT', '33,000', '27,000', '35,000', '22,000', '31,000'),
            row('AIRPORT ELEVATION', '2,000', '3,000', '2,000', '4,000', '2,000'),
            row('ISA TEMPERATURE', '+10°', 'ISA', 'ISA', '+10°', '+10°'),
            row('AVG WIND COMP (KTS)', '20 HW', '20 TW', '30 HW', '10 TW', '40 HW'),
          ],
        },
      ],
    },
  ],
  help: {
    purpose:
      'Define los datos de entrada de cada ejercicio de ascenso en ruta del Boeing 737 (V-1 a V-5). Con ellos se entra en la tabla de ascenso en ruta 280/.70 correspondiente (ISA o ISA +10 °C) para obtener tiempo, combustible, distancia y TAS.',
    glossary: [
      { term: 'BRK REL WEIGHT (X1000)', meaning: 'Peso al soltar frenos, en miles de libras.' },
      { term: 'CRUISE PRESS ALT', meaning: 'Altitud de presión de crucero a la que se asciende, en pies.' },
      { term: 'AIRPORT ELEVATION', meaning: 'Elevación del aeropuerto de salida, en pies; determina el ajuste de combustible por aeropuerto elevado.' },
      { term: 'ISA TEMPERATURE', meaning: 'Temperatura respecto a la atmósfera estándar: ISA o ISA +10°.' },
      { term: 'AVG WIND COMP (KTS)', meaning: 'Componente media de viento durante el ascenso, en nudos: HW de cara, TW de cola.' },
    ],
    steps: [
      'Elige el escenario que pide el ejercicio (V-1 a V-5).',
      'Según la temperatura, usa la tabla de ascenso en ruta ISA o la de ISA +10°.',
      'Entra con la altitud de presión de crucero y el peso al soltar frenos, y lee tiempo/combustible y distancia/TAS.',
      'Aplica el ajuste de combustible por elevación del aeropuerto que indica la tabla de ascenso.',
      'Corrige la distancia por el viento medio usando el tiempo de ascenso y la componente de viento.',
    ],
    tips: [
      'Las condiciones con +10° no se leen en la tabla ISA: usa la tabla de ISA +10°.',
      'El peso está en miles de libras; búscalo en la fila de pesos al soltar frenos.',
      'Los valores de la tabla de ascenso son en aire en calma: la componente de viento se usa para corregir la distancia.',
    ],
  },
};
