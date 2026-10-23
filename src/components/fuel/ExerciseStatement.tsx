import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { findAirport } from '@/data/airports';
import { getTable } from '@/data/tables';
import type { FuelPlanExercise } from '@/exercises/registry';

export function ExerciseStatement({ exercise, title = 'Enunciado' }: { exercise: FuelPlanExercise; title?: ReactNode }) {
  return (
    <Card title={title}>
      <ul className="statement">
        {exercise.statement.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <p className="muted" style={{ marginTop: 10, fontSize: 13 }}>
        Aeropuertos:{' '}
        {(['origin', 'destination', 'alternate'] as const)
          .map((role) => {
            const code = exercise.airports[role];
            const a = findAirport(code);
            return `${code}${a ? ` (${a.city})` : ''}`;
          })
          .join(' · ')}
      </p>
      <p style={{ marginTop: 14, fontWeight: 600, fontSize: 14 }}>Se pide:</p>
      <ul className="statement" style={{ fontSize: 14, marginTop: 4 }}>
        {exercise.questions.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ul>
      <div style={{ marginTop: 14 }}>
        <Alert kind="info">
          {exercise.assumptions.map((a) => (
            <p key={a} style={{ marginBottom: 4 }}>
              {a}
            </p>
          ))}
        </Alert>
      </div>
      <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>
        Tablas usadas:{' '}
        {exercise.tables.map((id, i) => (
          <span key={id}>
            {i > 0 && ' · '}
            <Link to={`/tables/${id}`}>{getTable(id)?.title ?? id}</Link>
          </span>
        ))}
      </p>
    </Card>
  );
}
