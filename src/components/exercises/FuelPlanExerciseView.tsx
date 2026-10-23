import { ClipboardCheck, RotateCcw, Table } from 'lucide-react';
import { useMemo } from 'react';
import { ExerciseStatement } from '@/components/fuel/ExerciseStatement';
import { checkExercise, ExerciseValidation, StatusChip } from '@/components/fuel/ExerciseValidation';
import { FuelPlanAnswers } from '@/components/fuel/FuelPlanAnswers';
import { FuelPlanForm } from '@/components/fuel/FuelPlanForm';
import { FuelPlanSteps } from '@/components/fuel/FuelPlanSteps';
import { routeFromForm, sameFuelForm, toFuelForm, useFuelPlan } from '@/components/fuel/fuelForm';
import { Alert } from '@/components/ui/Alert';
import { PageHeader } from '@/components/ui/PageHeader';
import { SCOPES, type FuelPlanExercise } from '@/exercises/registry';
import { useFormValues } from '@/hooks/useFormValues';
import { useDecimals } from '@/state/settings';

/** Ejercicio pendiente de verificación: la app lo resuelve y lo compara con la resolución manual. */
export function FuelPlanExerciseView({ exercise }: { exercise: FuelPlanExercise }) {
  const decimals = useDecimals();
  const defaults = useMemo(() => toFuelForm(exercise.input, exercise.airports), [exercise]);
  const form = useFormValues(defaults);
  const plan = useFuelPlan(form.values);
  const isOriginal = sameFuelForm(form.values, defaults);
  const r = plan.result;
  const checks = r ? checkExercise(exercise, r) : [];
  const scope = SCOPES[exercise.scope];

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <ClipboardCheck size={14} /> Pruebas · {exercise.aircraft} · {scope.label}
          </>
        }
        title={exercise.title}
        subtitle={exercise.summary}
        actions={
          !isOriginal && (
            <button className="btn" onClick={form.reset}>
              <RotateCcw size={16} /> Restaurar enunciado
            </button>
          )
        }
      />
      <div style={{ marginBottom: 16 }}>
        <span className="chip chip-warning">Pendiente de verificación</span>
      </div>

      <div className="grid grid-calc">
        <ExerciseStatement exercise={exercise} />
        <FuelPlanAnswers
          result={r}
          error={plan.error}
          decimals={decimals}
          footer={(key) => {
            const c = checks.find((x) => x.step.answer === key);
            return (
              isOriginal &&
              c && (
                <div className="row" style={{ marginTop: 6, gap: 6 }}>
                  <span className="muted" style={{ fontSize: 12 }}>
                    Resolución: {c.step.written}
                  </span>
                  <StatusChip status={c.cmp.status} diff={c.cmp.diff} />
                </div>
              )
            );
          }}
        />
      </div>

      <div style={{ marginTop: 20 }} />
      <FuelPlanForm values={form.values} set={form.set} holdingHint={scope.holdingRule} />

      {plan.error && (
        <div style={{ marginTop: 16 }}>
          <Alert kind="error">{plan.error}</Alert>
        </div>
      )}

      {r && <FuelPlanSteps result={r} input={plan.input} airports={routeFromForm(form.values)} decimals={decimals} />}

      <h2 className="section-title">Validación con la resolución manual</h2>
      {!isOriginal ? (
        <Alert kind="info">
          Has cambiado los datos del enunciado: la validación solo se aplica a los datos originales.{' '}
          <button className="btn btn-sm" onClick={form.reset} style={{ marginLeft: 6 }}>
            Restaurar enunciado
          </button>
        </Alert>
      ) : (
        r && <ExerciseValidation exercise={exercise} checks={checks} decimals={decimals} />
      )}

      <p className="muted row" style={{ marginTop: 20, fontSize: 13, gap: 6 }}>
        <Table size={14} /> Los valores salen de las tablas digitalizadas y del mismo núcleo de interpolación que usan las
        calculadoras.
      </p>
    </>
  );
}
