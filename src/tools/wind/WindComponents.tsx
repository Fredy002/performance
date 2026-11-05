import { Wind } from 'lucide-react';
import { useId } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { InfoTip } from '@/components/ui/InfoTip';
import { NumberField, numberError } from '@/components/ui/NumberField';
import { PageHeader } from '@/components/ui/PageHeader';
import { ResultHero } from '@/components/ui/ResultHero';
import { ToolActions } from '@/components/ToolActions';
import { formatNumber, parseNumber } from '@/core/format';
import { runwayToHeading, windComponents, type WindComponents as WC } from '@/core/wind';
import { useFormValues } from '@/hooks/useFormValues';
import { useDecimals } from '@/state/settings';
import { useI18n, type MessageKey } from '@/i18n';

const DEFAULTS = { rwy: '27', dir: '300', spd: '18', limit: '15' };

function WindDiagram({ heading, w, dir, locale, t }: { heading: number; w: WC; dir: number; locale: string; t: (key: MessageKey, values?: Record<string, string | number>) => string }) {
  const size = 260;
  const c = size / 2;
  const R = 100;
  const toXY = (deg: number, r: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [c + r * Math.cos(rad), c + r * Math.sin(rad)];
  };
  const [wx, wy] = toXY(dir, R + 6);
  const [ix, iy] = toXY(dir, 40);
  const markerId = useId().replace(/:/g, '');
  const numberLocale = locale === 'en' ? 'en-US' : 'es-ES';
  return (
    <svg className="chart chart-compass" viewBox={`0 0 ${size} ${size}`} role="img"
      aria-label={t('wind.runwayWindAria', { runway: formatNumber(heading, 0, numberLocale), direction: formatNumber(dir, 0, numberLocale) })}>
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--result)" />
        </marker>
      </defs>
      <circle cx={c} cy={c} r={R} fill="none" stroke="var(--chart-grid)" strokeWidth={1.5} />
      {Array.from({ length: 36 }, (_, i) => {
        const [x1, y1] = toXY(i * 10, R);
        const [x2, y2] = toXY(i * 10, i % 9 === 0 ? R - 12 : R - 6);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--border-strong)" />;
      })}
      {['N', 'E', 'S', 'W'].map((l, i) => {
        const [x, y] = toXY(i * 90, R - 22);
        return <text key={l} x={x} y={y + 4} textAnchor="middle" className="chart-compass-label">{l}</text>;
      })}
      <g transform={`rotate(${heading} ${c} ${c})`}>
        <rect x={c - 11} y={c - 70} width={22} height={140} rx={3} fill="var(--text)" />
        <line x1={c} y1={c - 60} x2={c} y2={c + 60} stroke="var(--bg-elevated)" strokeDasharray="8 7" strokeWidth={2} />
      </g>
      <line x1={wx} y1={wy} x2={ix} y2={iy} stroke="var(--result)" strokeWidth={3} markerEnd={`url(#${markerId})`} />
      <text x={c} y={size - 4} textAnchor="middle">
        {w.headwind >= 0 ? t('wind.head') : t('wind.tail')} {formatNumber(Math.abs(w.headwind), 0, numberLocale)} kt · {t('wind.crosswind')} {formatNumber(Math.abs(w.crosswind), 0, numberLocale)} kt
      </text>
    </svg>
  );
}

