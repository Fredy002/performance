/**
 * Redondeo decimal «como a mano»: la mitad se redondea alejándose de cero
 * (17607,255 → 17607,26; 1,005 → 1,01; −2,5 → −3).
 * Evita el error de toFixed/Math.round con valores binarios como 1,005 (= 1,00499…).
 */
export function roundTo(value: number, decimals: number): number {
  if (!Number.isFinite(value)) return value;
  const d = Math.max(0, Math.min(10, Math.trunc(decimals)));
  const sign = value < 0 ? -1 : 1;
  // desplazar la coma en notación exponencial evita multiplicar en binario
  const shifted = Number(`${Math.abs(value)}e${d}`);
  const rounded = Number(`${Math.round(shifted + 1e-9)}e-${d}`);
  return sign * rounded || 0;
}

export function formatNumber(value: number, decimals = 2, locale = 'es-ES'): string {
  if (!Number.isFinite(value)) return '—';
  return roundTo(value, decimals).toLocaleString(locale, {
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

/**
 * Número sin separador de miles, con separador decimal según locale y ceros finales recortados.
 */
export function formatPlain(value: number, maxDecimals = 2, locale = 'es-ES'): string {
  if (!Number.isFinite(value)) return '—';
  const fixed = roundTo(value, maxDecimals).toFixed(maxDecimals);
  const trimmed = fixed.includes('.') ? fixed.replace(/0+$/, '').replace(/\.$/, '') : fixed;
  const decimal = new Intl.NumberFormat(locale).formatToParts(1.1).find((part) => part.type === 'decimal')?.value ?? '.';
  return (trimmed === '-0' ? '0' : trimmed).replace('.', decimal);
}
