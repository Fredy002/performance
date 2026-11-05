import { unitMessageKey } from '@/content/units';
import { InfoTip } from './InfoTip';
import { useI18n, type MessageKey } from '@/i18n';

/** Unidad con su significado (°F → «Grados Fahrenheit») al pasar el ratón, enfocar o tocar. */
export function Unit({ symbol }: { symbol: string }) {
  const { t } = useI18n();
  const key = unitMessageKey(symbol);
  const help = key ? t(key as MessageKey) : undefined;
  if (!help) return <>{symbol}</>;
  return (
    <InfoTip label={symbol} trigger={symbol}>
      {help}
    </InfoTip>
  );
}
