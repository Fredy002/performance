import { Gauge } from 'lucide-react';
import { Link } from 'react-router-dom';
import { b727ScenarioCase, b737ScenarioCase, EPR_FORM_KEYS, formAircraft, toEprForm, useTakeoffEpr, type EprFormValues } from '@/components/takeoff/eprForm';
import { TakeoffEprForm } from '@/components/takeoff/TakeoffEprForm';
import { B737EprAnswers, B737EprSteps, TakeoffEprAnswers, TakeoffEprSteps } from '@/components/takeoff/TakeoffEprResults';
import { ToolActions } from '@/components/ToolActions';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { Disclosure } from '@/components/ui/Disclosure';
import { InfoTip } from '@/components/ui/InfoTip';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatPlain } from '@/core/format';
import { B727_TAKEOFF_SCENARIOS, B737_TAKEOFF_SCENARIOS } from '@/data/tables/takeoffEprData';
import { useFormValues } from '@/hooks/useFormValues';
import { useDecimals } from '@/state/settings';
import { useI18n } from '@/i18n';

const G5 = B727_TAKEOFF_SCENARIOS.find((s) => s.id === 'G-5')!;
// los enlaces y el historial previos (sin `av`) son del B727: ese sigue siendo el ejemplo por defecto
const DEFAULTS: EprFormValues = toEprForm(b727ScenarioCase(G5));

/** Escenarios de las tablas de condiciones: R-1…R-5 (B737, FIGURE 53) y G-1…G-5 (B727, FIGURE 81). */
const SCENARIOS = [
  ...B737_TAKEOFF_SCENARIOS.map((s) => ({
    id: s.id,
    aircraft: 'b737' as const,
    form: toEprForm(b737ScenarioCase(s)),
    noteData: { weight: s.weightKlb, flaps: s.flapsDeg, wind: Math.abs(s.windKt), windType: s.windKt >= 0 ? 'HW' : 'TW', slope: Math.abs(s.slopePct), slopeType: s.slopePct >= 0 ? 'UP' : 'DN', cg: s.cgStation },
  })),
  ...B727_TAKEOFF_SCENARIOS.map((s) => ({
    id: s.id,
    aircraft: 'b727' as const,
    form: toEprForm(b727ScenarioCase(s)),
    noteData: { weight: s.grossWeightKlb, flaps: s.flapsDeg, cg: s.cgStation },
  })),
];

export default function TakeoffEpr() {
  const decimals = useDecimals();
  const { locale, t } = useI18n();
  const numberLocale = locale === 'en' ? 'en-US' : 'es-ES';
  const form = useFormValues(DEFAULTS);
  const v = form.values;
  const aircraft = formAircraft(v);
  const plan = useTakeoffEpr(v);
  // escenario que coincide con los datos actuales (sin contar la 6.ª etapa, que el B737 no usa)
  const scenario = SCENARIOS.find((s) => s.aircraft === aircraft && EPR_FORM_KEYS.every((k) => (aircraft === 'b737' && k === 'b6') || s.form[k] === v[k]));
  const resultText =
    plan.aircraft === 'b737'
      ? plan.result && `EPR ${formatPlain(plan.result.final, 2, numberLocale)}`
      : plan.result && `${t('takeoff.answerEng13')}: ${formatPlain(plan.result.eng13.final, 2, numberLocale)} · ${t('takeoff.answerEng2')}: ${formatPlain(plan.result.eng2.final, 2, numberLocale)}`;
  const placeholder = <div className="empty">{plan.error ? t('calc.reviewData') : t('takeoff.complete')}</div>;
  const name = aircraft === 'b737' ? 'Boeing 737' : 'Boeing 727';

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <Gauge size={14} /> {name} · {t('takeoff.departure')}
          </>
        }
        title={t('takeoff.title')}
        subtitle={t('takeoff.subtitle')}
        actions={
          <ToolActions
            toolId="takeoff-epr"
            href={form.href}
            canSave={!!plan.result}
            summary={`${name}${scenario ? ` ${scenario.id}` : ''} · ${t('takeoff.summaryElevation')} ${formatPlain(Number(v.elev), decimals, numberLocale)} ft · ${formatPlain(Number(v.qnh), 1, numberLocale)} ${v.qu === 'mb' ? 'mb' : 'in.Hg'} · ${formatPlain(Number(v.oat), 1, numberLocale)} °${v.tu}`}
            result={resultText || ''}
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
                aria-label={t('takeoff.loadConditionsAria')}
                value={scenario?.id ?? ''}
                onChange={(e) => {
                  const s = SCENARIOS.find((x) => x.id === e.target.value);
                  if (s) form.load(s.form);
                }}
              >
                <option value="" disabled>
                  {t('calc.loadConditions')}
                </option>
                <optgroup label={t('takeoff.scenarioLabel737')}>
                  {SCENARIOS.filter((s) => s.aircraft === 'b737').map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={t('takeoff.scenarioLabel727')}>
                  {SCENARIOS.filter((s) => s.aircraft === 'b727').map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id}
                    </option>
                  ))}
                </optgroup>
              </select>
              <InfoTip label={t('takeoff.loadConditionsAria')}>{t('help.takeoffScenario')}</InfoTip>
            </span>
          }
        >
          <TakeoffEprForm values={v} set={form.set} />
          {scenario && (
            <p className="calc-note">
              {t(scenario.aircraft === 'b737' ? 'takeoff.scenarioNote737' : 'takeoff.scenarioNote727', scenario.noteData)}
            </p>
          )}
        </Card>
        <div className="stack">
          {plan.aircraft === 'b737' ? (
            <B737EprAnswers result={plan.result} placeholder={placeholder} />
          ) : (
            <TakeoffEprAnswers result={plan.result} placeholder={placeholder} />
          )}
          {plan.error && <Alert kind="error">{plan.error}</Alert>}
        </div>
      </div>

      <div className="calc-section">
        <Disclosure
          title={t('calc.steps')}
          meta={plan.result ? t('takeoff.pressureAltitudeMeta', { value: formatPlain(plan.result.pressure.pressureAltitudeFt, 0, numberLocale) }) : undefined}
          defaultOpen
        >
          {!plan.result ? (
            <p className="calc-text">{t('calc.appearsWhenReady')}</p>
          ) : plan.aircraft === 'b737' ? (
            <B737EprSteps result={plan.result} input={plan.input} decimals={decimals} />
          ) : (
            <TakeoffEprSteps result={plan.result} input={plan.input} decimals={decimals} />
          )}
        </Disclosure>
        <Disclosure title={t('calc.howCalculated')}>
          <div className="help-block">
            <ul>
              <li>
                <b>{t('takeoff.pressureAltitude')}</b> {t('takeoff.pressureAltitudeHow')}
                <Link to="/tables/reglaje-altimetrico-altitud-presion">{t('takeoff.altimeterTable')}</Link>).
              </li>
              <li>
                <b>{t('takeoff.b737How')}<Link to="/tables/performance-despegue-b737">{t('takeoff.b737Table')}</Link>{t('takeoff.b737Formula')}</b>
              </li>
              <li>
                <b>{t('takeoff.b727How')}<Link to="/tables/performance-despegue-b727">{t('takeoff.b727Table')}</Link>{t('takeoff.b727Explanation')}</b>
              </li>
              <li>{t('takeoff.roundingExplanation')}</li>
            </ul>
          </div>
        </Disclosure>
      </div>
    </>
  );
}
