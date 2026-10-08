import { createPersistedStore } from './createStore';

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
  createdAt: number;
}

const MAX_ENTRIES = 200;

const store = createPersistedStore<HistoryEntry[]>('aeroperf.history', []);

export const useHistory = store.useStore;

export function addHistory(entry: Omit<HistoryEntry, 'id' | 'createdAt'>): HistoryEntry {
  const full: HistoryEntry = {
    ...entry,
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()),
    createdAt: Date.now(),
  };
  store.set((prev) => [full, ...prev].slice(0, MAX_ENTRIES));
  return full;
}

export function removeHistory(id: string) {
  store.set((prev) => prev.filter((e) => e.id !== id));
}

export function clearHistory() {
  store.set([]);
}
