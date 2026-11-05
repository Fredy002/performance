/**
 * Sesiones del asistente AeroPerf AI.
 *
 * Una sesión es un ejercicio interpretado: enunciado original, pasos detectados (uno por módulo),
 * correcciones del usuario y resultados de los motores deterministas. Vive dentro de su entrada de
 * Historial (una sola entrada por ejercicio, aunque recorra varios módulos) y se borra con ella.
 * Las imágenes nunca se persisten: se conservan solo en memoria durante la pestaña actual.
 */
import { useSyncExternalStore } from 'react';
import type { Locale } from '@/i18n/types';
import { routeScope, SCOPES } from '@/exercises/registry';
import type { AIAnalysis, AIField, AIStep } from '@/services/aeroAnalysis';
import type { AICalculation } from '@/services/aiCalculation';
import { addHistory, getHistory, subscribeHistory, updateHistorySession } from './history';

export type AISessionStatus = 'draft' | 'partial' | 'solved';

export interface AISession {
  id: string;
  createdAt: number;
  updatedAt: number;
  /** Enunciado tal como lo interpretó el motor (se conserva en su idioma original) */
  text: string;
  /** Había una imagen al analizar (la imagen en sí no se guarda) */
  hadImage: boolean;
  /** Análisis original, sin correcciones: permite ver qué detectó la IA */
  analysis: AIAnalysis;
  /** Pasos con las correcciones del usuario */
  steps: AIStep[];
  /** Resultados calculados por los motores de AeroPerf, por paso */
  results: Record<string, AICalculation>;
  status: AISessionStatus;
}

const images = new Map<string, Blob>();

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `ai-${Date.now()}-${Math.random().toString(36).slice(2)}`;

/**
 * Ruta interna controlada: el módulo sale del registro de pasos, nunca de texto libre del modelo.
 * El parámetro es `aiReview` (no `ai`): `ai` es el campo antihielo de EPR de despegue.
 */
export const aiStepHref = (session: Pick<AISession, 'id'>, step: Pick<AIStep, 'id' | 'module'>) =>
  `/tools/${step.module}?${new URLSearchParams({ aiReview: session.id, step: step.id })}`;

/**
 * La calculadora real con los datos revisados: todas las claves explícitas (también vacías) para
 * que no se rellene con su ejemplo, y `from`/`step` para la barra del asistente.
 */
export function aiToolHref(session: Pick<AISession, 'id'>, step: Pick<AIStep, 'id' | 'module'>, values: Record<string, string>) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) if (key !== 'aircraft') qs.set(key, value ?? '');
  qs.set('from', session.id);
  qs.set('step', step.id);
  return `/tools/${step.module}?${qs}`;
}

const statusOf = (s: Pick<AISession, 'steps' | 'results'>): AISessionStatus => {
  const solved = s.steps.filter((step) => s.results[step.id]).length;
  return solved === 0 ? 'draft' : solved === s.steps.length ? 'solved' : 'partial';
};

/** Resumen de resultados para la columna del historial («FOB 17607,26 lb · …»). */
const resultSummary = (s: AISession) =>
  s.steps
    .map((step) => s.results[step.id]?.summary)
    .filter(Boolean)
    .join(' · ');

/**
 * Supuestos explícitos y justificados que AeroPerf ya aplica en sus módulos cuando el enunciado no
 * los indica (se muestran en naranja, «Supuesto», y el usuario puede cambiarlos):
 * - Plan de combustible y ascenso en ruta: aeronave B737 si no se nombra (son las únicas tablas del módulo).
 * - Plan de combustible: espera a 1 500 ft (FL 015) y 45 min (nacional) o 30 min (internacional).
 */
