import { useId } from 'react';
import { InfoTip } from './InfoTip';

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
  return (
    <div className={`field${wide ? ' field-wide' : ''}`}>
      <span className="field-label-row">
        <span className="field-label" id={id}>
          {label}
        </span>
        {help && <InfoTip label={label}>{help}</InfoTip>}
      </span>
      <div className="segmented" role="group" aria-labelledby={id}>
        {options.map(([v, text]) => (
          <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
