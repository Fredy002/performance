import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { formatPlain } from '@/core/format';
import type { FuelPlanResult } from '@/core/fuelPlanning';

export const FUEL_ANSWERS: { key: string; label: string; unit: string; pick: (r: FuelPlanResult) => number }[] = [
  { key: 'a', label: 'Tiempo de viaje (T.T)', unit: 'min', pick: (r) => r.trip.timeMin },
  { key: 'b', label: 'Combustible de viaje (T.F)', unit: 'lb', pick: (r) => r.trip.fuelLb },
  { key: 'c', label: 'Combustible a bordo (FOB)', unit: 'lb', pick: (r) => r.fobLb },
  { key: 'd', label: 'Autonomía', unit: 'min', pick: (r) => r.enduranceMin },
];

interface Props {
  result?: FuelPlanResult;
  error?: string;
  decimals: number;
  /** Contenido extra bajo cada respuesta (p. ej. comparación con la resolución manual) */
  footer?: (key: string) => ReactNode;
}

export function FuelPlanAnswers({ result: r, error, decimals, footer }: Props) {
  return (
    <Card title="Respuestas">
      {r ? (
        <>
          <div className="answer-grid">
            {FUEL_ANSWERS.map((a) => (
              <div className="answer" key={a.key}>
                <div className="answer-label">
                  {a.key}) {a.label}
                </div>
                <div className="answer-value">
                  {formatPlain(a.pick(r), decimals)}
                  <small>{a.unit}</small>
                </div>
                {footer?.(a.key)}
              </div>
            ))}
          </div>
          <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>
            Autonomía: {Math.floor(r.enduranceMin / 60)} h {formatPlain(r.enduranceMin % 60, 0)} min.
          </p>
        </>
      ) : (
        <div className="empty">{error ? 'Revisa los datos.' : 'Completa los datos.'}</div>
      )}
    </Card>
  );
}
