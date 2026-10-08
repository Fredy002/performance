import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import {
  ArrowLeftRight,
  Fuel,
  Grid3x3,
  type LucideIcon,
  Mountain,
  PlaneLanding,
  PlaneTakeoff,
  Scale,
  Spline,
  Wind,
} from 'lucide-react';

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
  description: string;
  category: ToolCategory;
  icon: LucideIcon;
  keywords: string[];
  status: 'ready' | 'soon';
  component?: LazyExoticComponent<ComponentType>;
}

export const CATEGORIES: Record<ToolCategory, string> = {
  interpolation: 'Interpolación',
  atmosphere: 'Atmósfera',
  performance: 'Performance',
  utilities: 'Utilidades',
};

export const TOOLS: ToolDef[] = [
  {
    id: 'linear',
    name: 'Interpolación lineal',
    description: 'Calcula un valor intermedio entre dos puntos de una tabla de performance.',
    category: 'interpolation',
    icon: Spline,
    keywords: ['interpolar', 'tabla', 'lineal', 'simple', 'x'],
    status: 'ready',
    component: lazy(() => import('./linear/LinearInterpolation')),
  },
  {
    id: 'bilinear',
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
  {
    id: 'fuel',
    name: 'Combustible',
    description: 'Trip fuel, reservas y autonomía.',
    category: 'performance',
    icon: Fuel,
    keywords: ['combustible', 'fuel', 'reserva', 'autonomía'],
    status: 'soon',
  },
];

export const toolPath = (id: string) => `/tools/${id}`;

export function getTool(id: string): ToolDef | undefined {
  return TOOLS.find((t) => t.id === id);
}

export function toolsByCategory(): [ToolCategory, ToolDef[]][] {
  return (Object.keys(CATEGORIES) as ToolCategory[])
    .map((c) => [c, TOOLS.filter((t) => t.category === c)] as [ToolCategory, ToolDef[]])
    .filter(([, list]) => list.length > 0);
}
