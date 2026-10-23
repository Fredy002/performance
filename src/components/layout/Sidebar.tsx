import { ClipboardCheck, History, House, PanelLeftClose, PanelLeftOpen, Plane, Settings, Table } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { readyTools, toolPath } from '@/tools/registry';
import { updateSettings, useSettings } from '@/state/settings';
import { useHistory } from '@/state/history';

export function Sidebar({ onNavigate }: { onNavigate: () => void }) {
  const { sidebarCollapsed } = useSettings();
  const history = useHistory();
  const link = ({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' active' : ''}`;
  const navRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  // en pantallas bajas el menú tiene scroll: mantiene visible la sección activa
  useEffect(() => {
    navRef.current?.querySelector<HTMLElement>('.nav-link.active')?.scrollIntoView?.({ block: 'nearest' });
  }, [pathname]);

  return (
    <aside className="sidebar" aria-label="Menú principal">
      <div className="sidebar-brand">
        <span className="brand-logo">
          <Plane size={20} />
        </span>
        <span className="brand-name">
          AeroPerf
          <small>Performance de aeronaves</small>
        </span>
      </div>

      <nav className="sidebar-nav" ref={navRef}>
        <div className="nav-section">
          <NavLink to="/" end className={link} onClick={onNavigate} title="Inicio">
            <House size={19} />
            <span className="nav-label">Inicio</span>
          </NavLink>
          <NavLink to="/history" className={link} onClick={onNavigate} title="Historial">
            <History size={19} />
            <span className="nav-label">Historial</span>
            {history.length > 0 && <span className="nav-badge">{history.length}</span>}
          </NavLink>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Calcular</div>
          {readyTools().map((t) => (
            <NavLink key={t.id} to={toolPath(t.id)} className={link} onClick={onNavigate} title={t.name}>
              <t.icon size={19} />
              <span className="nav-label">{t.shortName ?? t.name}</span>
            </NavLink>
          ))}
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Consultar</div>
          <NavLink to="/tables" className={link} onClick={onNavigate} title="Tablas de performance de aeronaves">
            <Table size={19} />
            <span className="nav-label">Tablas de aeronaves</span>
          </NavLink>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Pruebas</div>
          <NavLink to="/pruebas" className={link} onClick={onNavigate} title="Pruebas">
            <ClipboardCheck size={19} />
            <span className="nav-label">Pruebas</span>
          </NavLink>
        </div>
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
