import { ArrowRight, Fuel, Spline, Table, X, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { localizedToolDescription, localizedToolName, readyTools, toolPath, upcomingTools } from '@/tools/registry';
import { useI18n } from '@/i18n';
import { useHistory } from '@/state/history';
import { updateSettings, useSettings } from '@/state/settings';
import { HistoryList } from './History';

type Tone = 'accent' | 'yellow' | 'mint';

const ACTIONS: { to: string; icon: LucideIcon; tone: Tone; title: 'page.dashboard.action.fuelTitle' | 'page.dashboard.action.interpolateTitle' | 'page.dashboard.action.tablesTitle'; text: 'page.dashboard.action.fuelText' | 'page.dashboard.action.interpolateText' | 'page.dashboard.action.tablesText'; cta: 'page.dashboard.action.fuelCta' | 'page.dashboard.action.interpolateCta' | 'page.dashboard.action.tablesCta' }[] = [
  {
    to: toolPath('fuel'),
    tone: 'accent',
    icon: Fuel,
    title: 'page.dashboard.action.fuelTitle',
    text: 'page.dashboard.action.fuelText',
    cta: 'page.dashboard.action.fuelCta',
  },
  {
    to: toolPath('linear'),
    tone: 'yellow',
    icon: Spline,
    title: 'page.dashboard.action.interpolateTitle',
    text: 'page.dashboard.action.interpolateText',
    cta: 'page.dashboard.action.interpolateCta',
  },
  {
    to: '/tables',
    tone: 'mint',
    icon: Table,
    title: 'page.dashboard.action.tablesTitle',
    text: 'page.dashboard.action.tablesText',
    cta: 'page.dashboard.action.tablesCta',
  },
];

// las tres primeras ya tienen acceso directo arriba
const MAIN = new Set(['fuel', 'linear']);

/** Composición decorativa de formas planas en colores de categoría. */
function HeroArt() {
  return (
    <svg className="home-hero-art" viewBox="0 0 232 152" aria-hidden="true" focusable="false">
      <rect x="0" y="40" width="72" height="72" rx="16" fill="var(--cat-yellow)" />
      <circle cx="124" cy="44" r="36" fill="var(--cat-mint)" />
      <rect x="88" y="88" width="64" height="64" rx="16" fill="var(--cat-ink)" />
      <rect x="168" y="16" width="64" height="64" rx="32" fill="var(--cat-blush)" />
      <rect x="168" y="96" width="56" height="56" rx="16" fill="var(--accent)" />
    </svg>
  );
}

/** UX-05: orientación de primer uso, breve y descartable (se recuerda en Ajustes). */
function Onboarding() {
  const { t } = useI18n();
  return (
    <Card
      className="onboarding"
      title={t('page.dashboard.getStarted')}
      action={
        <button className="btn btn-ghost btn-sm" onClick={() => updateSettings({ onboardingDismissed: true })}>
          <X size={16} aria-hidden="true" /> {t('page.dashboard.dismissOnboarding')}
        </button>
      }
    >
      <ol className="onboarding-steps">
        <li>
          <span>
            <b>{t('page.dashboard.chooseTask')}</b>
            {t('page.dashboard.chooseTaskHint')}
            <span className="desktop-only"> ({typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform) ? '⌘' : 'Ctrl'} K)</span>.
          </span>
        </li>
        <li>
          <span>
            <b>{t('page.dashboard.enterData')}</b>
            {t('page.dashboard.enterDataHint')}
          </span>
        </li>
        <li>
          <span>
            <b>{t('page.dashboard.reviewSave')}</b>
            {t('page.dashboard.reviewSaveHint')}
          </span>
        </li>
      </ol>
      <p className="onboarding-note">{t('page.dashboard.storageNote')}</p>
    </Card>
  );
}

export default function Dashboard() {
  const { locale, t } = useI18n();
  const history = useHistory();
  const { onboardingDismissed } = useSettings();
  const others = readyTools().filter((t) => !MAIN.has(t.id));
  const upcoming = upcomingTools();

  return (
    <>
      <section className="home-hero">
        <div className="home-hero-copy">
          <h1>{t('page.dashboard.heroTitle')}</h1>
          <p>{t('page.dashboard.heroSubtitle')}</p>
        </div>
        <HeroArt />
      </section>

      {!onboardingDismissed && <Onboarding />}

      <div className="action-grid">
        {ACTIONS.map((a) => (
          <Link key={a.to} to={a.to} className="card action-tile">
            <span className={`action-icon tone-${a.tone}`}>
              <a.icon size={20} />
            </span>
            <span className="action-title">{t(a.title)}</span>
            <span className="action-text">{t(a.text)}</span>
            <span className="action-cta">
              {t(a.cta)} <ArrowRight size={16} />
            </span>
          </Link>
        ))}
      </div>

      <div className="grid grid-2 home-columns">
        <section>
          <h2 className="section-title section-title-flush">
            {t('page.dashboard.otherTools')}
          </h2>
          <Card flush>
            <div className="list">
              {others.map((tool) => (
                <Link key={tool.id} to={toolPath(tool.id)} className="list-item">
                  <span className="list-item-icon">
                    <tool.icon size={18} />
                  </span>
                  <span className="list-item-main">
                    <span className="list-item-title">{locale === 'es' ? tool.name : localizedToolName(tool.id, locale)}</span>
                    <span className="list-item-sub">{locale === 'es' ? tool.description : localizedToolDescription(tool.id, locale)}</span>
                  </span>
                  <ArrowRight size={16} className="list-item-arrow" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </Card>
        </section>

        <section>
          <h2 className="section-title section-title-flush">
            {t('page.dashboard.recentActivity')}
            {history.length > 0 && (
              <Link to="/history">{t('page.dashboard.viewAll')}</Link>
            )}
          </h2>
          <Card flush>
            <HistoryList entries={history.slice(0, 5)} compact />
          </Card>
        </section>
      </div>

      {upcoming.length > 0 && (
        <section className="home-upcoming">
          <h2 className="section-title">{t('page.dashboard.upcoming')}</h2>
          <Card flush>
            <div className="list">
              {upcoming.map((tool) => (
                <div key={tool.id} className="list-item upcoming" aria-disabled="true">
                  <span className="list-item-icon">
                    <tool.icon size={18} aria-hidden="true" />
                  </span>
                  <span className="list-item-main">
                    <span className="list-item-title">{locale === 'es' ? tool.name : localizedToolName(tool.id, locale)}</span>
                    <span className="list-item-sub">{locale === 'es' ? tool.description : localizedToolDescription(tool.id, locale)}</span>
                  </span>
                  <span className="chip chip-warning">{t('page.dashboard.soon')}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}
    </>
  );
}
