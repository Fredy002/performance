import { ChevronRight, Monitor, Moon, Search, Sun } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { CATEGORIES, getTool } from '@/tools/registry';
import { getTable } from '@/data/tables';
import { getExercise } from '@/exercises/registry';
import { updateSettings, useSettings, type ThemePref } from '@/state/settings';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Inicio',
  '/history': 'Historial',
  '/settings': 'Ajustes',
  '/tables': 'Tablas de performance de aeronaves',
  '/pruebas': 'Pruebas',
};

const NEXT_THEME: Record<ThemePref, ThemePref> = { system: 'light', light: 'dark', dark: 'system' };
const THEME_LABEL: Record<ThemePref, string> = { system: 'Tema del sistema', light: 'Tema claro', dark: 'Tema oscuro' };

export function Topbar({ onSearch }: { onSearch: () => void }) {
  const { pathname } = useLocation();
  const { theme } = useSettings();
  const tool = pathname.startsWith('/tools/') ? getTool(pathname.split('/')[2]) : undefined;
  const table = pathname.startsWith('/tables/') ? getTable(pathname.split('/')[2]) : undefined;
  const exercise = pathname.startsWith('/pruebas/') ? getExercise(pathname.split('/')[2]) : undefined;
  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
  const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);

  return (
    <header className="topbar">
      <nav className="breadcrumbs" aria-label="Ruta">
        {tool ? (
          <>
            <Link to="/" className="breadcrumb-link desktop-only">
              Inicio
            </Link>
            <ChevronRight size={14} className="desktop-only" aria-hidden="true" />
            <span className="breadcrumb-text desktop-only">{CATEGORIES[tool.category]}</span>
            <ChevronRight size={14} className="desktop-only" aria-hidden="true" />
            <strong aria-current="page">{tool.name}</strong>
          </>
        ) : exercise ? (
          <>
            <Link to="/pruebas" className="breadcrumb-link desktop-only">
              Pruebas
            </Link>
            <ChevronRight size={14} className="desktop-only" aria-hidden="true" />
            <strong aria-current="page">{exercise.title}</strong>
          </>
        ) : table ? (
          <>
            <Link to="/tables" className="breadcrumb-link desktop-only">
              Tablas
            </Link>
            <ChevronRight size={14} className="desktop-only" aria-hidden="true" />
            <strong aria-current="page">{table.title}</strong>
          </>
        ) : (
          <strong>{PAGE_TITLES[pathname] ?? 'AeroPerf'}</strong>
        )}
      </nav>
      <div className="topbar-spacer" />
      <button className="search-trigger" onClick={onSearch} title="Busca herramientas, tablas y ejercicios">
        <Search size={16} aria-hidden="true" />
        <span>Buscar…</span>
        <kbd aria-hidden="true">{isMac ? '⌘' : 'Ctrl'} K</kbd>
      </button>
      <button
        className="btn btn-ghost btn-icon"
        onClick={() => updateSettings({ theme: NEXT_THEME[theme] })}
        aria-label={`${THEME_LABEL[theme]}. Cambiar a ${THEME_LABEL[NEXT_THEME[theme]].toLowerCase()}`}
        title={`${THEME_LABEL[theme]}. Pulsa para cambiar a ${THEME_LABEL[NEXT_THEME[theme]].toLowerCase()}`}
      >
        <ThemeIcon size={18} aria-hidden="true" />
      </button>
    </header>
  );
}
