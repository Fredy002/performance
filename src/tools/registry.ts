import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import {
  ArrowLeftRight,
  Fuel,
  Gauge,
  Grid3x3,
  type LucideIcon,
  Mountain,
  PlaneLanding,
  PlaneTakeoff,
  Scale,
  Spline,
  TrendingUp,
  Wind,
} from 'lucide-react';
import { translate, type Locale } from '@/i18n';

/**
 * Registro central de herramientas.
 * Para añadir una nueva calculadora:
 *   1. Crea su componente en src/tools/<id>/
 *   2. Añade una entrada aquí. El menú, el dashboard, el buscador (Ctrl+K)
 *      y las rutas se generan automáticamente a partir de esta lista.
 */

export type ToolCategory = 'interpolation' | 'atmosphere' | 'performance' | 'utilities';

export interface ToolDef {
  id: string;
  name: string;
  /** Nombre corto para el menú lateral, si `name` no cabe */
  shortName?: string;
  description: string;
  category: ToolCategory;
  icon: LucideIcon;
  keywords: string[];
  status: 'ready' | 'soon';
  /** Sigue disponible (ruta, inicio, buscador), pero no aparece en el menú lateral */
  hideInSidebar?: boolean;
  component?: LazyExoticComponent<ComponentType>;
}

export const CATEGORIES: Record<ToolCategory, string> = {
  interpolation: 'Interpolación',
  atmosphere: 'Atmósfera',
  performance: 'Performance de aeronaves',
  utilities: 'Utilidades',
};

