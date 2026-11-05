import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { InfoTip } from '@/components/ui/InfoTip';
import { Unit } from '@/components/ui/Unit';
import { HELP } from '@/content/help';
import { formatPlain } from '@/core/format';
import type { FuelPlanResult } from '@/core/fuelPlanning';

export const FUEL_ANSWERS: { key: string; label: string; unit: string; help: string; pick: (r: FuelPlanResult) => number }[] = [
  { key: 'a', label: 'Tiempo de viaje (T.T)', unit: 'min', help: HELP.tt, pick: (r) => r.trip.timeMin },
  { key: 'b', label: 'Combustible de viaje (T.F)', unit: 'lb', help: HELP.tf, pick: (r) => r.trip.fuelLb },
  { key: 'c', label: 'Combustible a bordo (FOB)', unit: 'lb', help: HELP.fob, pick: (r) => r.fobLb },
  { key: 'd', label: 'Autonomía', unit: 'min', help: HELP.endurance, pick: (r) => r.enduranceMin },
];

interface Props {
  result?: FuelPlanResult;
  error?: string;
  decimals: number;
  /** Contenido extra bajo cada respuesta (p. ej. comparación con la resolución manual) */
  footer?: (key: string) => ReactNode;
  /** Distintivo junto al título (p. ej. «Ejercicio resuelto») */
  badge?: ReactNode;
  /** Qué mostrar mientras no hay resultado */
  placeholder?: ReactNode;
}

export function FuelPlanAnswers({ result: r, error, decimals, footer, badge, placeholder }: Props) {
  return (
    <Card title="Respuestas" action={badge}>
      {r ? (
        <>
          <div className="answer-grid">
            {FUEL_ANSWERS.map((a) => (
              <div className="answer" key={a.key}>
                <div className="answer-label">
                  {a.key}) {a.label} <InfoTip label={a.label}>{a.help}</InfoTip>
                </div>
                <div className="answer-value">
                  {formatPlain(a.pick(r), decimals)}
                  <small>
                    <Unit symbol={a.unit} />
                  </small>
                </div>
                {footer?.(a.key)}
              </div>
            ))}
          </div>
          <p className="calc-note">
            Autonomía: {Math.floor(r.enduranceMin / 60)} h {formatPlain(r.enduranceMin % 60, 0)} min.
            {r.contingency.pct > 0 && (
              <>
                {' '}Vuelo internacional: FOB y autonomía incluyen el {formatPlain(r.contingency.pct * 100, 0)} % de T.F (
                {formatPlain(r.contingency.fuelLb, decimals)} lb) y de T.T ({formatPlain(r.contingency.timeMin, decimals)} min).
              </>
            )}
          </p>
        </>
      ) : (
        (placeholder ?? <div className="empty">{error ? 'Revisa los datos.' : 'Completa los datos.'}</div>)
      )}
    </Card>
  );
}
