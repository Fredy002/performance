import { ArrowRight, Spline } from 'lucide-react';
import { useMemo } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { InfoTip } from '@/components/ui/InfoTip';
import { NumberField, numberError } from '@/components/ui/NumberField';
import { PageHeader } from '@/components/ui/PageHeader';
import { ResultHero } from '@/components/ui/ResultHero';
import { InterpolationChart } from '@/components/InterpolationChart';
import { ToolActions } from '@/components/ToolActions';
import { formatNumber } from '@/core/format';
import { InterpolationError, linearInterpolate, type LinearResult } from '@/core/interpolation';
import { useFormValues } from '@/hooks/useFormValues';
import { useSettings } from '@/state/settings';
import { useI18n } from '@/i18n';

/** La tarjeta «Gráfica» (con su explicación) está oculta; cambia a true para volver a mostrarla. */
const SHOW_CHART = false;

const DEFAULTS = { a: '600', b: '650', c: '622', a1: '89', b1: '96', xn: '', yn: '' };

const PRESETS: { name: string; values: typeof DEFAULTS }[] = [
  { name: 'Ejemplo de referencia', values: DEFAULTS },
  {
    name: 'Distancia de despegue vs. peso',
    values: { a: '2000', b: '2200', c: '2130', a1: '410', b1: '495', xn: 'Peso (kg)', yn: 'Distancia (m)' },
  },
  {
    name: 'Régimen de ascenso vs. altitud',
    values: { a: '4000', b: '6000', c: '5300', a1: '720', b1: '610', xn: 'Altitud (ft)', yn: 'Ascenso (ft/min)' },
  },
];

