import { useCallback, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { parseNumber } from '@/core/format';

/**
 * Estado de un formulario numérico. Se inicializa desde la URL (?a=600&b=650…)
 * para poder reabrir cálculos del historial o compartirlos por enlace.
 */
export function useFormValues<K extends string>(defaults: Record<K, string>) {
  const [params] = useSearchParams();
  const location = useLocation();
  const keys = Object.keys(defaults) as K[];

  const [values, setValues] = useState<Record<K, string>>(() => {
    const init = { ...defaults };
    for (const k of keys) {
      const v = params.get(k);
      if (v !== null) init[k] = v;
    }
    return init;
  });

  const set = useCallback((key: K, value: string) => setValues((prev) => ({ ...prev, [key]: value })), []);
  const reset = useCallback(() => setValues({ ...defaults }), [defaults]);
  const clear = useCallback(
    () => setValues(Object.fromEntries(keys.map((k) => [k, ''])) as Record<K, string>),
    [],
  );
  const load = useCallback((next: Partial<Record<K, string>>) => setValues((prev) => ({ ...prev, ...next })), []);

  const numbers = useMemo(() => {
    const out = {} as Record<K, number>;
    for (const k of keys) out[k] = parseNumber(values[k]);
    return out;
  }, [values]);

  /** Ruta interna (para el historial) con los valores actuales. */
  const href = useMemo(() => {
    const qs = new URLSearchParams();
    for (const k of keys) if (values[k] !== '') qs.set(k, values[k]);
    return `${location.pathname}?${qs.toString()}`;
  }, [values, location.pathname]);

  return { values, numbers, set, reset, clear, load, href };
}

/** URL absoluta compartible para una ruta interna (HashRouter). */
export function shareUrl(href: string): string {
  const base = window.location.href.split('#')[0];
  return `${base}#${href}`;
}
