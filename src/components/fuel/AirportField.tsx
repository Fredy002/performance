import { useId } from 'react';
import { InfoTip } from '@/components/ui/InfoTip';
import { findAirport, INTERNATIONAL_AIRPORTS, isIcaoCode, normalizeIcao, PERU_AIRPORTS } from '@/data/airports';
import { useI18n } from '@/i18n';

export const AIRPORTS_DATALIST_ID = 'peru-airports';

/** Lista para autocompletar códigos OACI (se monta una vez por formulario). */
export function AirportsDatalist() {
  return (
    <datalist id={AIRPORTS_DATALIST_ID}>
      {[...PERU_AIRPORTS, ...INTERNATIONAL_AIRPORTS].map((a) => (
        <option key={a.icao} value={a.icao}>
          {a.city}{a.country ? ` (${a.country})` : ''} · {a.name}
        </option>
      ))}
    </datalist>
  );
}

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

/** Código OACI de un aeropuerto: 4 letras, en mayúsculas, con el nombre debajo si se conoce. */
export function AirportField({ label, value, onChange }: Props) {
  const { t } = useI18n();
  const id = useId();
  const code = normalizeIcao(value);
  const airport = findAirport(code);
  const invalid = code !== '' && code.length === 4 && !isIcaoCode(code);
  const hint = !code
    ? t('fuel.airportIcaoHint')
    : airport
      ? `${airport.city}${airport.country ? ` (${airport.country})` : ''} · ${airport.name}`
      : code.length < 4
        ? t('fuel.airportCodeLength')
        : invalid
          ? t('fuel.airportLettersOnly')
          : t('fuel.airportNotListed');
  return (
    <div className="field">
      <span className="field-label-row">
        <label className="field-label" htmlFor={id}>
          {label}
        </label>
        <InfoTip label={t('fuel.icaoLabel')}>{t('help.icao')}</InfoTip>
      </span>
      <div className={`field-control${invalid ? ' invalid' : ''}`}>
        <span className="field-tag tag-sm" aria-hidden="true">
          {t('fuel.icao')}
        </span>
        <input
          id={id}
          value={value}
          maxLength={4}
          list={AIRPORTS_DATALIST_ID}
          autoComplete="off"
          spellCheck={false}
          placeholder="SP__"
          className="input-code"
          onChange={(e) => onChange(e.target.value.toUpperCase().replace(/\s/g, ''))}
          onFocus={(e) => e.target.select()}
          aria-invalid={invalid || undefined}
          aria-describedby={`${id}-hint`}
        />
      </div>
      <span id={`${id}-hint`} className={`field-hint${invalid ? ' field-error' : ''}`}>{hint}</span>
    </div>
  );
}
