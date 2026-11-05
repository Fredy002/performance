import { Mountain } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { InfoTip } from '@/components/ui/InfoTip';
import { NumberField, numberError } from '@/components/ui/NumberField';
import { PageHeader } from '@/components/ui/PageHeader';
import { ResultHero } from '@/components/ui/ResultHero';
import { ToolActions } from '@/components/ToolActions';
import { atmosphereReport, TROPOPAUSE_FT } from '@/core/atmosphere';
import { formatNumber } from '@/core/format';
import { useFormValues } from '@/hooks/useFormValues';
import { useDecimals } from '@/state/settings';
import { useI18n } from '@/i18n';

const DEFAULTS = { elev: '5000', qnh: '1013', oat: '30' };

export default function DensityAltitude() {
  const form = useFormValues(DEFAULTS);
  const { elev, qnh, oat } = form.numbers;
  const valid = [elev, qnh, oat].every(Number.isFinite) && qnh > 0;
  const r = valid ? atmosphereReport(elev, qnh, oat) : undefined;
  const decimals = useDecimals();
  const { locale, t } = useI18n();
  const numberLocale = locale === 'en' ? 'en-US' : 'es-ES';
  // las altitudes se muestran en pies enteros; el resto usa los decimales de Ajustes
  const ft = (v: number) => formatNumber(Math.round(v), 0, numberLocale);
  const d = (v: number) => formatNumber(v, decimals, numberLocale);

  return (
    <>
      <PageHeader
        eyebrow={<><Mountain size={14} /> {t('density.eyebrow')}</>}
        title={t('density.title')}
        subtitle={t('density.subtitle')}
        actions={
          <ToolActions
            toolId="density-altitude"
            href={form.href}
            canSave={!!r}
            summary={`${t('density.elevation')} ${ft(elev)} ft · QNH ${formatNumber(qnh, 1, numberLocale)} hPa · OAT ${formatNumber(oat, 1, numberLocale)} °C`}
            result={r ? `DA ${ft(r.densityAltitude)} ft` : ''}
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
          <Card title={t('calc.conditions')}>
            <div className="stack gap-16">
              <NumberField label={t('density.elevation')} value={form.values.elev} onChange={(v) => form.set('elev', v)} unit="ft" help={t('help.elevation')} error={numberError(form.values.elev, elev, t('help.invalidNumber'))} hint={t('density.exampleElevation')} />
              <NumberField label={t('density.qnh')} value={form.values.qnh} onChange={(v) => form.set('qnh', v)} unit="hPa" help={t('help.qnh')} error={numberError(form.values.qnh, qnh, t('help.invalidNumber')) ?? (Number.isFinite(qnh) && qnh <= 0 ? t('density.qnhRangeError') : undefined)} hint={t('density.qnhHint')} />
              <NumberField label={t('density.oat')} value={form.values.oat} onChange={(v) => form.set('oat', v)} unit="°C" help={t('help.oat')} error={numberError(form.values.oat, oat, t('help.invalidNumber'))} hint={t('density.temperatureHint')} />
            </div>
          </Card>
          {!valid && <Alert kind="info">{t('density.complete')}</Alert>}
          {r && r.pressureAltitude > TROPOPAUSE_FT && (
            <Alert kind="warning">{t('density.tropopause')}</Alert>
          )}
        </div>

        {r && (
          <div className="stack">
            <ResultHero
              label={t('density.label')}
              value={ft(r.densityAltitude)}
              unit="ft"
              meta={[
                { label: t('density.quickRule'), value: `${ft(r.densityAltitudeApprox)} ft` },
                { label: t('density.sigma'), value: d(r.densityRatio) },
              ]}
            />
            {r.densityAltitude - r.pressureAltitude > 2000 && (
              <Alert kind="warning">{t('density.highWarning')}</Alert>
            )}
            <Card title={t('density.detail')}>
              <div className="kv">
                <div className="k">{t('density.pressure')}</div>
                <div className="v">{ft(r.pressureAltitude)} ft</div>
                <div className="k">{t('density.isaTemp')}</div>
                <div className="v">{d(r.isaTemp)} °C</div>
                <div className="k">{t('density.isaDeviation')}</div>
                <div className="v">
                  ISA {r.isaDeviation >= 0 ? '+' : '−'}
                  {d(Math.abs(r.isaDeviation))} °C
                </div>
                <div className="k">{t('density.staticPressure')}</div>
                <div className="v">{d(r.staticPressure)} hPa</div>
                <div className="k with-help">{t('density.relativeDensity')}<InfoTip label="σ">{t('help.sigma')}</InfoTip></div>
                <div className="v">{d(r.densityRatio * 100)} %</div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
