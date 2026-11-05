import { ClipboardCheck, RotateCcw, Table } from 'lucide-react';
import { useMemo } from 'react';
import { ExerciseStatement } from '@/components/fuel/ExerciseStatement';
import { checkSteps, ExerciseValidation, StatusChip } from '@/components/fuel/ExerciseValidation';
import { sameEprForm, toEprForm, useTakeoffEpr, type EprCase } from '@/components/takeoff/eprForm';
import { TakeoffEprForm } from '@/components/takeoff/TakeoffEprForm';
import { B737EprAnswers, B737EprSteps, TakeoffEprAnswers, TakeoffEprSteps } from '@/components/takeoff/TakeoffEprResults';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { solveTakeoffEpr } from '@/core/takeoffEpr';
import { solveB737TakeoffEpr } from '@/core/takeoffEprB737';
import type { TakeoffEprExercise } from '@/exercises/registry';
import { useFormValues } from '@/hooks/useFormValues';
import { useDecimals } from '@/state/settings';

/** Prueba de EPR de despegue: la app resuelve el escenario y lo compara con la resolución manual. */
export function TakeoffEprExerciseView({ exercise }: { exercise: TakeoffEprExercise }) {
  const decimals = useDecimals();
  const defaults = useMemo(() => toEprForm({ aircraft: exercise.aircraftId, input: exercise.input } as EprCase), [exercise]);
  const form = useFormValues(defaults);
  const plan = useTakeoffEpr(form.values);
  const isOriginal = sameEprForm(form.values, defaults);
  // la validación usa siempre los datos del enunciado
  const checks = useMemo(
    () =>
      exercise.aircraftId === 'b737'
        ? checkSteps(exercise.expected, solveB737TakeoffEpr(exercise.input))
        : checkSteps(exercise.expected, solveTakeoffEpr(exercise.input)),
    [exercise],
  );
  const footer = (key: string) => {
    const c = checks.find((x) => x.step.answer === key);
    return (
      isOriginal &&
      c && (
        <div className="row answer-footer">
          <span className="answer-footer-text">Resolución: {c.step.written}</span>
          <StatusChip status={c.cmp.status} diff={c.cmp.diff} />
        </div>
      )
    );
  };

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <ClipboardCheck size={14} /> Pruebas · {exercise.aircraft} · condiciones {exercise.scenario}
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
      <div className="page-badges">
        <span className="chip chip-warning">Pendiente de verificación</span>
      </div>

      <div className="grid grid-calc">
        <ExerciseStatement exercise={exercise} />
        {plan.aircraft === 'b737' ? <B737EprAnswers result={plan.result} footer={footer} /> : <TakeoffEprAnswers result={plan.result} footer={footer} />}
      </div>

      <div className="calc-section">
        <Card title="Datos">
          <TakeoffEprForm values={form.values} set={form.set} />
        </Card>
      </div>

      {plan.error && (
        <div className="calc-section-sm">
          <Alert kind="error">{plan.error}</Alert>
        </div>
      )}

      {plan.result && (
        <>
          <h2 className="section-title">Desarrollo</h2>
          {plan.aircraft === 'b737' ? (
            <B737EprSteps result={plan.result} input={plan.input} decimals={decimals} />
          ) : (
            <TakeoffEprSteps result={plan.result} input={plan.input} decimals={decimals} />
          )}
        </>
      )}

      <h2 className="section-title">Validación con la resolución manual</h2>
      {!isOriginal ? (
        <Alert kind="info">
          Has cambiado los datos del enunciado: la validación solo se aplica a los datos originales.{' '}
          <button className="btn btn-sm alert-action" onClick={form.reset}>
            Restaurar enunciado
          </button>
        </Alert>
      ) : (
        <ExerciseValidation exercise={exercise} checks={checks} decimals={decimals} />
      )}

      <p className="calc-footnote row">
        <Table size={14} /> Los valores salen de las tablas digitalizadas (figuras {exercise.aircraftId === 'b737' ? '53, 54 y 55' : '81, 82 y 83'}) y del
        mismo núcleo de cálculo que usa la herramienta EPR de despegue.
      </p>
    </>
  );
}
