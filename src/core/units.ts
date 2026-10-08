/**
 * Conversión de unidades aeronáuticas.
 * Cada magnitud define una unidad base y factores lineales hacia ella;
 * la temperatura se trata aparte por no ser una conversión proporcional.
 */

export interface UnitDef {
  id: string;
  label: string;
  symbol: string;
  /** valor_base = valor × factor (ignorado si hay toBase/fromBase) */
  factor?: number;
  toBase?: (v: number) => number;
  fromBase?: (v: number) => number;
}

export interface Quantity {
  id: string;
  label: string;
  units: UnitDef[];
}

export const QUANTITIES: Quantity[] = [
  {
    id: 'altitude',
    label: 'Altitud / longitud',
    units: [
      { id: 'ft', label: 'Pies', symbol: 'ft', factor: 0.3048 },
      { id: 'm', label: 'Metros', symbol: 'm', factor: 1 },
      { id: 'fl', label: 'Nivel de vuelo', symbol: 'FL', factor: 30.48 },
    ],
  },
  {
    id: 'distance',
    label: 'Distancia',
    units: [
      { id: 'nm', label: 'Millas náuticas', symbol: 'NM', factor: 1852 },
      { id: 'km', label: 'Kilómetros', symbol: 'km', factor: 1000 },
      { id: 'sm', label: 'Millas terrestres', symbol: 'SM', factor: 1609.344 },
    ],
  },
  {
    id: 'speed',
    label: 'Velocidad',
    units: [
      { id: 'kt', label: 'Nudos', symbol: 'kt', factor: 1852 / 3600 },
      { id: 'kmh', label: 'Kilómetros/hora', symbol: 'km/h', factor: 1 / 3.6 },
      { id: 'ms', label: 'Metros/segundo', symbol: 'm/s', factor: 1 },
      { id: 'mph', label: 'Millas/hora', symbol: 'mph', factor: 0.44704 },
      { id: 'fpm', label: 'Pies/minuto', symbol: 'ft/min', factor: 0.3048 / 60 },
    ],
  },
  {
    id: 'mass',
    label: 'Peso / masa',
    units: [
      { id: 'kg', label: 'Kilogramos', symbol: 'kg', factor: 1 },
      { id: 'lb', label: 'Libras', symbol: 'lb', factor: 0.45359237 },
      { id: 't', label: 'Toneladas', symbol: 't', factor: 1000 },
    ],
  },
  {
    id: 'pressure',
    label: 'Presión',
    units: [
      { id: 'hpa', label: 'Hectopascales', symbol: 'hPa', factor: 1 },
      { id: 'inhg', label: 'Pulgadas de mercurio', symbol: 'inHg', factor: 33.8638866667 },
      { id: 'mmhg', label: 'Milímetros de mercurio', symbol: 'mmHg', factor: 1.33322387415 },
      { id: 'psi', label: 'Libras/pulgada²', symbol: 'psi', factor: 68.9475729318 },
    ],
  },
  {
    id: 'temperature',
    label: 'Temperatura',
    units: [
      { id: 'c', label: 'Celsius', symbol: '°C', toBase: (v) => v, fromBase: (v) => v },
      { id: 'f', label: 'Fahrenheit', symbol: '°F', toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
      { id: 'k', label: 'Kelvin', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    ],
  },
  {
    id: 'volume',
    label: 'Volumen de combustible',
    units: [
      { id: 'l', label: 'Litros', symbol: 'L', factor: 1 },
      { id: 'usg', label: 'Galones US', symbol: 'USG', factor: 3.785411784 },
      { id: 'ig', label: 'Galones imperiales', symbol: 'IG', factor: 4.54609 },
    ],
  },
];

function toBase(u: UnitDef, v: number): number {
  return u.toBase ? u.toBase(v) : v * (u.factor ?? 1);
}

function fromBase(u: UnitDef, v: number): number {
  return u.fromBase ? u.fromBase(v) : v / (u.factor ?? 1);
}

export function findQuantity(id: string): Quantity | undefined {
  return QUANTITIES.find((q) => q.id === id);
}

export function convert(quantityId: string, value: number, fromId: string, toId: string): number {
  const q = findQuantity(quantityId);
  const from = q?.units.find((u) => u.id === fromId);
  const to = q?.units.find((u) => u.id === toId);
  if (!q || !from || !to) throw new Error(`Conversión desconocida: ${quantityId} ${fromId}→${toId}`);
  return fromBase(to, toBase(from, value));
}
