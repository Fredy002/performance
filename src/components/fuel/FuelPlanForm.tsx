import { useId, type ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { InfoTip } from '@/components/ui/InfoTip';
import { NumberField, numberError } from '@/components/ui/NumberField';
import { parseNumber } from '@/core/format';
import { Alert } from '@/components/ui/Alert';
import { foreignAirports, normalizeIcao, routeWarnings } from '@/data/airports';
import { SCOPES } from '@/exercises/registry';
import { AirportField, AirportsDatalist } from './AirportField';
import { formScope, routeFromForm, type FuelFormKey, type FuelFormValues } from './fuelForm';
import { useI18n } from '@/i18n';

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
  const { t } = useI18n();
  const id = useId();
  return (
    <div className="field">
      <span className="field-label-row">
        <label className="field-label" htmlFor={id}>{label}</label>
        <InfoTip label={t('fuel.windKinds')}>{t('help.windKind')}</InfoTip>
      </span>
      <select id={id} className="select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="HW">{t('fuel.headwindSum')}</option>
        <option value="TW">{t('fuel.tailwindSubtract')}</option>
      </select>
    </div>
  );
}

/** Datos de entrada: tramo, alterno, espera y rodaje. */
export function FuelPlanForm({ values: v, set, action, domesticOnly = false, bare }: Props) {
  const { t } = useI18n();
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
      error={numberError(v[k], parseNumber(v[k]), t('help.invalidNumber'))}
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
            {t('fuel.route')}
          </p>
          <div className="inline-fields airport-fields">
            <AirportField label={t('fuel.origin')} value={v.dep} onChange={(x) => set('dep', x)} />
            <AirportField label={t('fuel.destination')} value={v.dst} onChange={(x) => set('dst', x)} />
            <AirportField label={t('fuel.alternate')} value={v.alt} onChange={(x) => set('alt', x)} />
          </div>
          {foreign.length > 0 && !domesticOnly && (
            <div className="calc-section-sm">
              <Alert kind="info">
                <b>{t('fuel.international')}</b> ({foreign.join(', ')} {t(foreign.length > 1 ? 'fuel.airportNotPeruMany' : 'fuel.airportNotPeruOne')}):
                {' '}{t('fuel.holdingAndPercent', { minutes: scope.holdingMinutes, percent: Math.round(scope.contingencyPct * 100) })}
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
            {t('fuel.tripLeg')}{leg(v.dep, v.dst)}
          </p>
          <div className="inline-fields">
            {field('td', t('fuel.distance'), 'NM')}
            {field('tw', t('fuel.wind'), 'kt')}
            <WindSelect label={t('fuel.tripWindType')} value={v.tk} onChange={(x) => set('tk', x)} />
            {field('tfl', t('fuel.flightLevel'), 'FL', undefined, t('fuel.optional'), t('help.flightLevel'))}
          </div>
        </div>
        <div>
          <p className="field-label field-group-label">
            {t('fuel.alternateLeg')}{leg(v.dst, v.alt)}
          </p>
          <div className="inline-fields">
            {field('ad', t('fuel.distance'), 'NM')}
            {field('aw', t('fuel.wind'), 'kt')}
            <WindSelect label={t('fuel.alternateWindType')} value={v.ak} onChange={(x) => set('ak', x)} />
            {field('afl', t('fuel.flightLevel'), 'FL', undefined, t('fuel.optional'), t('help.flightLevel'))}
          </div>
        </div>
        <div>
          <p className="field-label field-group-label">
            {t('fuel.holdingTaxi')}
          </p>
          <div className="inline-fields">
            {field('hw', t('fuel.weightAtHold'), 'lb', undefined, undefined, t('help.holdingWeight'))}
            {field('hfl', t('fuel.holdingLevel'), 'FL', '015 = 1 500 ft', undefined, t('help.holdingLevel'))}
            {field('hm', t('fuel.holdingTime'), 'min', formScope(v) === 'nacional' ? t('fuel.holdingRuleDomestic') : t('fuel.holdingRuleInternational'))}
            {field('taxi', t('fuel.taxiFuel'), 'lb', undefined, undefined, t('help.taxi'))}
          </div>
        </div>
      </div>
    </>
  );
  return bare ? (
    content
  ) : (
    <Card title={t('calc.data')} action={action}>
      {content}
    </Card>
  );
}
