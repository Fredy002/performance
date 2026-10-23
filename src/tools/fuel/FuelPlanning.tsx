import { BadgeCheck, Fuel, Info } from 'lucide-react';
import { ExerciseStatement } from '@/components/fuel/ExerciseStatement';
import { checkExercise, ExerciseValidation, summarize } from '@/components/fuel/ExerciseValidation';
import { FuelPlanAnswers } from '@/components/fuel/FuelPlanAnswers';
import { FuelPlanForm } from '@/components/fuel/FuelPlanForm';
import { FuelPlanSteps } from '@/components/fuel/FuelPlanSteps';
import { routeFromForm, sameFuelForm, toFuelForm, useFuelPlan } from '@/components/fuel/fuelForm';
import { ToolActions } from '@/components/ToolActions';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatPlain } from '@/core/format';
import { SCOPES, verifiedExercises } from '@/exercises/registry';
import { useFormValues } from '@/hooks/useFormValues';
import { useDecimals } from '@/state/settings';

const SCOPE = SCOPES.nacional;
const SOLVED = verifiedExercises();
// valores de ejemplo: el primer ejercicio verificado
const DEFAULTS = toFuelForm(SOLVED[0].input, SOLVED[0].airports);

/** «SPJC–SPQT»; sin códigos queda vacío */
const legLabel = (a: string, b: string) => (a || b ? `${a || '?'}–${b || '?'}` : '');

export default function FuelPlanning() {
  const decimals = useDecimals();
  const form = useFormValues(DEFAULTS);
  const plan = useFuelPlan(form.values);
  const r = plan.result;
  const p = (v: number) => formatPlain(v, decimals);
  const v = form.values;

  const route = routeFromForm(v);
  const solved = SOLVED.find((e) => sameFuelForm(v, toFuelForm(e.input, e.airports)));
  const checks = solved && r ? checkExercise(solved, r) : [];
  const verified = solved && summarize(checks);

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <Fuel size={14} /> Performance de aeronaves · Boeing 737 · {SCOPE.label}
          </>
        }
        title="Planificación de combustible"
        subtitle="Combustible y tiempo de viaje, alterno, espera y taxi: combustible a bordo (FOB) y autonomía, con las tablas de planificación abreviada y de espera del B737."
        actions={
          <ToolActions
            toolId="fuel"
            href={form.href}
            canSave={!!r}
            summary={`${legLabel(route.origin, route.destination)} ${v.td} NM (${v.tw} kt ${v.tk}) · alterno ${legLabel(route.destination, route.alternate)} ${v.ad} NM (${v.aw} kt ${v.ak}) · espera ${v.hm} min`}
            result={r ? `FOB ${p(r.fobLb)} lb · ${p(r.enduranceMin)} min` : ''}
            onReset={form.reset}
          />
        }
      />

      <FuelPlanForm
        values={v}
        set={form.set}
        holdingHint={SCOPE.holdingRule}
        action={
          <select
            className="select"
            style={{ flex: '0 1 320px' }}
            aria-label="Cargar ejercicio resuelto"
            value=""
            onChange={(e) => {
              const ex = SOLVED.find((x) => x.id === e.target.value);
              if (ex) form.load(toFuelForm(ex.input, ex.airports));
            }}
          >
            <option value="" disabled>
              Cargar ejercicio resuelto…
            </option>
            {SOLVED.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title}
              </option>
            ))}
          </select>
        }
      />

      {plan.error && (
        <div style={{ marginTop: 16 }}>
          <Alert kind="error">{plan.error}</Alert>
        </div>
      )}

      <div className="grid grid-calc" style={{ marginTop: 20 }}>
        <FuelPlanAnswers result={r} error={plan.error} decimals={decimals} />
        {solved ? (
          <ExerciseStatement
            exercise={solved}
            title={
              <span className="row" style={{ gap: 8 }}>
                <BadgeCheck size={17} style={{ color: 'var(--success)' }} /> Ejercicio resuelto · {solved.airports.origin} – {solved.airports.destination}
              </span>
            }
          />
        ) : (
          <Card title={<span className="row" style={{ gap: 8 }}><Info size={17} /> Cómo se calcula</span>}>
            <div className="help-block">
              <ul>
                <li>
                  <b>T.T / T.F</b>: tiempo y combustible de la planificación abreviada para la distancia (interpolando si no
                  es una fila exacta), corregidos por viento: Δ = valor × viento ÷ TAS; se suma con viento de cara y se resta
                  con viento de cola.
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
          </Card>
        )}
      </div>

      {r && <FuelPlanSteps result={r} input={plan.input} airports={route} decimals={decimals} />}

      {solved && r && verified && (
        <>
          <h2 className="section-title">
            Validación con la resolución manual
            <span className={`status status-${verified.mismatch ? 'mismatch' : 'match'}`}>
              {verified.mismatch ? 'Revisar' : 'Verificado'}
            </span>
          </h2>
          <ExerciseValidation exercise={solved} checks={checks} decimals={decimals} />
        </>
      )}
    </>
  );
}
