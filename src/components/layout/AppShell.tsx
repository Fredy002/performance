import { Check } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSettings } from '@/state/settings';
import { useToast } from '@/state/toast';
import { CommandPalette } from './CommandPalette';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell() {
  const { sidebarCollapsed } = useSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const toast = useToast();
  const { pathname } = useLocation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className={`shell${sidebarCollapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
      <Sidebar onNavigate={() => setMobileOpen(false)} />
      <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      <div className="main">
        <Topbar onMenu={() => setMobileOpen(true)} onSearch={() => setPaletteOpen(true)} />
        <main className="content">
          <Suspense fallback={<div className="empty">Cargando…</div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      {toast && (
        <div className="toast" role="status">
          <Check size={16} /> {toast}
        </div>
      )}
    </div>
  );
}
