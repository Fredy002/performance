export function formatNumber(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/** Acepta coma o punto decimal. Devuelve NaN si no es un número válido. */
export function parseNumber(raw: string): number {
  const s = raw.trim().replace(/\s/g, '').replace(',', '.');
  if (s === '' || s === '-' || s === '.') return NaN;
  return Number(s);
}
