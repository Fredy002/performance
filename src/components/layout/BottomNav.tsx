import { Fuel, House, Menu, Spline, Table } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const ITEMS = [
  { to: '/', label: 'Inicio', icon: House, end: true },
  { to: '/tools/fuel', label: 'Combustible', icon: Fuel },
  { to: '/tools/linear', label: 'Interpolar', icon: Spline },
  { to: '/tables', label: 'Tablas', icon: Table },
];

/** Navegación del móvil: lo más usado a un toque del pulgar; el resto, en «Más». */
export function BottomNav({ onMenu, menuOpen }: { onMenu: () => void; menuOpen: boolean }) {
  return (
    <nav className="bottom-nav mobile-only" aria-label="Accesos rápidos">
      {ITEMS.map((it) => (
        <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
          <it.icon size={20} />
          <span>{it.label}</span>
        </NavLink>
      ))}
      <button className="bottom-nav-item" onClick={onMenu} aria-expanded={menuOpen} aria-controls="menu-principal">
        <Menu size={20} aria-hidden="true" />
        <span>Más</span>
      </button>
    </nav>
  );
}
