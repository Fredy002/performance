import { ClipboardCheck, RotateCcw, Table } from 'lucide-react';
import { useMemo } from 'react';
import { sameClimbForm, toClimbForm, useEnRouteClimb } from '@/components/climb/climbForm';
import { ClimbAnswers, ClimbForm, ClimbSteps } from '@/components/climb/ClimbViews';
import { ExerciseStatement } from '@/components/fuel/ExerciseStatement';
import { checkSteps, ExerciseValidation, StatusChip, VALIDATION_DECIMALS } from '@/components/fuel/ExerciseValidation';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { solveEnRouteClimb } from '@/core/enRouteClimb';
import type { ClimbExercise } from '@/exercises/registry';
import { useFormValues } from '@/hooks/useFormValues';
import { useDecimals } from '@/state/settings';

/** Prueba de ascenso en ruta: la app resuelve el escenario y lo compara con la resolución manual. */
export function ClimbExerciseView({ exercise }: { exercise: ClimbExercise }) {
  const decimals = useDecimals();
  const defaults = useMemo(() => toClimbForm(exercise.input), [exercise]);
  const form = useFormValues(defaults);
  const plan = useEnRouteClimb(form.values, decimals);
  const isOriginal = sameClimbForm(form.values, defaults);
  // la validación usa los datos del enunciado con 2 decimales por paso, como las resoluciones a mano
  const checks = useMemo(() => checkSteps(exercise.expected, solveEnRouteClimb(exercise.input, { decimals: VALIDATION_DECIMALS })), [exercise]);
  const answer = checks.find((c) => c.step.answer === 'a');

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
        <ClimbAnswers
          result={plan.result}
          decimals={decimals}
          footer={(key) =>
            isOriginal &&
            answer &&
            key === exercise.asks && (
              <div className="row answer-footer">
                <span className="answer-footer-text">Resolución: {answer.step.written}</span>
                <StatusChip status={answer.cmp.status} diff={answer.cmp.diff} />
              </div>
            )
          }
        />
      </div>

      <div className="calc-section">
        <Card title="Datos">
          <ClimbForm values={form.values} set={form.set} />
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
          <ClimbSteps result={plan.result} input={plan.input} decimals={decimals} />
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
        <Table size={14} /> Los valores salen de las tablas digitalizadas (figuras 56, 57 y 58) y del mismo núcleo de cálculo que usa la
        herramienta Ascenso en ruta.
      </p>
    </>
  );
}
