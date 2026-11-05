import { useId, type ReactNode } from 'react';
import { InfoTip } from './InfoTip';
import { Unit } from './Unit';
import { useI18n } from '@/i18n';

interface Props {
  label?: ReactNode;
  tag?: ReactNode;
  value: string;
  onChange: (v: string) => void;
  unit?: string;
  hint?: ReactNode;
  /** Ayuda contextual (InfoTip) junto a la etiqueta o a la sigla */
  help?: string;
  /** Mensaje de error del campo; sustituye a la pista y marca el campo como inválido */
  error?: string;
  /** Nombre accesible cuando la etiqueta visible es solo una sigla (A1, Q11…) */
  srLabel?: string;
  invalid?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

/** Campo numérico con etiqueta lateral (estilo de la tabla de referencia). */
export function NumberField({ label, tag, value, onChange, unit, hint, help, error, srLabel, invalid, placeholder, autoFocus }: Props) {
  const { t } = useI18n();
  const id = useId();
  const msgId = `${id}-msg`;
  const isInvalid = invalid || !!error;
  const helpName = typeof label === 'string' ? label : typeof tag === 'string' ? tag : (srLabel ?? t('ui.invalidField'));
  const message = error ?? hint;
  return (
    <div className="field">
      {label && (
        <span className="field-label-row">
          <label className="field-label" htmlFor={id}>
            {label}
          </label>
          {help && <InfoTip label={helpName}>{help}</InfoTip>}
        </span>
      )}
      <div className={`field-control${isInvalid ? ' invalid' : ''}`}>
        {tag && (
          <span className="field-tag" aria-hidden={srLabel ? true : undefined}>
            {tag}
          </span>
        )}
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={value}
          placeholder={placeholder ?? '0'}
          autoFocus={autoFocus}
          aria-invalid={isInvalid || undefined}
          aria-describedby={message ? msgId : undefined}
          aria-label={srLabel ?? (typeof label === 'string' ? undefined : typeof tag === 'string' ? tag : undefined)}
          onChange={(e) => onChange(e.target.value)}
          onFocus={(e) => e.target.select()}
        />
        {unit && (
          <span className="field-unit">
            <Unit symbol={unit} />
          </span>
        )}
        {!label && help && (
          <span className="field-help-inline">
            <InfoTip label={helpName}>{help}</InfoTip>
          </span>
        )}
      </div>
      {message && (
        <span id={msgId} className={`field-hint${error ? ' field-error' : ''}`}>
          {message}
        </span>
      )}
    </div>
  );
}

/** Mensaje de error para un valor no numérico (vacío = sin error). */
export function numberError(raw: string, parsed: number, message: string): string | undefined {
  return raw.trim() !== '' && Number.isNaN(parsed) ? message : undefined;
}
