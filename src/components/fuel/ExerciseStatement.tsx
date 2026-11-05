import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { findAirport } from '@/data/airports';
import { getTable } from '@/data/tables';
import { getTableDisplay } from '@/data/tables/localization';
import type { Exercise } from '@/exercises/registry';
import { useI18n } from '@/i18n';

export function ExerciseStatement({ exercise, title }: { exercise: Exercise; title?: ReactNode }) {
  const { locale, t } = useI18n();
  return (
    <Card title={title ?? t('exercise.statement')}>
      <ul className="statement">
        {exercise.statement.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      {exercise.kind === 'fuel-plan' && <p className="calc-note">
        {t('exercise.airports')}{' '}
        {(['origin', 'destination', 'alternate'] as const)
          .map((role) => {
            const code = exercise.airports[role];
            const a = findAirport(code);
            return `${code}${a ? ` (${a.city})` : ''}`;
          })
          .join(' · ')}
      </p>}
      <p className="statement-heading">{t('exercise.asks')}</p>
      <ul className="statement statement-sm">
        {exercise.questions.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ul>
      <div className="statement-block assumptions">
        <Alert kind="info">
          {exercise.assumptions.map((a) => (
            <p key={a}>
              {a}
            </p>
          ))}
        </Alert>
      </div>
      <p className="calc-note">
        {t('exercise.tablesUsed')}{' '}
        {exercise.tables.map((id, i) => {
          const table = getTable(id);
          return (
            <span key={id}>
              {i > 0 && ' · '}
              <Link to={`/tables/${id}`}>{table ? getTableDisplay(table, locale).title : id}</Link>
            </span>
          );
        })}
      </p>
    </Card>
  );
}
