import { History, LayoutDashboard, PanelLeftClose, PanelLeftOpen, Plane, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { CATEGORIES, toolPath, toolsByCategory } from '@/tools/registry';
import { updateSettings, useSettings } from '@/state/settings';
import { useHistory } from '@/state/history';

export function Sidebar({ onNavigate }: { onNavigate: () => void }) {
  const { sidebarCollapsed } = useSettings();
  const history = useHistory();
  const link = ({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' active' : ''}`;

  return (
    <aside className="sidebar" aria-label="Menú principal">
      <div className="sidebar-brand">
        <span className="brand-logo">
          <Plane size={20} />
        </span>
        <span className="brand-name">
          AeroPerf
          <small>Performance toolkit</small>
        </span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">General</div>
          <NavLink to="/" end className={link} onClick={onNavigate} title="Panel">
            <LayoutDashboard size={19} />
            <span className="nav-label">Panel</span>
          </NavLink>
          <NavLink to="/history" className={link} onClick={onNavigate} title="Historial">
            <History size={19} />
            <span className="nav-label">Historial</span>
            {history.length > 0 && <span className="nav-badge">{history.length}</span>}
          </NavLink>
        </div>

        {toolsByCategory().map(([cat, tools]) => (
          <div className="nav-section" key={cat}>
            <div className="nav-section-title">{CATEGORIES[cat]}</div>
            {tools.map((t) =>
              t.status === 'ready' ? (
                <NavLink key={t.id} to={toolPath(t.id)} className={link} onClick={onNavigate} title={t.name}>
                  <t.icon size={19} />
                  <span className="nav-label">{t.name}</span>
                </NavLink>
              ) : (
                <span key={t.id} className="nav-link disabled" title={`${t.name} (próximamente)`} aria-disabled="true">
                  <t.icon size={19} />
                  <span className="nav-label">{t.name}</span>
                  <span className="nav-badge">Pronto</span>
                </span>
              ),
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" className={link} onClick={onNavigate} title="Ajustes">
          <Settings size={19} />
          <span className="nav-label">Ajustes</span>
        </NavLink>
        <button
          className="btn btn-sidebar desktop-only"
          onClick={() => updateSettings({ sidebarCollapsed: !sidebarCollapsed })}
          aria-label={sidebarCollapsed ? 'Expandir menú' : 'Contraer menú'}
          title={sidebarCollapsed ? 'Expandir menú' : 'Contraer menú'}
        >
          {sidebarCollapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
          <span className="nav-label">Contraer</span>
        </button>
      </div>
    </aside>
  );
}
