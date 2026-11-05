import { History, House, PanelLeftClose, PanelLeftOpen, Plane, Settings, Table, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { localizedToolName, localizedToolShortName, readyTools, toolPath } from '@/tools/registry';
import { useI18n } from '@/i18n';
import { updateSettings, useSettings } from '@/state/settings';
import { useHistory } from '@/state/history';

export function Sidebar({ onNavigate, onClose }: { onNavigate: () => void; onClose: () => void }) {
  const { sidebarCollapsed } = useSettings();
  const { locale, t } = useI18n();
  const history = useHistory();
  const link = ({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' active' : ''}`;
  const navRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  // en pantallas bajas el menú tiene scroll: mantiene visible la sección activa
  useEffect(() => {
    navRef.current?.querySelector<HTMLElement>('.nav-link.active')?.scrollIntoView?.({ block: 'nearest' });
  }, [pathname]);

  return (
    <aside className="sidebar" id="menu-principal" aria-label={t('common.mainMenu')}>
      <div className="sidebar-brand">
        <span className="brand-logo">
          <Plane size={18} aria-hidden="true" />
        </span>
        <span className="brand-name">
          AeroPerf
          <small>{t('common.aircraftPerformance')}</small>
        </span>
        <button className="btn btn-ghost btn-icon mobile-only sidebar-close" onClick={onClose} aria-label={t('common.closeMenu')} title={t('common.closeMenu')}>
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <nav className="sidebar-nav" ref={navRef}>
        <div className="nav-section">
          <NavLink to="/" end className={link} onClick={onNavigate} title={t('common.home')}>
            <House size={18} />
            <span className="nav-label">{t('common.home')}</span>
          </NavLink>
          <NavLink to="/history" className={link} onClick={onNavigate} title={t('common.history')}>
            <History size={18} />
            <span className="nav-label">{t('common.history')}</span>
            {history.length > 0 && <span className="nav-badge">{history.length}</span>}
          </NavLink>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">{t('common.calculate')}</div>
          {readyTools()
            .filter((t) => !t.hideInSidebar)
            .map((tool) => (
            <NavLink key={tool.id} to={toolPath(tool.id)} className={link} onClick={onNavigate} title={locale === 'es' ? tool.name : localizedToolName(tool.id, locale)}>
              <tool.icon size={18} />
              <span className="nav-label">
                {locale === 'es'
                  ? tool.shortName ?? tool.name
                  : tool.shortName ? localizedToolShortName(tool.id, locale) : localizedToolName(tool.id, locale)}
              </span>
            </NavLink>
          ))}
        </div>

        <div className="nav-section">
          <div className="nav-section-title">{t('common.consult')}</div>
          <NavLink to="/tables" className={link} onClick={onNavigate} title={t('common.tableNavigation')}>
            <Table size={18} />
            <span className="nav-label">{t('common.aircraftTables')}</span>
          </NavLink>
        </div>

        {/* Pruebas, Próximamente y algunas calculadoras siguen disponibles en el inicio y en el buscador */}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" className={link} onClick={onNavigate} title={t('common.settings')}>
          <Settings size={18} />
          <span className="nav-label">{t('common.settings')}</span>
        </NavLink>
        <button
          className="btn btn-sidebar desktop-only"
          onClick={() => updateSettings({ sidebarCollapsed: !sidebarCollapsed })}
          aria-label={sidebarCollapsed ? t('common.expandMenu') : t('common.collapseMenu')}
          title={sidebarCollapsed ? t('common.expandMenu') : t('common.collapseMenu')}
        >
          {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          <span className="nav-label">{t('common.collapseMenu')}</span>
        </button>
      </div>
    </aside>
  );
}
