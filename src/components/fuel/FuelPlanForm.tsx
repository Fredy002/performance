import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { NumberField } from '@/components/ui/NumberField';
import { parseNumber } from '@/core/format';
import type { FuelFormKey, FuelFormValues } from './fuelForm';

interface Props {
  values: FuelFormValues;
  set: (k: FuelFormKey, v: string) => void;
  routes?: { trip: [string, string]; alternate: [string, string] };
  action?: ReactNode;
  holdingHint?: string;
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
export function FuelPlanForm({ values: v, set, routes, action, holdingHint }: Props) {
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
  const route = (r?: [string, string]) => (r ? ` (${r.join(' – ')})` : '');
  return (
    <Card title="Datos" action={action}>
      <div className="stack">
        <div>
          <p className="field-label" style={{ marginBottom: 8 }}>
            Origen – destino{route(routes?.trip)}
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
            Destino – alterno{route(routes?.alternate)}
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
    </Card>
  );
}
