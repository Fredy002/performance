import { useSyncExternalStore } from 'react';

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  text: string;
  kind: ToastKind;
  /** Acción opcional, p. ej. «Deshacer». */
  action?: { label: string; run: () => void };
}

let current: Toast | null = null;
let seq = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function dismissToast() {
  clearTimeout(timer);
  current = null;
  emit();
}

/**
 * Muestra un aviso breve. Con acción (p. ej. «Deshacer») dura más para dar
 * tiempo a usarla.
 */
export function showToast(text: string, opts: { kind?: ToastKind; action?: Toast['action'] } = {}) {
  current = { id: ++seq, text, kind: opts.kind ?? 'success', action: opts.action };
  emit();
  clearTimeout(timer);
  timer = setTimeout(dismissToast, opts.action ? 6000 : 2600);
}

export function useToast(): Toast | null {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
  );
}
