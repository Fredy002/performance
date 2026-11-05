import { Monitor, Moon, Sun } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { InfoTip } from '@/components/ui/InfoTip';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatNumber } from '@/core/format';
import { useI18n } from '@/i18n';
import { updateSettings, useSettings, type ThemePref } from '@/state/settings';

const THEMES: { id: ThemePref; key: 'common.theme.system' | 'common.theme.light' | 'common.theme.dark'; icon: typeof Sun }[] = [
  { id: 'system', key: 'common.theme.system', icon: Monitor },
  { id: 'light', key: 'common.theme.light', icon: Sun },
  { id: 'dark', key: 'common.theme.dark', icon: Moon },
];

export default function SettingsPage() {
  const { locale, t } = useI18n();
  const { theme, decimals } = useSettings();
  const decimalCountKey = decimals === 1 ? 'page.settings.decimalCountOne' : 'page.settings.decimalCount';
  const decimalCountAriaKey = decimals === 1 ? 'page.settings.decimalCountAriaOne' : 'page.settings.decimalCountAria';
  return (
    <>
      <PageHeader title={t('page.settings.title')} subtitle={t('page.settings.subtitle')} />
      <div className="grid grid-2">
        <Card title={t('page.settings.appearance')}>
          <p className="field-hint settings-label">{t('page.settings.systemThemeHint')}</p>
          <div className="segmented" role="group" aria-label={t('page.settings.theme')}>
            {THEMES.map((themeOption) => (
              <button key={themeOption.id} aria-pressed={theme === themeOption.id} onClick={() => updateSettings({ theme: themeOption.id })}>
                <themeOption.icon size={15} /> {t(themeOption.key)}
              </button>
            ))}
          </div>
        </Card>
        <Card title={t('page.settings.precision')}>
          <span className="field-label-row settings-label">
            <label className="field-label" htmlFor="decimals">
              {t('page.settings.decimalLabel')}
            </label>
            <InfoTip label={t('page.settings.decimalHelpLabel')}>{t('page.settings.decimalHelp')}</InfoTip>
          </span>
          <div className="row">
            <input
              id="decimals"
              type="range"
              min={0}
              max={6}
              value={decimals}
              onChange={(e) => updateSettings({ decimals: Number(e.target.value) })}
              aria-label={t('page.settings.decimalLabel')}
              aria-valuetext={t(decimalCountAriaKey, { count: decimals })}
              className="settings-range"
            />
            <span className="chip chip-accent">{t(decimalCountKey, { count: decimals })}</span>
          </div>
          <p className="field-hint settings-hint">
            {t('page.settings.preview')} <span className="mono">{formatNumber(92.0812345, decimals, locale === 'en' ? 'en-US' : 'es-ES')}</span>
          </p>
          <p className="field-hint settings-hint">{t('page.settings.precisionHint')}</p>
        </Card>
      </div>
    </>
  );
}
