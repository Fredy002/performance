import { Grid3x3 } from 'lucide-react';
import { useMemo } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { InfoTip } from '@/components/ui/InfoTip';
import { NumberField, numberError } from '@/components/ui/NumberField';
import { PageHeader } from '@/components/ui/PageHeader';
import { ResultHero } from '@/components/ui/ResultHero';
import { ToolActions } from '@/components/ToolActions';
import { formatNumber } from '@/core/format';
import { bilinearInterpolate, InterpolationError, type BilinearResult } from '@/core/interpolation';
import { useFormValues } from '@/hooks/useFormValues';
import { useSettings } from '@/state/settings';
import { useI18n, type MessageKey } from '@/i18n';

const DEFAULTS = {
  x1: '10', x: '14', x2: '20',
  y1: '2000', y: '3000', y2: '4000',
  q11: '1200', q21: '1290', q12: '1380', q22: '1490',
};

const NUMERIC_KEYS = Object.keys(DEFAULTS) as (keyof typeof DEFAULTS)[];

const TAG: Record<keyof typeof DEFAULTS, string> = {
  x1: 'X1', x: 'X', x2: 'X2', y1: 'Y1', y: 'Y', y2: 'Y2', q11: 'Q11', q21: 'Q21', q12: 'Q12', q22: 'Q22',
};

