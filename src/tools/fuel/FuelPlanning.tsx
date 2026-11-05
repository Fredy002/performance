import { BadgeCheck, Fuel, PenLine } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { checkExercise, ExerciseValidation, summarize } from '@/components/fuel/ExerciseValidation';
import { FuelPlanAnswers, localizeFuelPlanError } from '@/components/fuel/FuelPlanAnswers';
import { FuelPlanForm } from '@/components/fuel/FuelPlanForm';
import { FuelPlanSteps } from '@/components/fuel/FuelPlanSteps';
import {
  formScope,
  FUEL_FORM_KEYS,
  reportToFuelForm,
  routeFromForm,
  sameFuelForm,
  toFuelForm,
  useFuelPlan,
  type FuelFormKey,
} from '@/components/fuel/fuelForm';
import { StatementBox } from '@/components/fuel/StatementBox';
import { ToolActions } from '@/components/ToolActions';
import { Alert } from '@/components/ui/Alert';
import { Disclosure } from '@/components/ui/Disclosure';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatPlain } from '@/core/format';
import { analyzeParsedStatement, parseStatement, type ParseDefaults, type ParsedStatement } from '@/exercises/parseStatement';
import type { OcrResult } from '@/services/ocr';
import { routeScope, SCOPES, verifiedFuelExercises, type FlightScope, type FuelPlanExercise } from '@/exercises/registry';
import { useFormValues } from '@/hooks/useFormValues';
import { useDecimals } from '@/state/settings';
import { useI18n, type MessageKey } from '@/i18n';

const SOLVED = verifiedFuelExercises();
// Use the first verified exercise as the default example.
const DEFAULTS = toFuelForm(SOLVED[0].input, SOLVED[0].airports);
// Apply the exercise holding level and the scope duration (45 min nacional, 30 min internacional) only when omitted.
const defaultsFor = (scope: FlightScope): ParseDefaults => ({ holdingFlightLevel: 15, holdingMinutes: SCOPES[scope].holdingMinutes });
/** Scope of the statement: international when any of its airports is outside Peru. */
const statementScope = (p: ParsedStatement): FlightScope =>
  routeScope({ origin: p.trip.from ?? '', destination: p.trip.to ?? p.alternate.from ?? '', alternate: p.alternate.to ?? '' });

const statementText = (e: FuelPlanExercise) => e.statement.join('\n');
const EXAMPLES = SOLVED.map((e) => ({ id: e.id, label: `${e.airports.origin} – ${e.airports.destination}`, text: statementText(e) }));

/** Format an airport pair, or return an empty label when both codes are absent. */
const legLabel = (a: string, b: string) => (a || b ? `${a || '?'}–${b || '?'}` : '');
const FIELD_LABELS: Record<string, MessageKey> = {
  td: 'fuel.field.tripDistance', tw: 'fuel.field.tripWind', tfl: 'fuel.field.tripLevel',
  ad: 'fuel.field.alternateDistance', aw: 'fuel.field.alternateWind', afl: 'fuel.field.alternateLevel',
  hw: 'fuel.field.holdingWeight', hfl: 'fuel.field.holdingLevel', hm: 'fuel.field.holdingTime', taxi: 'fuel.field.taxiFuel',
};

