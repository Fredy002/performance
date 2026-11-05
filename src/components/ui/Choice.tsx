import { useId } from 'react';
import { unitMessageKey } from '@/content/units';
import { InfoTip } from './InfoTip';
import { useI18n, type MessageKey } from '@/i18n';

/** Grupo de opciones (ON/OFF, unidades, HW/TW) con etiqueta visible y ayuda opcional. */
export function Choice({
  label,
  help,
  value,
  options,
  onChange,
  wide,
}: {
  label: string;
  help?: string;
  value: string;
  options: [string, string][];
  onChange: (v: string) => void;
  /** Ocupa toda la fila de la rejilla */
  wide?: boolean;
}) {
  const id = useId();
  const { t } = useI18n();
  // opciones que son unidades o siglas (°F, mb, ISA, HW…): su significado en la ayuda y al pasar el ratón
  const meanings = options.map(([, text]) => {
    const key = unitMessageKey(text);
    return [text, key ? t(key as MessageKey) : undefined] as const;
  }).filter((m): m is readonly [string, string] => !!m[1]);
  return (
    <div className={`field${wide ? ' field-wide' : ''}`}>
      <span className="field-label-row">
        <span className="field-label" id={id}>
          {label}
        </span>
        {(help || meanings.length > 0) && (
          <InfoTip label={label}>
            {help}
            {meanings.map(([text, meaning]) => (
              <span key={text} className="infotip-line">
                <b>{text}</b>: {meaning}
              </span>
            ))}
          </InfoTip>
        )}
      </span>
      <div className="segmented" role="group" aria-labelledby={id}>
        {options.map(([v, text]) => (
          <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)} title={unitMessageKey(text) ? t(unitMessageKey(text)! as MessageKey) : undefined}>
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
