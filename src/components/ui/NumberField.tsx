import { useId, type ReactNode } from 'react';

interface Props {
  label?: ReactNode;
  tag?: ReactNode;
  value: string;
  onChange: (v: string) => void;
  unit?: string;
  hint?: ReactNode;
  invalid?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

/** Campo numérico con etiqueta lateral (estilo de la tabla de referencia). */
export function NumberField({ label, tag, value, onChange, unit, hint, invalid, placeholder, autoFocus }: Props) {
  const id = useId();
  return (
    <div className="field">
      {label && (
        <label className="field-label" htmlFor={id}>
          {label}
        </label>
      )}
      <div className={`field-control${invalid ? ' invalid' : ''}`}>
        {tag && <span className="field-tag">{tag}</span>}
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={value}
          placeholder={placeholder ?? '0'}
          autoFocus={autoFocus}
          aria-invalid={invalid || undefined}
          aria-label={typeof label === 'string' ? label : typeof tag === 'string' ? tag : undefined}
          onChange={(e) => onChange(e.target.value)}
          onFocus={(e) => e.target.select()}
        />
        {unit && <span className="field-unit">{unit}</span>}
      </div>
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  );
}
