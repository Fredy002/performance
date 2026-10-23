import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { NumberField } from '@/components/ui/NumberField';
import { parseNumber } from '@/core/format';
import { normalizeIcao, routeWarnings } from '@/data/airports';
import { AirportField, AirportsDatalist } from './AirportField';
import { routeFromForm, type FuelFormKey, type FuelFormValues } from './fuelForm';

interface Props {
  values: FuelFormValues;
  set: (k: FuelFormKey, v: string) => void;
  action?: ReactNode;
  holdingHint?: string;
  /** Vuelo nacional: avisa si algún aeropuerto no es del Perú */
  domesticOnly?: boolean;
  /** Sin tarjeta propia (cuando va dentro de una sección plegable) */
  bare?: boolean;
}

function WindSelect({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      <select className="select" style={{ height: 46 }} value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
        <option value="HW">Cara (HW) · suma</option>
        <option value="TW">Cola (TW) · resta</option>
      </select>
    </div>
  );
}

/** Datos de entrada: tramo, alterno, espera y rodaje. */
export function FuelPlanForm({ values: v, set, action, holdingHint, domesticOnly = true, bare }: Props) {
  const field = (k: FuelFormKey, label: string, unit?: string, hint?: string, placeholder?: string) => (
    <NumberField
      label={label}
      value={v[k]}
      onChange={(x) => set(k, x)}
      unit={unit}
      hint={hint}
      placeholder={placeholder}
      invalid={v[k] !== '' && Number.isNaN(parseNumber(v[k]))}
    />
  );
  // etiqueta del tramo con los códigos que haya escrito el usuario
  const leg = (a: string, b: string) => {
    const [x, y] = [normalizeIcao(a), normalizeIcao(b)];
    return x || y ? ` (${x || '····'} – ${y || '····'})` : '';
  };
  const warnings = routeWarnings(routeFromForm(v), domesticOnly);
  const content = (
    <>
      <AirportsDatalist />
      <div className="stack">
        <div>
          <p className="field-label" style={{ marginBottom: 8 }}>
            Ruta
          </p>
          <div className="inline-fields airport-fields">
            <AirportField label="Origen" value={v.dep} onChange={(x) => set('dep', x)} />
            <AirportField label="Destino" value={v.dst} onChange={(x) => set('dst', x)} />
            <AirportField label="Alterno" value={v.alt} onChange={(x) => set('alt', x)} />
          </div>
          {warnings.length > 0 && (
            <div className="alert alert-warning" role="note" style={{ marginTop: 12 }}>
              <div>
                {warnings.map((w) => (
                  <p key={w}>{w}</p>
                ))}
              </div>
            </div>
          )}
        </div>
        <div>
          <p className="field-label" style={{ marginBottom: 8 }}>
            Origen – destino{leg(v.dep, v.dst)}
          </p>
          <div className="inline-fields">
            {field('td', 'Distancia', 'NM')}
            {field('tw', 'Viento', 'kt')}
            <WindSelect label="Tipo de viento (origen)" value={v.tk} onChange={(x) => set('tk', x)} />
            {field('tfl', 'Nivel de vuelo', 'FL', undefined, 'opcional')}
          </div>
        </div>
        <div>
          <p className="field-label" style={{ marginBottom: 8 }}>
            Destino – alterno{leg(v.dst, v.alt)}
          </p>
          <div className="inline-fields">
            {field('ad', 'Distancia', 'NM')}
            {field('aw', 'Viento', 'kt')}
            <WindSelect label="Tipo de viento (alterno)" value={v.ak} onChange={(x) => set('ak', x)} />
            {field('afl', 'Nivel de vuelo', 'FL', undefined, 'opcional')}
          </div>
        </div>
        <div>
          <p className="field-label" style={{ marginBottom: 8 }}>
            Espera y rodaje
          </p>
          <div className="inline-fields">
            {field('hw', 'Peso en espera', 'lb')}
            {field('hfl', 'Nivel de espera', 'FL', '015 = 1 500 ft')}
            {field('hm', 'Tiempo de espera', 'min', holdingHint)}
            {field('taxi', 'Combustible de taxi', 'lb')}
          </div>
        </div>
      </div>
    </>
  );
  return bare ? (
    content
  ) : (
    <Card title="Datos" action={action}>
      {content}
    </Card>
  );
}
