import { BadgeCheck, Fuel, PenLine } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { checkExercise, ExerciseValidation, summarize } from '@/components/fuel/ExerciseValidation';
import { FuelPlanAnswers } from '@/components/fuel/FuelPlanAnswers';
import { FuelPlanForm } from '@/components/fuel/FuelPlanForm';
import { FuelPlanSteps } from '@/components/fuel/FuelPlanSteps';
import {
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
import { analyzeStatement } from '@/exercises/parseStatement';
import { SCOPES, verifiedExercises, type FuelPlanExercise } from '@/exercises/registry';
import { useFormValues } from '@/hooks/useFormValues';
import { useDecimals } from '@/state/settings';

const SCOPE = SCOPES.nacional;
const SOLVED = verifiedExercises();
// valores de ejemplo: el primer ejercicio verificado
const DEFAULTS = toFuelForm(SOLVED[0].input, SOLVED[0].airports);
// si el enunciado no indica la espera: FL 015 (como en los ejercicios) y el tiempo del ámbito
const STATEMENT_DEFAULTS = { holdingFlightLevel: 15, holdingMinutes: SCOPE.holdingMinutes };

const statementText = (e: FuelPlanExercise) => e.statement.join('\n');
const EXAMPLES = SOLVED.map((e) => ({ id: e.id, label: `${e.airports.origin} – ${e.airports.destination}`, text: statementText(e) }));

/** «SPJC–SPQT»; sin códigos queda vacío */
const legLabel = (a: string, b: string) => (a || b ? `${a || '?'}–${b || '?'}` : '');

export default function FuelPlanning() {
  const decimals = useDecimals();
  const [params] = useSearchParams();
  const form = useFormValues(DEFAULTS);
  const v = form.values;
  const plan = useFuelPlan(v);
  const p = (x: number) => formatPlain(x, decimals);
  const dataRef = useRef<HTMLDetailsElement>(null);

  const solved = SOLVED.find((e) => sameFuelForm(v, toFuelForm(e.input, e.airports)));

  // El enunciado es la entrada principal. Si se llega con datos en la URL (historial,
  // enlace compartido) se muestran esos datos; si coinciden con un ejercicio, su enunciado.
  const [text, setText] = useState(() => {
    const fromUrl = FUEL_FORM_KEYS.some((k) => params.has(k));
    if (!fromUrl) return statementText(SOLVED[0]);
    return solved ? statementText(solved) : '';
  });
  const [source, setSource] = useState<'text' | 'form'>(() => (text ? 'text' : 'form'));

  const report = useMemo(() => (text.trim() ? analyzeStatement(text, STATEMENT_DEFAULTS) : undefined), [text]);

  // con el enunciado completo, los datos se rellenan solos y el ejercicio se resuelve
  useEffect(() => {
    if (source !== 'text' || !report?.complete) return;
    const next = reportToFuelForm(report, STATEMENT_DEFAULTS);
    if (!sameFuelForm(next, form.values)) form.load(next);
  }, [report, source, form]);

  const onText = (t: string) => {
    setText(t);
    setSource('text');
  };
  const setField = (k: FuelFormKey, x: string) => {
    form.set(k, x);
    setSource('form');
  };
  const completeByHand = () => {
    if (report) form.load(reportToFuelForm(report, STATEMENT_DEFAULTS));
    setSource('form');
    if (dataRef.current) {
      dataRef.current.open = true;
      dataRef.current.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    }
  };

  // mientras el enunciado no esté completo no se muestran respuestas de otros datos
  const waiting = source === 'text' && !report?.complete;
  const r = waiting ? undefined : plan.result;
  const route = routeFromForm(v);
  const checks = solved && r ? checkExercise(solved, r) : [];
  const verified = solved && r ? summarize(checks) : undefined;
  const missing = report?.fields.filter((f) => f.required && f.status === 'missing') ?? [];

  const placeholder = waiting ? (
    <div className="answers-placeholder">
      {text.trim() ? (
        <>
          <span>
            Faltan datos en el enunciado: <b>{missing.map((f) => f.label.toLowerCase()).join(', ')}</b>.
          </span>
          <button className="btn btn-sm" onClick={completeByHand}>
            <PenLine size={15} /> Completar a mano
          </button>
        </>
      ) : (
        <span>Escribe, pega o fotografía el enunciado: aquí aparecen T.T, T.F, FOB y autonomía.</span>
      )}
    </div>
  ) : undefined;

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <Fuel size={14} /> Boeing 737 · {SCOPE.label}
          </>
        }
        title="Planificación de combustible"
        subtitle="Pega el enunciado o toma una foto: la app calcula el tiempo y el combustible de viaje, el combustible a bordo y la autonomía."
        actions={
          <ToolActions
            toolId="fuel"
            href={form.href}
            canSave={!!r}
            summary={`${legLabel(route.origin, route.destination)} ${v.td} NM (${v.tw} kt ${v.tk}) · alterno ${legLabel(route.destination, route.alternate)} ${v.ad} NM (${v.aw} kt ${v.ak}) · espera ${v.hm} min`}
            result={r ? `FOB ${p(r.fobLb)} lb · ${p(r.enduranceMin)} min` : ''}
            onReset={() => onText(statementText(SOLVED[0]))}
          />
        }
      />

      <div className="grid grid-calc">
        <StatementBox text={text} onTextChange={onText} report={report} examples={EXAMPLES} editedByHand={source === 'form' && !!text.trim()} />
        <div id="fuel-answers" className="stack" style={{ scrollMarginTop: 80 }}>
          <FuelPlanAnswers
            result={r}
            error={plan.error}
            decimals={decimals}
            placeholder={placeholder}
            badge={
              solved &&
              r && (
                <span className="status status-match">
                  <BadgeCheck size={13} /> Ejercicio resuelto · {solved.airports.origin} – {solved.airports.destination}
                </span>
              )
            }
          />
          {!waiting && plan.error && <Alert kind="error">{plan.error}</Alert>}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <Disclosure
          ref={dataRef}
          title="Datos"
          meta={
            waiting
              ? 'Pendiente del enunciado'
              : `${[route.origin, route.destination, route.alternate].filter(Boolean).join(' → ')} · ${v.td || '—'} / ${v.ad || '—'} NM · espera ${v.hw || '—'} lb`
          }
          defaultOpen={source === 'form'}
        >
          <FuelPlanForm bare values={v} set={setField} holdingHint={SCOPE.holdingRule} />
        </Disclosure>

        <Disclosure
          title="Desarrollo paso a paso"
          meta={r ? `T.F ${p(r.trip.fuelLb)} · A.F ${p(r.alternate.fuelLb)} · H.F ${p(r.holding.fuelLb)} lb` : undefined}
        >
          {r ? (
            <FuelPlanSteps result={r} input={plan.input} airports={route} decimals={decimals} heading={false} />
          ) : (
            <p className="muted">Aparece cuando hay respuestas.</p>
          )}
        </Disclosure>

        {solved && r && verified && (
          <Disclosure
            title="Validación con la resolución manual"
            meta={<span className={`status status-${verified.mismatch ? 'mismatch' : 'match'}`}>{verified.mismatch ? 'Revisar' : 'Verificado'}</span>}
          >
            <ExerciseValidation exercise={solved} checks={checks} decimals={decimals} />
          </Disclosure>
        )}

        <Disclosure title="Cómo se calcula">
          <div className="help-block">
            <ul>
              <li>
                <b>T.T / T.F</b>: tiempo y combustible de la planificación abreviada para la distancia (interpolando si no es
                una fila exacta), corregidos por viento: Δ = valor × viento ÷ TAS; se suma con viento de cara y se resta con
                viento de cola.
              </li>
              <li>
                <b>A.T / A.F</b>: igual para el tramo destino – alterno.
              </li>
              <li>
                <b>H.F</b>: flujo por motor de la tabla de espera (nivel y peso) × minutos ÷ 60 × 2 motores.
              </li>
              <li>
                <b>FOB</b> = T.F + A.F + H.F + taxi · <b>Autonomía</b> = T.T + A.T + tiempo de espera.
              </li>
              <li>{SCOPE.holdingRule}</li>
            </ul>
          </div>
        </Disclosure>
      </div>
    </>
  );
}