export default function FuelPlanning() {
  const decimals = useDecimals();
  const { locale, t } = useI18n();
  const numberLocale = locale === 'en' ? 'en-US' : 'es-ES';
  const [params] = useSearchParams();
  const form = useFormValues(DEFAULTS);
  const v = form.values;
  const plan = useFuelPlan(v, decimals);
  const localizedError = localizeFuelPlanError(plan.error, t, numberLocale);
  const p = (x: number) => formatPlain(x, decimals, numberLocale);
  const dataRef = useRef<HTMLDetailsElement>(null);

  const solved = SOLVED.find((e) => sameFuelForm(v, toFuelForm(e.input, e.airports)));

  // The statement is the primary input. Restore URL data from history or shared links;
  // show a matching exercise statement when one is available.
  const [text, setText] = useState(() => {
    const fromUrl = FUEL_FORM_KEYS.some((k) => params.has(k));
    if (!fromUrl) return statementText(SOLVED[0]);
    return solved ? statementText(solved) : '';
  });
  const [source, setSource] = useState<'text' | 'form'>(() => (text ? 'text' : 'form'));
  const [imageAnalysis, setImageAnalysis] = useState<OcrResult>();
  const [imageStatus, setImageStatus] = useState<'idle' | 'loading' | 'failed'>('idle');
  const [statementRevision, setStatementRevision] = useState(0);

  const { report, textScope } = useMemo(() => {
    const parsed = imageAnalysis ? imageAnalysis.parsed : text.trim() ? parseStatement(text) : undefined;
    if (!parsed) return { report: undefined, textScope: undefined };
    const scope = statementScope(parsed);
    return { report: analyzeParsedStatement(parsed, defaultsFor(scope), imageAnalysis?.warnings), textScope: scope };
  }, [imageAnalysis, text]);

  // Populate the form and calculate once the statement has all required data.
  useEffect(() => {
    if (source !== 'text' || !report?.complete || !textScope) return;
    const next = reportToFuelForm(report, defaultsFor(textScope));
    if (!sameFuelForm(next, form.values)) form.load(next);
  }, [report, textScope, source, form]);

  const onText = (t: string) => {
    setImageStatus('idle');
    setStatementRevision((revision) => revision + 1);
    setText(t);
    setImageAnalysis(undefined);
    setSource('text');
  };
  const onImageAnalysis = (result: OcrResult) => {
    setImageStatus('idle');
    setText(result.text);
    setImageAnalysis(result);
    setSource('text');
  };
  const setField = (k: FuelFormKey, x: string) => {
    setStatementRevision((revision) => revision + 1);
    setImageStatus('idle');
    const next = { ...form.values, [k]: x };
    const [before, after] = [formScope(form.values), formScope(next)];
    // Changing an airport can change the scope: move the holding time to the new rule
    // unless the user typed a different time.
    if (before !== after && Number(form.values.hm) === SCOPES[before].holdingMinutes) {
      form.load({ [k]: x, hm: String(SCOPES[after].holdingMinutes) });
    } else form.set(k, x);
    setSource('form');
  };
  const completeByHand = () => {
    if (report && textScope) form.load(reportToFuelForm(report, defaultsFor(textScope)));
    setSource('form');
    if (dataRef.current) {
      dataRef.current.open = true;
      dataRef.current.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    }
  };

  // Hide earlier answers while an image is pending, has failed, or lacks required data.
  const waiting = imageStatus !== 'idle' || (source === 'text' && !report?.complete);
  const r = waiting ? undefined : plan.result;
  const route = routeFromForm(v);
  const checks = solved && r ? checkExercise(solved) : [];
  const verified = solved && r ? summarize(checks) : undefined;
  const missing = report?.fields.filter((f) => f.required && f.status === 'missing') ?? [];
  const scopeId = source === 'text' && textScope ? textScope : formScope(v);

  const placeholder = waiting ? (
    <div className="answers-placeholder">
      {imageStatus === 'loading' ? (
        <span>{t('fuel.imageLoading')}</span>
      ) : imageStatus === 'failed' ? (
        <span>{t('fuel.imageFailed')}</span>
      ) : text.trim() ? (
        <>
          <span>
            {t('fuel.missingFields', { fields: missing.map((f) => FIELD_LABELS[f.key] ? t(FIELD_LABELS[f.key]) : f.label.toLowerCase()).join(', ') })}
          </span>
          <button className="btn btn-sm" onClick={completeByHand}>
            <PenLine size={15} /> {t('fuel.completeByHand')}
          </button>
        </>
      ) : (
        <span>{t('fuel.writeStatement')}</span>
      )}
    </div>
  ) : undefined;

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
            onReset={() => onText(statementText(SOLVED[0]))}
            capture={() => {
              const prev = { text, values: form.values, source };
              return () => {
                setText(prev.text);
                setImageAnalysis(undefined);
                setImageStatus('idle');
                form.load(prev.values);
                setSource(prev.source);
              };
            }}
          />
        }
      />

      <div className="grid grid-calc">
        <StatementBox text={text} revision={statementRevision} onTextChange={onText} onImageAnalysis={onImageAnalysis} onAnalysisStatusChange={setImageStatus} report={report} examples={EXAMPLES} editedByHand={source === 'form' && !!text.trim()} />
        <div id="fuel-answers" className="stack scroll-anchor">
          <FuelPlanAnswers
            result={r}
            error={localizedError}
            decimals={decimals}
            placeholder={placeholder}
            badge={
              solved &&
              r && (
                <span className="status status-match">
                  <BadgeCheck size={13} /> {t('fuel.answersBadge', { origin: solved.airports.origin, destination: solved.airports.destination })}
                </span>
              )
            }
          />
          {!waiting && localizedError && <Alert kind="error">{localizedError}</Alert>}
        </div>
      </div>

      <div className="calc-section">
        <Disclosure
          ref={dataRef}
          title={t('calc.data')}
          meta={
            waiting
              ? t('fuel.pendingStatement')
              : `${[route.origin, route.destination, route.alternate].filter(Boolean).join(' → ')} · ${p(Number(v.td))} / ${p(Number(v.ad))} NM · ${t('fuel.summaryHolding')} ${p(Number(v.hw))} lb`
          }
          defaultOpen={source === 'form'}
        >
          <FuelPlanForm bare values={v} set={setField} />
        </Disclosure>

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
