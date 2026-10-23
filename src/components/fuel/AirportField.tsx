import { useId } from 'react';
import { findAirport, isIcaoCode, normalizeIcao, PERU_AIRPORTS } from '@/data/airports';

export const AIRPORTS_DATALIST_ID = 'peru-airports';

/** Lista para autocompletar códigos OACI (se monta una vez por formulario). */
export function AirportsDatalist() {
  return (
    <datalist id={AIRPORTS_DATALIST_ID}>
      {PERU_AIRPORTS.map((a) => (
        <option key={a.icao} value={a.icao}>
          {a.city} · {a.name}
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
  const id = useId();
  const code = normalizeIcao(value);
  const airport = findAirport(code);
  const invalid = code !== '' && code.length === 4 && !isIcaoCode(code);
  const hint = !code
    ? 'Código OACI, p. ej. SPJC'
    : airport
      ? `${airport.city} · ${airport.name}`
      : code.length < 4
        ? 'El código OACI tiene 4 letras'
        : invalid
          ? 'Solo letras (A–Z)'
          : 'No está en la lista de referencia';
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className={`field-control${invalid ? ' invalid' : ''}`}>
        <span className="field-tag" style={{ fontSize: 12 }}>
          OACI
        </span>
        <input
          id={id}
          value={value}
          maxLength={4}
          list={AIRPORTS_DATALIST_ID}
          autoComplete="off"
          spellCheck={false}
          placeholder="SP__"
          style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
          onChange={(e) => onChange(e.target.value.toUpperCase().replace(/\s/g, ''))}
          onFocus={(e) => e.target.select()}
        />
      </div>
      <span className="field-hint">{hint}</span>
    </div>
  );
}
