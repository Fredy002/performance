import { unitHelp } from '@/content/units';
import { InfoTip } from './InfoTip';

/** Unidad con su significado (°F → «Grados Fahrenheit») al pasar el ratón, enfocar o tocar. */
export function Unit({ symbol }: { symbol: string }) {
  const help = unitHelp(symbol);
  if (!help) return <>{symbol}</>;
  return (
    <InfoTip label={symbol} trigger={symbol}>
      {help}
    </InfoTip>
  );
}