export const TOOLS: ToolDef[] = [
  {
    id: 'fuel',
    name: 'Planificación de combustible',
    shortName: 'Plan de combustible',
    description: 'Viaje, alterno, espera y taxi: combustible a bordo (FOB) y autonomía. B737, vuelos nacionales e internacionales.',
    category: 'performance',
    icon: Fuel,
    keywords: ['combustible', 'fuel', 'fob', 'autonomia', 'trip fuel', 'alterno', 'holding', 'espera', 'reserva', 'b737', 'internacional', 'nacional', 'contingencia', 'captura', 'foto', 'ocr', 'escanear'],
    status: 'ready',
    component: lazy(() => import('./fuel/FuelPlanning')),
  },
  {
    id: 'takeoff-epr',
    name: 'EPR de despegue (B737 y B727)',
    shortName: 'EPR de despegue',
    description: 'EPR máximo de despegue con altitud de presión, temperatura y sangrados: B737 (condiciones R-1 a R-5) y B727 (G-1 a G-5).',
    category: 'performance',
    icon: Gauge,
    keywords: ['epr', 'despegue', 'takeoff', 'b727', '727', 'b737', '737', 'r-5', 'temp limit', 'press limit', 'empuje', 'antihielo', 'anti-ice', 'aire acondicionado', 'sangrado', 'bleed', 'g-5', 'altitud de presion', 'qnh'],
    status: 'ready',
    component: lazy(() => import('./takeoff-epr/TakeoffEpr')),
  },
  {
    id: 'en-route-climb',
    name: 'Ascenso en ruta (B737)',
    shortName: 'Ascenso en ruta',
    description: 'Combustible consumido y distancia recorrida en el ascenso en ruta 280/.70, en ISA o ISA +10 °C (condiciones V-1 a V-5).',
    category: 'performance',
    icon: TrendingUp,
    keywords: ['ascenso', 'en ruta', 'climb', 'en route', 'combustible', 'distancia', 'b737', 'v-5', 'isa', 'tas', 'viento'],
    status: 'ready',
    component: lazy(() => import('./en-route-climb/EnRouteClimb')),
  },
  {
    id: 'linear',
    name: 'Interpolación',
    description: 'Calcula un valor intermedio entre dos puntos de una tabla de performance de la aeronave.',
    category: 'interpolation',
    icon: Spline,
    keywords: ['interpolar', 'tabla', 'lineal', 'simple', 'x'],
    status: 'ready',
    component: lazy(() => import('./linear/LinearInterpolation')),
  },
  {
    id: 'bilinear',
    hideInSidebar: true,
    name: 'Interpolación doble',
    description: 'Interpola en dos variables a la vez (p. ej. altitud de presión y temperatura).',
    category: 'interpolation',
    icon: Grid3x3,
    keywords: ['bilineal', 'doble', 'tabla', 'dos variables', 'matriz'],
    status: 'ready',
    component: lazy(() => import('./bilinear/BilinearInterpolation')),
  },
  {
    id: 'density-altitude',
    hideInSidebar: true,
    name: 'Altitud de densidad',
    description: 'Altitud de presión, desviación ISA y altitud de densidad desde elevación, QNH y OAT.',
    category: 'atmosphere',
    icon: Mountain,
    keywords: ['isa', 'qnh', 'oat', 'presión', 'densidad', 'temperatura'],
    status: 'ready',
    component: lazy(() => import('./atmosphere/DensityAltitude')),
  },
  {
    id: 'wind',
    hideInSidebar: true,
    name: 'Componentes de viento',
    description: 'Viento de cara/cola y cruzado respecto al rumbo de pista.',
    category: 'atmosphere',
    icon: Wind,
    keywords: ['crosswind', 'headwind', 'tailwind', 'cruzado', 'pista', 'cara', 'cola'],
    status: 'ready',
    component: lazy(() => import('./wind/WindComponents')),
  },
  {
    id: 'units',
    name: 'Conversor de unidades',
    description: 'ft/m, kt/km/h, hPa/inHg, kg/lb, °C/°F, litros/galones…',
    category: 'utilities',
    icon: ArrowLeftRight,
    keywords: ['convertir', 'unidades', 'pies', 'metros', 'nudos', 'libras', 'galones'],
    status: 'ready',
    component: lazy(() => import('./units/UnitConverter')),
  },
  {
    id: 'takeoff',
    name: 'Despegue',
    description: 'TODR / ASDR a partir de las tablas del AFM con correcciones.',
    category: 'performance',
    icon: PlaneTakeoff,
    keywords: ['despegue', 'todr', 'tora', 'v1'],
    status: 'soon',
  },
  {
    id: 'landing',
    name: 'Aterrizaje',
    description: 'LDR con correcciones por viento, pendiente y estado de pista.',
    category: 'performance',
    icon: PlaneLanding,
    keywords: ['aterrizaje', 'ldr', 'lda'],
    status: 'soon',
  },
  {
    id: 'weight-balance',
    name: 'Peso y centrado',
    description: 'Cálculo de masa y CG con envolvente gráfica.',
    category: 'performance',
    icon: Scale,
    keywords: ['peso', 'balance', 'cg', 'centrado', 'masa'],
    status: 'soon',
  },
];

export const toolPath = (id: string) => `/tools/${id}`;

export function getTool(id: string): ToolDef | undefined {
  return TOOLS.find((t) => t.id === id);
}

export function localizedToolName(id: string, locale: Locale): string {
  return translate(locale, `tool.${id}.name`);
}

export function localizedToolShortName(id: string, locale: Locale): string {
  const tool = getTool(id);
  if (!tool) throw new Error(`Unknown tool: ${id}`);
  return translate(locale, `tool.${id}.shortName`);
}

export function localizedToolDescription(id: string, locale: Locale): string {
  return translate(locale, `tool.${id}.description`);
}

export function localizedCategory(category: ToolCategory, locale: Locale): string {
  return translate(locale, `category.${category}`);
}

/** Herramientas disponibles, en el orden del menú (la más usada primero). */
export const readyTools = () => TOOLS.filter((t) => t.status === 'ready');
export const upcomingTools = () => TOOLS.filter((t) => t.status === 'soon');

export function toolsByCategory(): [ToolCategory, ToolDef[]][] {
  return (Object.keys(CATEGORIES) as ToolCategory[])
    .map((c) => [c, TOOLS.filter((t) => t.category === c)] as [ToolCategory, ToolDef[]])
    .filter(([, list]) => list.length > 0);
}