export default function LinearInterpolation() {
  const { decimals } = useSettings();
  const { locale, t } = useI18n();
  const numberLocale = locale === 'en' ? 'en-US' : 'es-ES';
  const form = useFormValues(DEFAULTS);
  const { a, b, c, a1, b1 } = form.numbers;
  const fmt = (v: number) => formatNumber(v, decimals, numberLocale);

  const incomplete = [a, b, c, a1, b1].some((v) => Number.isNaN(v));
  // UX-03: distingue «vacío» de «mal escrito» y nombra el campo a corregir
  const err = (k: 'a' | 'b' | 'c' | 'a1' | 'b1') => numberError(form.values[k], form.numbers[k], t('help.invalidNumber'));
  const wrong = (['a', 'c', 'b', 'a1', 'b1'] as const).filter((k) => err(k)).map((k) => k.toUpperCase());
  const empty = (['a', 'c', 'b', 'a1', 'b1'] as const).filter((k) => form.values[k].trim() === '').map((k) => k.toUpperCase());

  const outcome = useMemo((): { result?: LinearResult; error?: string } => {
    if (incomplete) return {};
    try {
      return { result: linearInterpolate({ a, b, c, a1, b1 }) };
    } catch (e) {
      return { error: e instanceof InterpolationError ? t(e.message.startsWith('A y B') ? 'linear.error.equal' : 'linear.error.invalid') : t('linear.calculationError') };
    }
  }, [a, b, c, a1, b1, incomplete]);

  const r = outcome.result;
  const xName = form.values.xn || t('linear.input');
  const yName = form.values.yn || t('linear.result');

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <Spline size={14} /> {t('linear.eyebrow')}
          </>
        }
        title={t('linear.title')}
        subtitle={t('linear.subtitle')}
        actions={
          <ToolActions
            toolId="linear"
            href={form.href}
            canSave={!!r}
            summary={`${xName} ${fmt(c)} ${t('linear.summaryBetween')} ${fmt(a)}→${fmt(a1)} ${t('linear.summaryAnd')} ${fmt(b)}→${fmt(b1)}`}
            result={r ? `${fmt(r.x)}${form.values.yn ? ` · ${form.values.yn}` : ''}` : ''}
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
        <div className="stack">
          <Card
            title={t('linear.tableData')}
            action={
              <select
                className="select select-compact"
                aria-label={t('linear.loadExample')}
                value=""
                onChange={(e) => {
                  const i = Number(e.target.value);
                  const p = PRESETS[i];
                  if (p) {
                    const axisNames = i === 1
                      ? { xn: t('linear.preset.takeoffX'), yn: t('linear.preset.takeoffY') }
                      : i === 2
                        ? { xn: t('linear.preset.climbX'), yn: t('linear.preset.climbY') }
                        : { xn: '', yn: '' };
                    form.load({ ...p.values, ...axisNames });
                  }
                }}
              >
                <option value="" disabled>
                  {t('calc.loadExample')}
                </option>
                {PRESETS.map((p, i) => (
                  <option key={p.name} value={i}>
                    {t(i === 0 ? 'linear.preset.reference' : i === 1 ? 'linear.preset.takeoff' : 'linear.preset.climb')}
                  </option>
                ))}
              </select>
            }
          >
            <div className="interp-table">
              <span className="interp-head with-help">
                {xName}
                <InfoTip label={t('linear.tip.inputLabel')}>{t('help.linearInput')}</InfoTip>
              </span>
              <span />
              <span className="interp-head with-help">
                {yName}
                <InfoTip label={t('linear.tip.resultLabel')}>{t('help.linearResult')}</InfoTip>
              </span>

              <NumberField tag={t('linear.fieldA')} srLabel={t('linear.sr.a')} value={form.values.a} onChange={(v) => form.set('a', v)} error={err('a')} />
              <span className="interp-arrow" aria-hidden="true"><ArrowRight size={20} /></span>
              <NumberField tag={t('linear.fieldA1')} srLabel={t('linear.sr.a1')} value={form.values.a1} onChange={(v) => form.set('a1', v)} error={err('a1')} />

              <NumberField tag={t('linear.fieldC')} srLabel={t('linear.sr.c')} value={form.values.c} onChange={(v) => form.set('c', v)} error={err('c')} />
              <span className="interp-arrow" aria-hidden="true"><ArrowRight size={20} /></span>
              <div className="field">
                <div className="field-control">
                  <span className="field-tag result" aria-hidden="true">X</span>
                  <output className="result-output" aria-label={t('linear.output', { value: r ? fmt(r.x) : t('linear.uncalculated') })}>{r ? fmt(r.x) : '—'}</output>
                </div>
              </div>

              <NumberField tag={t('linear.fieldB')} srLabel={t('linear.sr.b')} value={form.values.b} onChange={(v) => form.set('b', v)} error={err('b')} />
              <span className="interp-arrow" aria-hidden="true"><ArrowRight size={20} /></span>
              <NumberField tag={t('linear.fieldB1')} srLabel={t('linear.sr.b1')} value={form.values.b1} onChange={(v) => form.set('b1', v)} error={err('b1')} />
            </div>

            <details className="calc-details">
              <summary>
                {t('linear.variableNames')}
              </summary>
              <div className="grid grid-2">
                <div className="field">
                  <label className="field-label" htmlFor="xn">{t('linear.inputVariable')}</label>
                  <div className="field-control">
                    <input id="xn" placeholder={t('linear.inputPlaceholder')} value={form.values.xn} onChange={(e) => form.set('xn', e.target.value)} />
                  </div>
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="yn">{t('linear.resultVariable')}</label>
                  <div className="field-control">
                    <input id="yn" placeholder={t('linear.resultPlaceholder')} value={form.values.yn} onChange={(e) => form.set('yn', e.target.value)} />
                  </div>
                </div>
              </div>
            </details>
          </Card>

          {outcome.error && <Alert kind="error">{outcome.error}</Alert>}
          {wrong.length > 0 && (
            <Alert kind="error">
              {t('linear.check', { fields: wrong.join(', '), error: t('help.invalidNumber').charAt(0).toLowerCase() + t('help.invalidNumber').slice(1) })}
            </Alert>
          )}
          {incomplete && !outcome.error && wrong.length === 0 && (
            <Alert kind="info">{t('linear.complete', { fields: empty.join(', ') })}</Alert>
          )}
          {r?.extrapolated && (
            <Alert kind="warning">
              <b>{t('linear.extrapolation')}</b> {t('linear.extrapolationWarning')}
            </Alert>
          )}

          {r && (
            <ResultHero
              label={`X · ${yName}`}
              value={fmt(r.x)}
              meta={[
                { label: t('linear.intervalPosition'), value: `${formatNumber(r.ratio * 100, 1, numberLocale)} %` },
                { label: t('linear.slope'), value: formatNumber(r.slope, 4, numberLocale) },
              ]}
            />
          )}
        </div>

        <div className="stack">
          {SHOW_CHART && (
          <Card title={t('linear.graph')}>
            {r ? (
              <div className="stack gap-16">
                {/* cómo leer la gráfica, con los nombres de las variables si el usuario los escribió */}
                <div className="help-block chart-help">
                  <ul>
                    <li>
                      {t('linear.chartAxisInput', {
                        label: form.values.xn ? `«${xName}»` : t('linear.chartInput'),
                        result: form.values.yn ? `«${yName}»` : t('linear.chartOutput'),
                      })}
                    </li>
                    <li>
                      {t('linear.chartEndpoints')}
                    </li>
                    <li>
                      {t('linear.chartRead', { c: fmt(c), x: fmt(r.x) })}
                    </li>
                    <li>
                      {t('linear.chartExtrapolation')}
                    </li>
                  </ul>
                </div>
                <InterpolationChart a={a} b={b} c={c} a1={a1} b1={b1} x={r.x} decimals={decimals} xLabel={xName} yLabel={yName} />
              </div>
            ) : (
              <div className="empty">
                <Spline size={32} aria-hidden="true" />
                <span>{t('linear.chartWaiting')}</span>
              </div>
            )}
          </Card>
          )}

          <Card title={t('linear.formula')}>
            <div className="formula" aria-label="X = A1 + (B1 − A1)(C − A) / (B − A)">
              <span>X = A1 +</span>
              <span className="frac">
                <span>(B1 − A1)(C − A)</span>
                <span>(B − A)</span>
              </span>
            </div>
            {r && (
              <ol className="steps">
                <li>
                  <span className="mono">
                    X = {fmt(a1)} + ({fmt(b1)} − {fmt(a1)})({fmt(c)} − {fmt(a)}) / ({fmt(b)} − {fmt(a)})
                  </span>
                </li>
                <li>
                  <span className="mono">
                    X = {fmt(a1)} + ({fmt(b1 - a1)} × {fmt(c - a)}) / {fmt(b - a)}
                  </span>
                </li>
                <li>
                  <span className="mono">
                    X = {fmt(a1)} + {fmt((b1 - a1) * (c - a))} / {fmt(b - a)} = {fmt(a1)} + {fmt(r.x - a1)}
                  </span>
                </li>
                <li>
                  <span className="mono step-result">
                    X = {fmt(r.x)}
                  </span>
                </li>
              </ol>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