export default function WindComponents() {
  const decimals = useDecimals();
  const { locale, t } = useI18n();
  const numberLocale = locale === 'en' ? 'en-US' : 'es-ES';
  const form = useFormValues(DEFAULTS);
  const heading = runwayToHeading(form.values.rwy);
  const dir = parseNumber(form.values.dir);
  const spd = parseNumber(form.values.spd);
  const limit = parseNumber(form.values.limit);
  const rwyInvalid = !!form.values.rwy.trim() && !Number.isFinite(heading);
  const valid = Number.isFinite(heading) && Number.isFinite(dir) && Number.isFinite(spd) && spd >= 0;
  const w = valid ? windComponents(heading, dir, spd) : undefined;
  const kt = (v: number) => formatNumber(Math.abs(v), decimals, numberLocale);

  return (
    <>
      <PageHeader
        eyebrow={<><Wind size={14} /> {t('wind.eyebrow')}</>}
        title={t('wind.title')}
        subtitle={t('wind.subtitle')}
        actions={
          <ToolActions
            toolId="wind"
            href={form.href}
            canSave={!!w}
            summary={`${t('wind.runway')} ${form.values.rwy} · ${t('wind.summaryWind')} ${Number.isFinite(dir) ? formatNumber(dir, decimals, numberLocale) : form.values.dir}/${Number.isFinite(spd) ? formatNumber(spd, decimals, numberLocale) : form.values.spd} kt`}
            result={w ? `${w.headwind >= 0 ? 'HW' : 'TW'} ${kt(w.headwind)} · XW ${kt(w.crosswind)} kt` : ''}
            onReset={form.reset}
            capture={() => {
              const prev = form.values;
              return () => form.load(prev);
            }}
          />
        }
      />
      <div className="grid grid-calc">
        <div className="stack">
          <Card title={t('calc.data')}>
            <div className="grid grid-2">
              <div className="field">
                <span className="field-label-row">
                  <label className="field-label" htmlFor="rwy">{t('wind.runway')}</label>
                  <InfoTip label={t('wind.runway')}>{t('help.runway')}</InfoTip>
                </span>
                <div className={`field-control${rwyInvalid ? ' invalid' : ''}`}>
                  <span className="field-tag" aria-hidden="true">RWY</span>
                  <input id="rwy" value={form.values.rwy} onChange={(e) => form.set('rwy', e.target.value)} placeholder={t('wind.runwayPlaceholder')} aria-invalid={rwyInvalid || undefined} aria-describedby="rwy-msg" />
                </div>
                <span id="rwy-msg" className={`field-hint${rwyInvalid ? ' field-error' : ''}`}>
                  {rwyInvalid ? t('wind.runwayError') : t('wind.runwayHint')}
                </span>
              </div>
              <NumberField label={t('wind.direction')} value={form.values.dir} onChange={(v) => form.set('dir', v)} unit="°" help={t('help.windDirection')} error={numberError(form.values.dir, dir, t('help.invalidNumber'))} hint="300" />
              <NumberField label={t('wind.speed')} value={form.values.spd} onChange={(v) => form.set('spd', v)} unit="kt" error={numberError(form.values.spd, spd, t('help.invalidNumber')) ?? (spd < 0 ? t('wind.speedError') : undefined)} hint="18" />
              <NumberField label={t('wind.crosswindLimit')} value={form.values.limit} onChange={(v) => form.set('limit', v)} unit="kt" help={t('help.crosswindLimit')} error={numberError(form.values.limit, limit, t('help.invalidNumber'))} hint={t('wind.optional')} />
            </div>
          </Card>
          {!valid && <Alert kind="info">{t('wind.complete')}</Alert>}
          {w && Number.isFinite(limit) && Math.abs(w.crosswind) > limit && (
            <Alert kind="error">{t('wind.crosswindExceeded', { crosswind: kt(w.crosswind), limit: formatNumber(limit, 0, numberLocale) })}</Alert>
          )}
          {w && w.headwind < 0 && <Alert kind="warning">{t('wind.tailwindWarning', { speed: kt(w.headwind) })}</Alert>}
          {w && (
            <ResultHero
              label={w.headwind >= 0 ? t('wind.headwind') : t('wind.tailwind')}
              value={kt(w.headwind)}
              unit="kt"
              meta={[
                { label: t('wind.crosswindFrom', { side: w.crosswind >= 0 ? t('wind.right') : t('wind.left') }), value: `${kt(w.crosswind)} kt` },
                { label: t('wind.angle'), value: `${formatNumber(Math.abs(w.angle), 0, numberLocale)}°` },
              ]}
            />
          )}
        </div>
        <Card title={t('wind.diagram')}>
          {w ? <WindDiagram heading={heading} w={w} dir={dir} locale={locale} t={t} /> : <div className="empty"><Wind size={32} aria-hidden="true" />{t('wind.diagramWaiting')}</div>}
          <p className="calc-caption">
            {t('wind.calculationCaption')}
          </p>
        </Card>
      </div>
    </>
  );
}
