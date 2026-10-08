import { ChevronRight, Menu, Monitor, Moon, Search, Sun } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { CATEGORIES, getTool } from '@/tools/registry';
import { updateSettings, useSettings, type ThemePref } from '@/state/settings';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Panel',
  '/history': 'Historial',
  '/settings': 'Ajustes',
};

const NEXT_THEME: Record<ThemePref, ThemePref> = { system: 'light', light: 'dark', dark: 'system' };
const THEME_LABEL: Record<ThemePref, string> = { system: 'Tema del sistema', light: 'Tema claro', dark: 'Tema oscuro' };

export function Topbar({ onMenu, onSearch }: { onMenu: () => void; onSearch: () => void }) {
  const { pathname } = useLocation();
  const { theme } = useSettings();
  const tool = pathname.startsWith('/tools/') ? getTool(pathname.split('/')[2]) : undefined;
  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
  const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);

  return (
    <header className="topbar">
      <button className="btn btn-ghost btn-icon mobile-only" onClick={onMenu} aria-label="Abrir menú">
        <Menu size={20} />
      </button>
      <nav className="breadcrumbs" aria-label="Ruta">
        {tool ? (
          <>
            <Link to="/" className="desktop-only" style={{ color: 'inherit' }}>
              {CATEGORIES[tool.category]}
            </Link>
            <ChevronRight size={14} className="desktop-only" />
            <strong>{tool.name}</strong>
          </>
        ) : (
          <strong>{PAGE_TITLES[pathname] ?? 'AeroPerf'}</strong>
        )}
      </nav>
      <div className="topbar-spacer" />
      <button className="search-trigger" onClick={onSearch} aria-label="Buscar herramienta">
        <Search size={16} />
        <span>Buscar herramienta…</span>
        <kbd>{isMac ? '⌘' : 'Ctrl'} K</kbd>
      </button>
      <button
        className="btn btn-ghost btn-icon"
        onClick={() => updateSettings({ theme: NEXT_THEME[theme] })}
        aria-label={`${THEME_LABEL[theme]} (cambiar)`}
        title={THEME_LABEL[theme]}
      >
        <ThemeIcon size={19} />
      </button>
    </header>
  );
}
