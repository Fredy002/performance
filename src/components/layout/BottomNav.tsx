import { Fuel, House, Menu, Spline, Table, type LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { localizedToolShortName } from '@/tools/registry';

type NavItem =
  | { kind: 'fixed'; to: string; label: 'common.home' | 'common.tables' | 'common.interpolate'; icon: LucideIcon; end?: boolean }
  | { kind: 'tool'; to: string; toolId: string; icon: LucideIcon; end?: boolean };

const ITEMS: NavItem[] = [
  { kind: 'fixed', to: '/', label: 'common.home', icon: House, end: true },
  { kind: 'tool', to: '/tools/fuel', toolId: 'fuel', icon: Fuel },
  { kind: 'fixed', to: '/tools/linear', label: 'common.interpolate', icon: Spline },
  { kind: 'fixed', to: '/tables', label: 'common.tables', icon: Table },
];

/** Navegación del móvil: lo más usado a un toque del pulgar; el resto, en «Más». */
export function BottomNav({ onMenu, menuOpen }: { onMenu: () => void; menuOpen: boolean }) {
  const { locale, t } = useI18n();
  return (
    <nav className="bottom-nav mobile-only" aria-label={t('common.quickLinks')}>
      {ITEMS.map((it) => (
        <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
          <it.icon size={20} />
          <span>{it.kind === 'tool' ? localizedToolShortName(it.toolId, locale) : t(it.label)}</span>
        </NavLink>
      ))}
      <button className="bottom-nav-item" onClick={onMenu} aria-expanded={menuOpen} aria-controls="menu-principal" aria-label={t('common.more')} title={t('common.more')}>
        <Menu size={20} aria-hidden="true" />
        <span>{t('common.more')}</span>
      </button>
    </nav>
  );
}
