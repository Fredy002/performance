import { TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sameClimbForm, scenarioClimbInput, toClimbForm, useEnRouteClimb } from '@/components/climb/climbForm';
import { ClimbAnswers, ClimbForm, ClimbSteps } from '@/components/climb/ClimbViews';
import { ToolActions } from '@/components/ToolActions';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { Disclosure } from '@/components/ui/Disclosure';
import { InfoTip } from '@/components/ui/InfoTip';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatPlain } from '@/core/format';
import { B737_CLIMB_SCENARIOS } from '@/data/tables/enRouteClimbData';
import { useFormValues } from '@/hooks/useFormValues';
import { useDecimals } from '@/state/settings';
import { useI18n } from '@/i18n';

const SCENARIOS = B737_CLIMB_SCENARIOS.map((s) => ({ s, form: toClimbForm(scenarioClimbInput(s)) }));
const DEFAULTS = SCENARIOS.find(({ s }) => s.id === 'V-5')!.form;

export default function EnRouteClimb() {
  const decimals = useDecimals();
  const { locale, t } = useI18n();
  const numberLocale = locale === 'en' ? 'en-US' : 'es-ES';
  const form = useFormValues(DEFAULTS);
  const v = form.values;
  const plan = useEnRouteClimb(v, decimals);
  const r = plan.result;
  const scenario = SCENARIOS.find(({ form: f }) => sameClimbForm(f, v))?.s;
  const p = (x: number) => formatPlain(x, decimals, numberLocale);

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <TrendingUp size={14} /> {t('climb.eyebrow')}
          </>
        }
        title={t('climb.title')}
        subtitle={t('climb.subtitle')}
        actions={
          <ToolActions
            toolId="en-route-climb"
            href={form.href}
            canSave={!!r}
            summary={`${scenario ? `${scenario.id} · ` : ''}${p(Number(v.w))} lb · FL ${Math.round(Number(v.alt) / 100)} · ${t('climbForm.airportElevation').toLowerCase()} ${p(Number(v.elev))} ft · ${v.t === 'ISA10' ? 'ISA +10' : 'ISA'} · ${p(Number(v.wind))} kt ${v.wk}`}
            result={r ? `${p(r.fuelLb)} lb · ${p(r.distNm)} NM` : ''}
            onReset={form.reset}
            capture={() => {
              const prev = form.values;
              return () => form.load(prev);
            }}
          />
        }
      />

      <div className="grid grid-calc">
        <Card
          title={t('calc.conditions')}
          action={
            <span className="with-help">
              <select
                className="select select-compact"
                aria-label={t('climb.loadConditionsAria')}
                value={scenario?.id ?? ''}
                onChange={(e) => {
                  const found = SCENARIOS.find(({ s }) => s.id === e.target.value);
                  if (found) form.load(found.form);
                }}
              >
                <option value="" disabled>
                  {t('climb.selectConditions')}
                </option>
                {SCENARIOS.map(({ s }) => (
                  <option key={s.id} value={s.id}>
                    {s.id}
                  </option>
                ))}
              </select>
              <InfoTip label={t('climb.loadConditionsAria')}>{t('help.climbScenario')}</InfoTip>
            </span>
          }
        >
          <ClimbForm values={v} set={form.set} />
        </Card>
        <div className="stack">
          <ClimbAnswers
            result={r}
            decimals={decimals}
            placeholder={<div className="empty">{plan.error ? t('calc.reviewData') : t('climb.complete')}</div>}
          />
          {plan.error && <Alert kind="error">{plan.error}</Alert>}
        </div>
      </div>

      <div className="calc-section">
        <Disclosure title={t('calc.steps')} meta={r ? `${r.table.figure} · ${p(r.timeMin)} min` : undefined} defaultOpen>
          {r ? <ClimbSteps result={r} input={plan.input} decimals={decimals} /> : <p className="calc-text">{t('calc.appearsWhenReady')}</p>}
        </Disclosure>
        <Disclosure title={t('calc.howCalculated')}>
          <div className="help-block">
            <ul>
              <li>
                <b>{t('climb.tableHelp')}</b>: <Link to="/tables/ascenso-ruta-280-070-isa">{t('climb.temperatureIsaHelp')}</Link> o{' '}
                <Link to="/tables/ascenso-ruta-280-070-isa-mas-10">{t('climb.temperatureIsa10Help')}</Link>. {t('climb.tableMethod')}
              </li>
              <li>
                <b>{t('climb.fuelConsumed')}</b>{t('climb.fuelMethod')}
              </li>
              <li>
                <b>{t('climb.distanceTravelled')}</b>{t('climb.distanceMethod')}
              </li>
              <li>{t('climb.rounding')}</li>
            </ul>
          </div>
        </Disclosure>
      </div>
    </>
  );
}