export function applyModuleAssumptions(step: AIStep, locale: Locale): AIStep {
  if (step.module !== 'fuel' && step.module !== 'en-route-climb') return step;
  const get = (key: string) => step.fields.find((f) => f.key === key);
  const fields = [...step.fields];
  const assume = (key: string, value: string, unit: string, evidence: string) => {
    if (get(key)?.value) return;
    const field: AIField = { key, value, unit, source: 'assumed', evidence, verified: false };
    const i = fields.findIndex((f) => f.key === key);
    if (i >= 0) fields[i] = field;
    else fields.push(field);
  };
  const es = locale === 'es';
  // estos módulos solo tienen tablas del B737 (otra aeronave en el enunciado la marca el modelo como no soportada)
  assume('aircraft', 'B737', '', es ? 'El enunciado no nombra la aeronave: este módulo solo tiene las tablas del Boeing 737.' : 'The statement does not name the aircraft: this module only has the Boeing 737 tables.');
  if (step.module !== 'fuel') return { ...step, fields };
  assume('hfl', '15', 'FL', es ? 'No figura en el enunciado: espera a 1 500 ft (FL 015), como en los ejercicios del curso.' : 'Not in the statement: holding at 1,500 ft (FL 015), as in the course exercises.');
  const scope = SCOPES[routeScope({ origin: get('dep')?.value ?? '', destination: get('dst')?.value ?? '', alternate: get('alt')?.value ?? '' })];
  assume('hm', String(scope.holdingMinutes), 'min', es ? `No figura en el enunciado: ${scope.holdingRule}` : `Not in the statement: holding of ${scope.holdingMinutes} min (${scope.contingencyPct ? 'international flight' : 'domestic flight, RAP'}).`);
  return { ...step, fields };
}

/**
 * Crea la sesión y su entrada de Historial (borrador). `originalText` es el enunciado tal como lo
 * escribió el usuario (se conserva en su idioma); si solo hubo imagen, se usa la transcripción.
 */
export function createAISession(analysis: AIAnalysis, image?: Blob, options: { locale?: Locale; originalText?: string } = {}): AISession {
  const locale = options.locale ?? 'es';
  const text = options.originalText?.trim() || analysis.text;
  const now = Date.now();
  const session: AISession = {
    id: newId(),
    createdAt: now,
    updatedAt: now,
    text,
    hadImage: !!image,
    analysis: structuredClone(analysis),
    steps: structuredClone(analysis.steps).map((step) => applyModuleAssumptions(step, locale)),
    results: {},
    status: 'draft',
  };
  if (image) images.set(session.id, image);
  const first = session.steps[0];
  addHistory({
    toolId: first?.module ?? 'fuel',
    href: first ? aiStepHref(session, first) : '/',
    summary: text.replace(/\s+/g, ' ').trim().slice(0, 140),
    result: '',
    sessionId: session.id,
    aiSession: session,
  });
  return session;
}

export const getAISession = (id: string): AISession | undefined => getHistory().find((e) => e.sessionId === id)?.aiSession;

/** Imagen de la sesión si sigue en memoria (misma pestaña). */
export const getAIImage = (id: string): Blob | undefined => images.get(id);

function save(session: AISession, href?: string) {
  const next = { ...session, updatedAt: Date.now(), status: statusOf(session) };
  const entry = getHistory().find((e) => e.sessionId === session.id);
  updateHistorySession(session.id, next, resultSummary(next), href ?? entry?.href ?? '/');
  return next;
}

/** Guarda las correcciones de un paso. Cambiar datos invalida su resultado y el de los pasos que dependen de él. */
export function updateAIStepFields(sessionId: string, stepId: string, fields: AIField[]) {
  const s = getAISession(sessionId);
  if (!s) return;
  const results = { ...s.results };
  const invalidate = (id: string) => {
    delete results[id];
    s.steps.filter((step) => step.dependsOn.includes(id)).forEach((step) => invalidate(step.id));
  };
  invalidate(stepId);
  save({ ...s, steps: s.steps.map((step) => (step.id === stepId ? { ...step, fields } : step)), results });
}

/** Guarda el resultado verificado de un paso; el historial abre la calculadora real de ese paso. */
export function setAIStepResult(sessionId: string, stepId: string, result: AICalculation): string | undefined {
  const s = getAISession(sessionId);
  const step = s?.steps.find((x) => x.id === stepId);
  if (!s || !step) return undefined;
  const href = aiToolHref(s, step, result.values);
  save({ ...s, results: { ...s.results, [stepId]: result } }, href);
  return href;
}

/** Suscripción reactiva a una sesión (se actualiza al guardar correcciones o resultados). */
export function useAISession(id: string | null | undefined): AISession | undefined {
  return useSyncExternalStore(subscribeHistory, () => (id ? getAISession(id) : undefined));
}
