import { BadgeCheck, Fuel } from 'lucide-react';
import { checkExercise, ExerciseValidation, summarize } from '@/components/fuel/ExerciseValidation';
import { FuelPlanAnswers, localizeFuelPlanError } from '@/components/fuel/FuelPlanAnswers';
import { FuelPlanForm } from '@/components/fuel/FuelPlanForm';
import { FuelPlanSteps } from '@/components/fuel/FuelPlanSteps';
import { formScope, routeFromForm, sameFuelForm, toFuelForm, useFuelPlan, type FuelFormKey } from '@/components/fuel/fuelForm';
import { ToolActions } from '@/components/ToolActions';
import { Alert } from '@/components/ui/Alert';
import { Disclosure } from '@/components/ui/Disclosure';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatPlain } from '@/core/format';
import { SCOPES, verifiedFuelExercises } from '@/exercises/registry';
import { useFormValues } from '@/hooks/useFormValues';
import { useDecimals } from '@/state/settings';
import { useI18n } from '@/i18n';

const SOLVED = verifiedFuelExercises();
// Use the first verified exercise as the default example.
const DEFAULTS = toFuelForm(SOLVED[0].input, SOLVED[0].airports);
const EXAMPLES = SOLVED.map((e) => ({ id: e.id, label: `${e.airports.origin} – ${e.airports.destination}`, values: toFuelForm(e.input, e.airports) }));

/** Format an airport pair, or return an empty label when both codes are absent. */
const legLabel = (a: string, b: string) => (a || b ? `${a || '?'}–${b || '?'}` : '');
export default function FuelPlanning() {
  const decimals = useDecimals();
  const { locale, t } = useI18n();
  const numberLocale = locale === 'en' ? 'en-US' : 'es-ES';
  const form = useFormValues(DEFAULTS);
  const v = form.values;
  const plan = useFuelPlan(v, decimals);
  const localizedError = localizeFuelPlanError(plan.error, t, numberLocale);
  const p = (x: number) => formatPlain(x, decimals, numberLocale);

  const solved = SOLVED.find((e) => sameFuelForm(v, toFuelForm(e.input, e.airports)));

  // Los datos son la única entrada: el enunciado (texto o foto) se interpreta en Inicio con el
  // asistente, que revisa los datos y abre esta calculadora con ellos en la URL.
  const setField = (k: FuelFormKey, x: string) => {
    const next = { ...form.values, [k]: x };
    const [before, after] = [formScope(form.values), formScope(next)];
    // Changing an airport can change the scope: move the holding time to the new rule
    // unless the user typed a different time.
    if (before !== after && Number(form.values.hm) === SCOPES[before].holdingMinutes) {
      form.load({ [k]: x, hm: String(SCOPES[after].holdingMinutes) });
    } else form.set(k, x);
  };
  const r = plan.result;
  const route = routeFromForm(v);
  const checks = solved && r ? checkExercise(solved) : [];
  const verified = solved && r ? summarize(checks) : undefined;
  const scopeId = formScope(v);

  const exampleSelect = (
    <select
      className="select select-compact"
      aria-label={t('fuel.loadExample')}
      value=""
      onChange={(e) => {
        const ex = EXAMPLES.find((x) => x.id === e.target.value);
        if (ex) form.load(ex.values);
      }}
    >
      <option value="" disabled>
        {t('fuel.loadExample')}
      </option>
      {EXAMPLES.map((ex) => (
        <option key={ex.id} value={ex.id}>
          {ex.label}
        </option>
      ))}
    </select>
  );

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <Fuel size={14} /> Boeing 737 · {t(scopeId === 'nacional' ? 'fuel.scope.domestic' : 'fuel.scope.international')}
          </>
        }
        title={t('fuel.appTitle')}
        subtitle={t('fuel.appSubtitle')}
        actions={
          <ToolActions
            toolId="fuel"
            href={form.href}
            canSave={!!r}
            summary={`${legLabel(route.origin, route.destination)} ${p(Number(v.td))} NM (${p(Number(v.tw))} kt ${v.tk}) · ${t('fuel.summaryOriginAlternate')} ${legLabel(route.destination, route.alternate)} ${p(Number(v.ad))} NM (${p(Number(v.aw))} kt ${v.ak}) · ${t('fuel.summaryHolding')} ${p(Number(v.hm))} min`}
            result={r ? `FOB ${p(r.fobLb)} lb · ${p(r.enduranceMin)} min` : ''}
            onReset={form.reset}
            capture={() => {
              const prev = form.values;
              return () => form.load(prev);
            }}
          />
        }
      />

      <div className="grid grid-calc">
        <FuelPlanForm values={v} set={setField} action={exampleSelect} />
        <div id="fuel-answers" className="stack scroll-anchor">
          <FuelPlanAnswers
            result={r}
            error={localizedError}
            decimals={decimals}
            badge={
              solved &&
              r && (
                <span className="status status-match">
                  <BadgeCheck size={13} /> {t('fuel.answersBadge', { origin: solved.airports.origin, destination: solved.airports.destination })}
                </span>
              )
            }
          />
          {localizedError && <Alert kind="error">{localizedError}</Alert>}
        </div>
      </div>

      <div className="calc-section">
        <Disclosure
          title={t('calc.steps')}
          meta={r ? `T.F ${p(r.trip.fuelLb)} · A.F ${p(r.alternate.fuelLb)} · H.F ${p(r.holding.fuelLb)} lb` : undefined}
        >
          {r ? (
            <FuelPlanSteps result={r} input={plan.input} airports={route} decimals={decimals} heading={false} />
          ) : (
            <p className="calc-text">{t('calc.appearsWhenReady')}</p>
          )}
        </Disclosure>

        {solved && r && verified && (
          <Disclosure
            title={t('exercise.detail.validation')}
            meta={<span className={`status status-${verified.mismatch ? 'mismatch' : 'match'}`}>{verified.mismatch ? t('fuel.validationReview') : t('fuel.validationVerified')}</span>}
          >
            <ExerciseValidation exercise={solved} checks={checks} decimals={decimals} />
          </Disclosure>
        )}

        <Disclosure title={t('calc.howCalculated')}>
          <div className="help-block">
            <ul>
              <li>
                <b>T.T / T.F</b>: {t('fuel.howTrip')}
              </li>
              <li>
                <b>A.T / A.F</b>: {t('fuel.howAlternate')}
              </li>
              <li>
                <b>H.F</b>: {t('fuel.howHolding')}
              </li>
              <li>
                {t('fuel.howTotal')}
              </li>
              <li>
                {t('fuel.howDomestic', { rule: t('fuel.noDomesticRule') })}
              </li>
              <li>
                {t('fuel.howInternational')}
              </li>
            </ul>
          </div>
        </Disclosure>
      </div>
    </>
  );
}
