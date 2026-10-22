import { CircleAlert, CircleCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatPlain } from '@/core/format';
import type { FuelPlanResult } from '@/core/fuelPlanning';
import type { FuelPlanExercise } from '@/exercises/registry';
import { compareWithWritten, type Comparison, type MatchStatus } from '@/exercises/validation';

const STATUS: Record<MatchStatus, { label: string; icon: typeof CircleCheck }> = {
  match: { label: 'Coincide', icon: CircleCheck },
  rounding: { label: 'Redondeo', icon: CircleCheck },
  mismatch: { label: 'No coincide', icon: CircleAlert },
};

export function StatusChip({ status, diff }: { status: MatchStatus; diff?: number }) {
  const S = STATUS[status];
  return (
    <span className={`status status-${status}`} title={S.label}>
      <S.icon size={13} />
      <span className="status-text">
        {S.label}
        {status !== 'match' && diff !== undefined && ` (Δ ${formatPlain(Math.abs(diff), 3)})`}
      </span>
    </span>
  );
}

export interface ExerciseCheck {
  step: FuelPlanExercise['expected'][number];
  cmp: Comparison;
}

export function checkExercise(exercise: FuelPlanExercise, r: FuelPlanResult): ExerciseCheck[] {
  return exercise.expected.map((step) => ({ step, cmp: compareWithWritten(step.written, step.pick(r)) }));
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
export function ExerciseValidation({ exercise, checks, decimals }: { exercise: FuelPlanExercise; checks: ExerciseCheck[]; decimals: number }) {
  const s = summarize(checks);
  return (
    <Card
      flush
      title={s.mismatch === 0 ? `${s.total}/${s.total} pasos coinciden` : `${s.mismatch} de ${s.total} pasos no coinciden`}
      action={
        <span className="row" style={{ gap: 6 }}>
          <span className="status status-match">{s.match} exactos</span>
          {s.rounding > 0 && <span className="status status-rounding">{s.rounding} por redondeo</span>}
          {s.mismatch > 0 && <span className="status status-mismatch">{s.mismatch} distintos</span>}
        </span>
      }
    >
      <div style={{ padding: '8px 22px 12px', fontSize: 14 }} className="muted">
        <p>
          «Coincide»: el valor de la app redondeado a los decimales de la resolución es idéntico. «Redondeo»: difiere en
          menos de 0,05 por redondeos intermedios.
        </p>
        {exercise.remarks.length > 0 && (
          <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
            {exercise.remarks.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="data-table-wrap">
        <table className="data-table validation-table">
          <thead>
            <tr>
              <th>Paso</th>
              <th>Resolución</th>
              <th>App</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {checks.map(({ step, cmp }) => (
              <tr key={step.label} className={step.answer ? 'is-answer' : undefined}>
                <td style={{ fontFamily: 'var(--font-sans)' }}>
                  {step.answer && `${step.answer}) `}
                  {step.label}
                </td>
                <td>
                  {step.written} {step.unit}
                </td>
                <td>
                  {/* al menos tantos decimales como la resolución, para que se pueda comparar */}
                  {formatPlain(cmp.actual, Math.max(decimals, cmp.decimals))} {step.unit}
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
