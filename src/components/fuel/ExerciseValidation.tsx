import { CircleAlert, CircleCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatPlain } from '@/core/format';
import { solveFuelPlan } from '@/core/fuelPlanning';
import type { ExpectedStep, FuelPlanExercise } from '@/exercises/registry';
import { compareWithWritten, type Comparison, type MatchStatus } from '@/exercises/validation';
import { useI18n, type MessageKey } from '@/i18n';

const STATUS: Record<MatchStatus, { label: MessageKey; icon: typeof CircleCheck }> = {
  match: { label: 'exercise.status.match', icon: CircleCheck },
  rounding: { label: 'exercise.status.rounding', icon: CircleCheck },
  mismatch: { label: 'exercise.status.mismatch', icon: CircleAlert },
};

export function StatusChip({ status, diff }: { status: MatchStatus; diff?: number }) {
  const { locale, t } = useI18n();
  const S = STATUS[status];
  return (
    <span className={`status status-${status}`} title={t(S.label)}>
      <S.icon size={13} />
      <span className="status-text">
        {t(S.label)}
        {status !== 'match' && diff !== undefined && ` (Δ ${formatPlain(Math.abs(diff), 3, locale === 'en' ? 'en-US' : 'es-ES')})`}
      </span>
    </span>
  );
}

export interface ExerciseCheck {
  step: Pick<ExpectedStep<never>, 'label' | 'written' | 'unit' | 'answer'>;
  cmp: Comparison;
}

/** Compara cada paso de una resolución con el resultado de la app. */
export function checkSteps<R>(steps: ExpectedStep<R>[], r: R): ExerciseCheck[] {
  return steps.map((step) => ({ step, cmp: compareWithWritten(step.written, step.pick(r)) }));
}

/**
 * Decimales por paso con los que se valida: los de las resoluciones a mano (2), sea cual sea
 * el ajuste de decimales, para que con 0 decimales no aparezcan discrepancias que no existen.
 */
export const VALIDATION_DECIMALS = 2;

export function checkExercise(exercise: FuelPlanExercise): ExerciseCheck[] {
  const r = solveFuelPlan(exercise.input, undefined, { decimals: VALIDATION_DECIMALS });
  return checkSteps(exercise.expected, r);
}

export function summarize(checks: ExerciseCheck[]) {
  return {
    total: checks.length,
    match: checks.filter((c) => c.cmp.status === 'match').length,
    rounding: checks.filter((c) => c.cmp.status === 'rounding').length,
    mismatch: checks.filter((c) => c.cmp.status === 'mismatch').length,
  };
}

/** Tabla paso a paso: valor de la resolución manual frente al valor de la app. */
export function ExerciseValidation({ exercise, checks, decimals }: { exercise: { remarks: string[] }; checks: ExerciseCheck[]; decimals: number }) {
  const { locale, t } = useI18n();
  const s = summarize(checks);
  const numberLocale = locale === 'en' ? 'en-US' : 'es-ES';
  return (
    <Card
      flush
      title={s.mismatch === 0 ? t('exercise.validation.titleMatch', { total: s.total }) : t('exercise.validation.titleMismatch', { count: s.mismatch, total: s.total })}
      action={
        <span className="row">
          <span className="status status-match">{s.match} {t('exercise.status.exact')}</span>
          {s.rounding > 0 && <span className="status status-rounding">{s.rounding} {t('exercise.status.roundingCount')}</span>}
          {s.mismatch > 0 && <span className="status status-mismatch">{s.mismatch} {t('exercise.status.different')}</span>}
        </span>
      }
    >
      <div className="card-inset muted">
        <p>
          {t('exercise.validation.explanation')}
        </p>
        {exercise.remarks.length > 0 && (
          <ul>
            {exercise.remarks.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="data-table-wrap" tabIndex={0} role="region" aria-label={t('exercise.validation.tableAria')}>
        <table className="data-table validation-table">
          <thead>
            <tr>
              <th>{t('exercise.validation.step')}</th>
              <th>{t('exercise.validation.solution')}</th>
              <th>{t('exercise.validation.app')}</th>
              <th>{t('exercise.validation.status')}</th>
            </tr>
          </thead>
          <tbody>
            {checks.map(({ step, cmp }) => (
              <tr key={step.label} className={step.answer ? 'is-answer' : undefined}>
                <td>
                  {step.answer && `${step.answer}) `}
                  {step.label}
                </td>
                <td>
                  {step.written} {step.unit}
                </td>
                <td>
                  {/* al menos tantos decimales como la resolución, para que se pueda comparar */}
                  {formatPlain(cmp.actual, Math.max(decimals, cmp.decimals), numberLocale)} {step.unit}
                </td>
                <td>
                  <StatusChip status={cmp.status} diff={cmp.diff} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
