import { ChevronRight, Monitor, Moon, Search, Sun } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getTool } from '@/tools/registry';
import { getTable } from '@/data/tables';
import { getTableDisplay } from '@/data/tables/localization';
import { getExercise } from '@/exercises/registry';
import { useI18n } from '@/i18n';
import { updateSettings, useSettings, type ThemePref } from '@/state/settings';

const PAGE_TITLE_KEYS: Record<string, 'common.home' | 'common.history' | 'common.settings' | 'common.tableNavigation' | 'common.exercises'> = {
  '/': 'common.home',
  '/history': 'common.history',
  '/settings': 'common.settings',
  '/tables': 'common.tableNavigation',
  '/pruebas': 'common.exercises',
};

const NEXT_THEME: Record<ThemePref, ThemePref> = { system: 'light', light: 'dark', dark: 'system' };
const THEME_LABEL_KEYS: Record<ThemePref, 'common.theme.system' | 'common.theme.light' | 'common.theme.dark'> = {
  system: 'common.theme.system',
  light: 'common.theme.light',
  dark: 'common.theme.dark',
};

export function Topbar({ onSearch }: { onSearch: () => void }) {
  const { pathname } = useLocation();
  const { theme, locale } = useSettings();
  const { t, setLocale } = useI18n();
  const tool = pathname.startsWith('/tools/') ? getTool(pathname.split('/')[2]) : undefined;
  const table = pathname.startsWith('/tables/') ? getTable(pathname.split('/')[2]) : undefined;
  const exercise = pathname.startsWith('/pruebas/') ? getExercise(pathname.split('/')[2]) : undefined;
  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
  const toolName = tool ? t(`tool.${tool.id}.name`) : '';
  const categoryName = tool ? t(`category.${tool.category}`) : '';
  const themeLabel = t(THEME_LABEL_KEYS[theme]);
  const nextThemeLabel = t(THEME_LABEL_KEYS[NEXT_THEME[theme]]).toLowerCase();
  const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);

  return (
    <header className="topbar">
      <nav className="breadcrumbs" aria-label={t('common.breadcrumb')}>
        {tool ? (
          <>
            <Link to="/" className="breadcrumb-link desktop-only">
              {t('common.home')}
            </Link>
            <ChevronRight size={14} className="desktop-only" aria-hidden="true" />
            {/* Avoid repeating the category when it matches the tool name. */}
            {categoryName !== toolName && (
              <>
                <span className="breadcrumb-text desktop-only">{categoryName}</span>
                <ChevronRight size={14} className="desktop-only" aria-hidden="true" />
              </>
            )}
            <strong aria-current="page">{toolName}</strong>
          </>
        ) : exercise ? (
          <>
            <Link to="/pruebas" className="breadcrumb-link desktop-only">
              {t('common.exercises')}
            </Link>
            <ChevronRight size={14} className="desktop-only" aria-hidden="true" />
            <strong aria-current="page">{t(`exercise.${exercise.id}.title`)}</strong>
          </>
        ) : table ? (
          <>
            <Link to="/tables" className="breadcrumb-link desktop-only">
              {t('common.tables')}
            </Link>
            <ChevronRight size={14} className="desktop-only" aria-hidden="true" />
            <strong aria-current="page">{getTableDisplay(table, locale).title}</strong>
          </>
        ) : (
          <strong>{PAGE_TITLE_KEYS[pathname] ? t(PAGE_TITLE_KEYS[pathname]) : 'AeroPerf'}</strong>
        )}
      </nav>
      <div className="topbar-spacer" />
      <button className="search-trigger" onClick={onSearch} title={t('common.searchHint')}>
        <Search size={16} aria-hidden="true" />
        <span>{t('common.searchEllipsis')}</span>
        <kbd aria-hidden="true">{isMac ? '⌘' : 'Ctrl'} K</kbd>
      </button>
      <label className="sr-only" htmlFor="language-select">
        {t('common.languageSelect')}
      </label>
      <select
        id="language-select"
        className="language-select"
        value={locale}
        onChange={(event) => {
          const value = event.currentTarget.value;
          if (value === 'es' || value === 'en') setLocale(value);
        }}
        aria-label={t('common.languageSelect')}
        title={t('common.language')}
      >
        <option value="es">ES</option>
        <option value="en">EN</option>
      </select>
      <button
        className="btn btn-ghost btn-icon"
        onClick={() => updateSettings({ theme: NEXT_THEME[theme] })}
        aria-label={`${themeLabel}. ${t('common.theme.changeTo', { theme: nextThemeLabel })}`}
        title={`${themeLabel}. ${t('common.theme.pressToChange', { theme: nextThemeLabel })}`}
      >
        <ThemeIcon size={18} aria-hidden="true" />
      </button>
    </header>
  );
}
