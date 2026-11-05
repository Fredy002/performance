import type { ParsedLeg, ParsedStatement } from '../exercises/parseStatement.ts';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
export type ImageMediaType = (typeof IMAGE_MEDIA_TYPES)[number];

export interface ImageAnalysis {
  text: string;
  parsed: ParsedStatement;
  warnings: string[];
}

const nullableNumber = { anyOf: [{ type: 'number' }, { type: 'null' }] };
const nullableString = { anyOf: [{ type: 'string' }, { type: 'null' }] };
const legProperties = {
  from: nullableString,
  to: nullableString,
  distanceNm: nullableNumber,
  windKt: nullableNumber,
  windKind: { anyOf: [{ type: 'string', enum: ['HW', 'TW'] }, { type: 'null' }] },
  flightLevel: nullableNumber,
};
const legSchema = { type: 'object', properties: legProperties, required: Object.keys(legProperties), additionalProperties: false };
const holdingProperties = { weightLb: nullableNumber, flightLevel: nullableNumber, minutes: nullableNumber };
const parsedProperties = {
  // Structured outputs allow at most 16 union-typed fields in this schema.
  aircraft: { type: 'string' },
  trip: legSchema,
  alternate: legSchema,
  holding: { type: 'object', properties: holdingProperties, required: Object.keys(holdingProperties), additionalProperties: false },
  taxiFuelLb: nullableNumber,
};

/** Claude returns null for unknown values; the application keeps those fields missing. */
export const IMAGE_ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    text: { type: 'string' },
    parsed: { type: 'object', properties: parsedProperties, required: Object.keys(parsedProperties), additionalProperties: false },
    warnings: { type: 'array', items: { type: 'string' } },
  },
  required: ['text', 'parsed', 'warnings'],
  additionalProperties: false,
};

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Respuesta de análisis inválida.');
  return value as Record<string, unknown>;
}

function number(value: unknown, max: number): number | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > max) {
    throw new Error('Claude devolvió un dato numérico inválido.');
  }
  return value;
}

function code(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value !== 'string' || !/^[A-Z]{4}$/.test(value)) throw new Error('Claude devolvió un código OACI inválido.');
  return value;
}

function leg(value: unknown): ParsedLeg {
  const v = object(value);
  if (v.windKind != null && v.windKind !== 'HW' && v.windKind !== 'TW') throw new Error('Claude devolvió un tipo de viento inválido.');
  return {
    from: code(v.from), to: code(v.to),
    distanceNm: number(v.distanceNm, 20000),
    windKt: number(v.windKt, 1000),
    windKind: v.windKind == null ? undefined : v.windKind,
    flightLevel: number(v.flightLevel, 700),
  };
}

/** Validate received values as well as their JSON syntax. */
export function normalizeImageAnalysis(value: unknown): ImageAnalysis {
  const v = object(value);
  if (typeof v.text !== 'string' || !v.text.trim() || v.text.length > 20000) throw new Error('Claude no pudo leer el enunciado de la imagen.');
  if (!Array.isArray(v.warnings) || v.warnings.length > 20 || v.warnings.some(w => typeof w !== 'string' || w.length > 1000)) {
    throw new Error('Respuesta de análisis inválida.');
  }
  const p = object(v.parsed);
  const h = object(p.holding);
  if (p.aircraft != null && (typeof p.aircraft !== 'string' || p.aircraft.length > 40)) {
    throw new Error('Claude devolvió una aeronave inválida.');
  }
  return {
    text: v.text.trim(),
    warnings: v.warnings as string[],
    parsed: {
      aircraft: p.aircraft == null ? undefined : (p.aircraft as string).trim() || undefined,
      trip: leg(p.trip), alternate: leg(p.alternate),
      holding: { weightLb: number(h.weightLb, 2000000), flightLevel: number(h.flightLevel, 700), minutes: number(h.minutes, 1440) },
      taxiFuelLb: number(p.taxiFuelLb, 1000000),
    },
  };
}