export default function BilinearInterpolation() {
  const { decimals } = useSettings();
  const { locale, t } = useI18n();
  const numberLocale = locale === 'en' ? 'en-US' : 'es-ES';
  const form = useFormValues(DEFAULTS);
  const n = form.numbers;
  const fmt = (v: number) => formatNumber(v, decimals, numberLocale);

  const incomplete = NUMERIC_KEYS.some((k) => Number.isNaN(n[k]));

  const outcome = useMemo((): { result?: BilinearResult; error?: string } => {
    if (incomplete) return {};
    // mensajes en los términos de esta tabla (X1/X2, Y1/Y2), no los de la lineal
    if (n.x1 === n.x2) return { error: t('bilinear.sameX') };
    if (n.y1 === n.y2) return { error: t('bilinear.sameY') };
    try {
      return { result: bilinearInterpolate(n) };
    } catch (e) {
      return { error: e instanceof InterpolationError ? t(e.message.startsWith('A y B') ? 'linear.error.equal' : 'linear.error.invalid') : t('linear.calculationError') };
    }
  }, [n, incomplete]);

  const r = outcome.result;
  const wrong = NUMERIC_KEYS.filter((k) => numberError(form.values[k], n[k], t('help.invalidNumber'))).map((k) => TAG[k]);
  // UX-01: cada celda con sigla visible y nombre accesible descriptivo
  const field = (k: keyof typeof DEFAULTS) => (
    <NumberField
      tag={TAG[k]}
      srLabel={`${TAG[k]}, ${t(`bilinear.description.${k}` as MessageKey)}`}
      value={form.values[k]}
      onChange={(v) => form.set(k, v)}
      invalid={!!numberError(form.values[k], n[k], t('help.invalidNumber'))}
    />
  );
  const output = (label: string, v: number | undefined, strong = false) => (
    <div className="field-control">
      <span className="field-tag result" aria-hidden="true">{label}</span>
      <output className={`result-output${strong ? '' : ' is-secondary'}`} aria-label={t('bilinear.resultAria', { label, value: v === undefined ? t('linear.uncalculated') : fmt(v) })}>
        {v === undefined ? '—' : fmt(v)}
      </output>
    </div>
  );

  return (
    <>
      <PageHeader
        eyebrow={<><Grid3x3 size={14} /> {t('linear.eyebrow')}</>}
        title={t('bilinear.title')}
        subtitle={t('bilinear.subtitle')}
        actions={
          <ToolActions
            toolId="bilinear"
            href={form.href}
            canSave={!!r}
            summary={`X=${fmt(n.x)} [${fmt(n.x1)}–${fmt(n.x2)}], Y=${fmt(n.y)} [${fmt(n.y1)}–${fmt(n.y2)}]`}
            result={r ? fmt(r.value) : ''}
            onReset={form.reset}
            onClear={form.clear}
            capture={() => {
              const prev = form.values;
              return () => form.load(prev);
            }}
          />
        }
      />

      <div className="grid grid-calc">
        <Card title={t('bilinear.table')}>
          <div className="table-wrap" tabIndex={0} role="region" aria-label={t('bilinear.scrollRegion')}>
            <table className="matrix">
              <thead>
                <tr>
                  <th scope="col">
                    <span className="matrix-axis">
                      Y \ X <InfoTip label={t('bilinear.axesLabel')}>{t('help.bilinearAxes')}</InfoTip>
                    </span>
                  </th>
                  <th scope="col">{t('bilinear.lower')}</th>
                  <th scope="col">{t('bilinear.sought')}</th>
                  <th scope="col">{t('bilinear.upper')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row"><span className="sr-only">{t('bilinear.columnsX')}</span></th>
                  <td>{field('x1')}</td>
                  <td>{field('x')}</td>
                  <td>{field('x2')}</td>
                </tr>
                <tr>
                  <td>{field('y1')}</td>
                  <td>{field('q11')}</td>
                  <td>{output('R1', r?.r1)}</td>
                  <td>{field('q21')}</td>
                </tr>
                <tr>
                  <td>{field('y')}</td>
                  <td />
                  <td>{output('X', r?.value, true)}</td>
                  <td />
                </tr>
                <tr>
                  <td>{field('y2')}</td>
                  <td>{field('q12')}</td>
                  <td>{output('R2', r?.r2)}</td>
                  <td>{field('q22')}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="calc-caption with-help">
            {t('bilinear.cellsCaption')} <InfoTip label={t('bilinear.cellsLabel')}>{t('help.bilinearCells')}</InfoTip>
          </p>
          <p className="calc-caption">
            {t('bilinear.example')}
          </p>
        </Card>

        <div className="stack">
          {outcome.error && <Alert kind="error">{outcome.error}</Alert>}
          {wrong.length > 0 && (
            <Alert kind="error">
              {t('linear.check', { fields: wrong.join(', '), error: t('help.invalidNumber').charAt(0).toLowerCase() + t('help.invalidNumber').slice(1) })}
            </Alert>
          )}
          {incomplete && !outcome.error && wrong.length === 0 && (
            <Alert kind="info">{t('bilinear.complete')}</Alert>
          )}
          {r?.extrapolated && (
            <Alert kind="warning">
              <b>{t('bilinear.extrapolation')}</b> {t('bilinear.outOfRange')}
            </Alert>
          )}
          {r && (
            <ResultHero
              label={t('bilinear.result')}
              value={fmt(r.value)}
              meta={[
                { label: 'R1 (fila Y1)', value: fmt(r.r1) },
                { label: 'R2 (fila Y2)', value: fmt(r.r2) },
              ]}
            />
          )}
          <Card title={t('bilinear.steps')}>
            <ol className="steps">
              <li>
                <div>
                  <div>{t('bilinear.rowX')}</div>
                  <span className="mono muted">
                    R1 = Q11 + (Q21 − Q11)(X − X1)/(X2 − X1){r && ` = ${fmt(r.r1)}`}
                  </span>
                </div>
              </li>
              <li>
                <div>
                  <div>{t('bilinear.rowX2')}</div>
                  <span className="mono muted">
                    R2 = Q12 + (Q22 − Q12)(X − X1)/(X2 − X1){r && ` = ${fmt(r.r2)}`}
                  </span>
                </div>
              </li>
              <li>
                <div>
                  <div>{t('bilinear.betweenRows')}</div>
                  <span className="mono muted">
                    {t('bilinear.valueTerm')} = R1 + (R2 − R1)(Y − Y1)/(Y2 − Y1){r && ` = ${fmt(r.value)}`}
                  </span>
                </div>
              </li>
            </ol>
          </Card>
        </div>
      </div>
    </>
  );
}
