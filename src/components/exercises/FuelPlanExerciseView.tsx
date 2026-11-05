import { ClipboardCheck, RotateCcw, Table } from 'lucide-react';
import { useMemo } from 'react';
import { ExerciseStatement } from '@/components/fuel/ExerciseStatement';
import { checkExercise, ExerciseValidation, StatusChip } from '@/components/fuel/ExerciseValidation';
import { FuelPlanAnswers, localizeFuelPlanError } from '@/components/fuel/FuelPlanAnswers';
import { FuelPlanForm } from '@/components/fuel/FuelPlanForm';
import { FuelPlanSteps } from '@/components/fuel/FuelPlanSteps';
import { routeFromForm, sameFuelForm, toFuelForm, useFuelPlan } from '@/components/fuel/fuelForm';
import { Alert } from '@/components/ui/Alert';
import { PageHeader } from '@/components/ui/PageHeader';
import type { FuelPlanExercise } from '@/exercises/registry';
import { useFormValues } from '@/hooks/useFormValues';
import { useDecimals } from '@/state/settings';
import { useI18n, type MessageKey } from '@/i18n';

/** Ejercicio pendiente de verificación: la app lo resuelve y lo compara con la resolución manual. */
export function FuelPlanExerciseView({ exercise }: { exercise: FuelPlanExercise }) {
  const decimals = useDecimals();
  const { locale, t } = useI18n();
  const numberLocale = locale === 'en' ? 'en-US' : 'es-ES';
  const defaults = useMemo(() => toFuelForm(exercise.input, exercise.airports), [exercise]);
  const form = useFormValues(defaults);
  const plan = useFuelPlan(form.values, decimals);
  const localizedError = localizeFuelPlanError(plan.error, t, numberLocale);
  const isOriginal = sameFuelForm(form.values, defaults);
  const r = plan.result;
  const checks = r ? checkExercise(exercise) : [];

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <ClipboardCheck size={14} /> {t('exercise.list.eyebrow')} · {exercise.aircraft} · {t(exercise.scope === 'nacional' ? 'exercise.scope.national' : 'exercise.scope.international')}
          </>
        }
        title={t(`exercise.${exercise.id}.title` as MessageKey)}
        subtitle={t(`exercise.${exercise.id}.summary` as MessageKey)}
        actions={
          !isOriginal && (
            <button className="btn" onClick={form.reset}>
              <RotateCcw size={16} /> {t('exercise.detail.restore')}
            </button>
          )
        }
      />
      <div className="page-badges">
        <span className="chip chip-warning">{t('exercise.detail.pending')}</span>
      </div>

      <div className="grid grid-calc">
        <ExerciseStatement exercise={exercise} />
        <FuelPlanAnswers
          result={r}
          error={localizedError}
          decimals={decimals}
          footer={(key) => {
            const c = checks.find((x) => x.step.answer === key);
            return (
              isOriginal &&
              c && (
                <div className="row answer-footer">
                  <span className="answer-footer-text">
                    {t('exercise.detail.solution', { value: c.step.written })}
                  </span>
                  <StatusChip status={c.cmp.status} diff={c.cmp.diff} />
                </div>
              )
            );
          }}
        />
      </div>

      <div className="calc-section">
        <FuelPlanForm values={form.values} set={form.set} />
      </div>

      {localizedError && (
        <div className="calc-section-sm">
          <Alert kind="error">{localizedError}</Alert>
        </div>
      )}

      {r && <FuelPlanSteps result={r} input={plan.input} airports={routeFromForm(form.values)} decimals={decimals} />}

      <h2 className="section-title">{t('exercise.detail.validation')}</h2>
      {!isOriginal ? (
        <Alert kind="info">
          {t('exercise.detail.changed')}{' '}
          <button className="btn btn-sm alert-action" onClick={form.reset}>
            {t('exercise.detail.restore')}
          </button>
        </Alert>
      ) : (
        r && <ExerciseValidation exercise={exercise} checks={checks} decimals={decimals} />
      )}

      <p className="calc-footnote row">
        <Table size={14} /> {t('exercise.detail.valuesFromTables')}
      </p>
    </>
  );
}
