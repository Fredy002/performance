import { useId, type ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { InfoTip } from '@/components/ui/InfoTip';
import { NumberField, numberError } from '@/components/ui/NumberField';
import { HELP } from '@/content/help';
import { parseNumber } from '@/core/format';
import { Alert } from '@/components/ui/Alert';
import { foreignAirports, normalizeIcao, routeWarnings } from '@/data/airports';
import { SCOPES } from '@/exercises/registry';
import { AirportField, AirportsDatalist } from './AirportField';
import { formScope, routeFromForm, type FuelFormKey, type FuelFormValues } from './fuelForm';

interface Props {
  values: FuelFormValues;
  set: (k: FuelFormKey, v: string) => void;
  action?: ReactNode;
  /** Forzar vuelo nacional: avisa si algún aeropuerto no es del Perú (por defecto el ámbito se deduce de los códigos) */
  domesticOnly?: boolean;
  /** Sin tarjeta propia (cuando va dentro de una sección plegable) */
  bare?: boolean;
}

function WindSelect({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const id = useId();
  return (
    <div className="field">
      <span className="field-label-row">
        <label className="field-label" htmlFor={id}>{label}</label>
        <InfoTip label="HW y TW">{HELP.windKind}</InfoTip>
      </span>
      <select id={id} className="select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="HW">Cara (HW) · suma</option>
        <option value="TW">Cola (TW) · resta</option>
      </select>
    </div>
  );
}

/** Datos de entrada: tramo, alterno, espera y rodaje. */
export function FuelPlanForm({ values: v, set, action, domesticOnly = false, bare }: Props) {
  const scope = SCOPES[formScope(v)];
  const foreign = foreignAirports(routeFromForm(v));
  const field = (k: FuelFormKey, label: string, unit?: string, hint?: string, placeholder?: string, help?: string) => (
    <NumberField
      label={label}
      value={v[k]}
      onChange={(x) => set(k, x)}
      unit={unit}
      hint={hint}
      help={help}
      placeholder={placeholder}
      error={numberError(v[k], parseNumber(v[k]), HELP.invalidNumber)}
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
          <p className="field-label field-group-label">
            Ruta
          </p>
          <div className="inline-fields airport-fields">
            <AirportField label="Origen" value={v.dep} onChange={(x) => set('dep', x)} />
            <AirportField label="Destino" value={v.dst} onChange={(x) => set('dst', x)} />
            <AirportField label="Alterno" value={v.alt} onChange={(x) => set('alt', x)} />
          </div>
          {foreign.length > 0 && !domesticOnly && (
            <div className="calc-section-sm">
              <Alert kind="info">
                <b>Vuelo internacional</b> ({foreign.join(', ')} no {foreign.length > 1 ? 'son aeropuertos' : 'es un aeropuerto'} del Perú):
                espera de {scope.holdingMinutes} min y se suma el {Math.round(scope.contingencyPct * 100)} % de T.T y de T.F a la
                autonomía y al FOB.
              </Alert>
            </div>
          )}
          {warnings.length > 0 && (
            <div className="alert alert-warning calc-section-sm" role="note">
              <div>
                {warnings.map((w) => (
                  <p key={w}>{w}</p>
                ))}
              </div>
            </div>
          )}
        </div>
        <div>
          <p className="field-label field-group-label">
            Origen – destino{leg(v.dep, v.dst)}
          </p>
          <div className="inline-fields">
            {field('td', 'Distancia', 'NM')}
            {field('tw', 'Viento', 'kt')}
            <WindSelect label="Tipo de viento (origen)" value={v.tk} onChange={(x) => set('tk', x)} />
            {field('tfl', 'Nivel de vuelo', 'FL', undefined, 'opcional', HELP.flightLevel)}
          </div>
        </div>
        <div>
          <p className="field-label field-group-label">
            Destino – alterno{leg(v.dst, v.alt)}
          </p>
          <div className="inline-fields">
            {field('ad', 'Distancia', 'NM')}
            {field('aw', 'Viento', 'kt')}
            <WindSelect label="Tipo de viento (alterno)" value={v.ak} onChange={(x) => set('ak', x)} />
            {field('afl', 'Nivel de vuelo', 'FL', undefined, 'opcional', HELP.flightLevel)}
          </div>
        </div>
        <div>
          <p className="field-label field-group-label">
            Espera y rodaje
          </p>
          <div className="inline-fields">
            {field('hw', 'Peso en espera', 'lb', undefined, undefined, HELP.holdingWeight)}
            {field('hfl', 'Nivel de espera', 'FL', '015 = 1 500 ft', undefined, HELP.holdingLevel)}
            {field('hm', 'Tiempo de espera', 'min', scope.holdingRule)}
            {field('taxi', 'Combustible de taxi', 'lb', undefined, undefined, HELP.taxi)}
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
