import type { ConditionsTable } from './types';

export const FIG66_OPERATING_CONDITIONS: ConditionsTable = {
  id: 'planificacion-crucero-m074',
  kind: 'conditions',
  title: 'Planificación de vuelo en crucero Mach 0,74',
  category: 'Planificación de vuelo',
  summary: 'Cinco escenarios (Z-1 a Z-5) con distancia y viento medio para calcular el tiempo y el combustible de viaje con la planificación de vuelo abreviada.',
  source: {
    figure: 'FIGURE 66',
    originalTitle: 'Flight Planning at .74 Mach Cruise',
    document: 'FAA — Computer Testing Supplement (ATP / Aircraft Dispatcher), Appendix 2',
  },
  related: ['planificacion-abreviada'],
  conditions: [
    { id: 'Z-1', distanceNm: 340, wind: { speedKt: 25, kind: 'TW' } },
    { id: 'Z-2', distanceNm: 650, wind: { speedKt: 45, kind: 'HW' } },
    { id: 'Z-3', distanceNm: 900, wind: { speedKt: 35, kind: 'TW' } },
    { id: 'Z-4', distanceNm: 290, wind: { speedKt: 25, kind: 'HW' } },
    { id: 'Z-5', distanceNm: 400, wind: { speedKt: 60, kind: 'HW' } },
  ],
  help: {
    purpose:
      'No es una tabla de performance en sí: define los datos de entrada de cada ejercicio. Cada condición (Z-1…Z-5) indica la distancia del tramo y la componente media de viento. Con ellos se entra en la tabla de planificación de vuelo abreviada para obtener el tiempo de vuelo y el combustible de viaje.',
    glossary: [
      { term: 'DISTANCE (NM)', meaning: 'Distancia del vuelo en millas náuticas (aire en calma).' },
      { term: 'AVG WIND COMP', meaning: 'Componente media de viento a lo largo de la ruta, en nudos.' },
      { term: 'HW (headwind)', meaning: 'Viento de cara: aumenta el tiempo y el combustible.' },
      { term: 'TW (tailwind)', meaning: 'Viento de cola: reduce el tiempo y el combustible.' },
      { term: '.74 Mach', meaning: 'Crucero a Mach 0,74 a partir de 24 000 ft (perfil indicado en la planificación de vuelo abreviada).' },
    ],
    steps: [
      'Elige la condición que pide el ejercicio (p. ej. Z-1).',
      'Anota la distancia y la componente de viento, indicando si es de cara (HW) o de cola (TW).',
      'Entra en la planificación de vuelo abreviada con la distancia y lee TAS, tiempo y combustible en aire en calma.',
      'Aplica la corrección por viento de esa misma tabla y suma (HW) o resta (TW) los incrementos.',
    ],
    tips: [
      'Todas las distancias de Z-1 a Z-5 aparecen exactas en la planificación abreviada: no hace falta interpolar.',
      'Usa la TAS de la misma fila de la planificación abreviada para la corrección por viento.',
    ],
  },
};
