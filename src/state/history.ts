import { createPersistedStore } from './createStore';
import type { AISession } from './aiSession';

export interface HistoryEntry {
  id: string;
  toolId: string;
  /** Texto corto que describe los datos de entrada */
  summary: string;
  /** Resultado principal formateado */
  result: string;
  /** Ruta con parámetros para reabrir el cálculo */
  href: string;
  note?: string;
  /** AI context belongs to this entry and is deleted with it. Images are never persisted. */
  aiSession?: AISession;
  sessionId?: string;
  createdAt: number;
}

const MAX_ENTRIES = 200;

const store = createPersistedStore<HistoryEntry[]>('aeroperf.history', []);

export const useHistory = store.useStore;
export const getHistory = store.get;
export const subscribeHistory = store.subscribe;
export function updateHistorySession(id: string, session: AISession, result: string, href: string) {
  store.set(prev => prev.map(entry => entry.sessionId === id ? { ...entry, aiSession: session, result, href } : entry));
}

export function addHistory(entry: Omit<HistoryEntry, 'id' | 'createdAt'>): HistoryEntry {
  // un ejercicio de IA tiene una sola entrada: en revisión (?aiReview=) o ya en su calculadora (?from=)
  const query = new URLSearchParams(entry.href.split('?')[1]);
  const sessionId = entry.sessionId ?? query.get('aiReview') ?? query.get('from') ?? undefined;
  const existing = sessionId ? store.get().find(item => item.sessionId === sessionId) : undefined;
  if (existing) {
    const updated = { ...existing, ...entry, sessionId };
    store.set(prev => prev.map(item => item.id === existing.id ? updated : item));
    return updated;
  }
  const full: HistoryEntry = {
    sessionId,
    ...entry,
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()),
    createdAt: Date.now(),
  };
  store.set((prev) => [full, ...prev].slice(0, MAX_ENTRIES));
  return full;
}

/** Elimina una entrada y la devuelve con su posición, para poder deshacer. */
export function removeHistory(id: string): { entry: HistoryEntry; index: number } | undefined {
  let removed: { entry: HistoryEntry; index: number } | undefined;
  store.set((prev) => {
    const index = prev.findIndex((e) => e.id === id);
    if (index < 0) return prev;
    removed = { entry: prev[index], index };
    return prev.filter((e) => e.id !== id);
  });
  return removed;
}

/** Vuelve a insertar entradas eliminadas en su posición original (Deshacer). */
export function restoreHistory(items: { entry: HistoryEntry; index: number }[]) {
  store.set((prev) => {
    const next = [...prev];
    for (const { entry, index } of [...items].sort((a, b) => a.index - b.index)) {
      if (!next.some((e) => e.id === entry.id)) next.splice(Math.min(index, next.length), 0, entry);
    }
    return next.slice(0, MAX_ENTRIES);
  });
}

/** Borra todo y devuelve lo borrado, para poder deshacer. */
export function clearHistory(): HistoryEntry[] {
  let removed: HistoryEntry[] = [];
  store.set((prev) => {
    removed = prev;
    return [];
  });
  return removed;
}
