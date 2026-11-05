import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { InfoTip } from '@/components/ui/InfoTip';
import { Unit } from '@/components/ui/Unit';
import { formatPlain } from '@/core/format';
import type { FuelPlanResult } from '@/core/fuelPlanning';
import { useI18n, type MessageKey } from '@/i18n';

export const FUEL_ANSWERS: { key: string; label: string; unit: string; help: string; pick: (r: FuelPlanResult) => number }[] = [
  { key: 'a', label: 'fuel.tripTime', unit: 'min', help: 'help.tt', pick: (r) => r.trip.timeMin },
  { key: 'b', label: 'fuel.tripFuel', unit: 'lb', help: 'help.tf', pick: (r) => r.trip.fuelLb },
  { key: 'c', label: 'fuel.fuelOnBoard', unit: 'lb', help: 'help.fob', pick: (r) => r.fobLb },
  { key: 'd', label: 'fuel.endurance', unit: 'min', help: 'help.endurance', pick: (r) => r.enduranceMin },
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

export function localizeFuelPlanError(
  error: string | undefined,
  t: (key: MessageKey, values?: Record<string, string | number>) => string,
  numberLocale: string,
): string | undefined {
  if (!error) return undefined;
  const formatted = (value: string) => {
    const number = Number(value.replace(',', '.'));
    return Number.isFinite(number) ? formatPlain(number, 2, numberLocale) : value;
  };
  if (error === 'La distancia debe ser un número.') return t('fuel.error.distanceNumber');
  if (error === 'Nivel y peso deben ser números.') return t('fuel.error.levelWeightNumbers');
  if (error === 'Error de cálculo') return t('fuel.error.calculation');
  const distance = error.match(/^La distancia ([+-]?\d+(?:\.\d+)?) NM está fuera de la tabla \(([+-]?\d+(?:\.\d+)?)–([+-]?\d+(?:\.\d+)?) NM\)\. No se extrapola\.$/);
  if (distance) return t('fuel.error.distanceRange', { distance: formatted(distance[1]), min: formatted(distance[2]), max: formatted(distance[3]) });
  const level = error.match(/^El nivel FL (\d+) está fuera de la tabla \(FL (\d+)–FL (\d+)\)\.$/);
  if (level) return t('fuel.error.levelRange', { level: formatted(level[1]), min: formatted(level[2]), max: formatted(level[3]) });
  const weight = error.match(/^El peso ([+-]?\d+(?:\.\d+)?) lb está fuera de la tabla \(([+-]?\d+(?:\.\d+)?)–([+-]?\d+(?:\.\d+)?) lb\)\.$/);
  if (weight) return t('fuel.error.weightRange', { weight: formatted(weight[1]), min: formatted(weight[2]), max: formatted(weight[3]) });
  return error;
}

export function FuelPlanAnswers({ result: r, error, decimals, footer, badge, placeholder }: Props) {
  const { locale, t } = useI18n();
  const numberLocale = locale === 'en' ? 'en-US' : 'es-ES';
  return (
    <Card title={t('calc.answers')} action={badge}>
      {r ? (
        <>
          <div className="answer-grid">
            {FUEL_ANSWERS.map((a) => (
              <div className="answer" key={a.key}>
                <div className="answer-label">
                  {a.key}) {t(a.label as MessageKey)} <InfoTip label={t(a.label as MessageKey)}>{t(a.help as MessageKey)}</InfoTip>
                </div>
                <div className="answer-value">
                  {formatPlain(a.pick(r), decimals, numberLocale)}
                  <small>
                    <Unit symbol={a.unit} />
                  </small>
                </div>
                {footer?.(a.key)}
              </div>
            ))}
          </div>
          <p className="calc-note">
            {t('fuel.enduranceSummary', { hours: Math.floor(r.enduranceMin / 60), minutes: formatPlain(r.enduranceMin % 60, 0, numberLocale) })}
            {r.contingency.pct > 0 && (
              <>
                {' '}{t('fuel.internationalSummary', { percent: formatPlain(r.contingency.pct * 100, 0, numberLocale), fuel: formatPlain(r.contingency.fuelLb, decimals, numberLocale), time: formatPlain(r.contingency.timeMin, decimals, numberLocale) })}
              </>
            )}
          </p>
        </>
      ) : (
        (placeholder ?? <div className="empty">{error ? t('calc.reviewData') : t('calc.completeData')}</div>)
      )}
    </Card>
  );
}
