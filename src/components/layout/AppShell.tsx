import { Check, CircleX, Info, X } from 'lucide-react';
import { Suspense, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { useSettings } from '@/state/settings';
import { dismissToast, useToast } from '@/state/toast';
import { BottomNav } from './BottomNav';
import { CommandPalette } from './CommandPalette';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const TOAST_ICON = { success: Check, error: CircleX, info: Info };

/** Esqueleto mientras se descarga una página: evita el salto de «Cargando…». */
function PageSkeleton() {
  const { t } = useI18n();
  return (
    <div className="skeleton-page" aria-busy="true" aria-live="polite">
      <span className="sr-only">{t('common.loadingPage')}</span>
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-line" />
      <div className="grid grid-calc">
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-card" />
      </div>
    </div>
  );
}

export function AppShell() {
  const { sidebarCollapsed } = useSettings();
  const { locale, t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const toast = useToast();
  const { pathname } = useLocation();
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    document.title = t('app.documentTitle');
  }, [locale]);

  const openPalette = () => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setPaletteOpen(true);
  };
  const closePalette = () => {
    setPaletteOpen(false);
    // devuelve el foco al control que abrió la búsqueda
    requestAnimationFrame(() => returnFocus.current?.focus?.());
  };
  const openMenu = () => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setMobileOpen(true);
  };
  const closeMenu = (restore = true) => {
    setMobileOpen(false);
    if (restore) requestAnimationFrame(() => returnFocus.current?.focus?.());
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (paletteOpen) closePalette();
        else openPalette();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paletteOpen]);

  // menú móvil: Escape lo cierra y el foco entra en él al abrirlo
  useEffect(() => {
    if (!mobileOpen) return;
    requestAnimationFrame(() => document.querySelector<HTMLElement>('.sidebar .nav-link.active, .sidebar .nav-link')?.focus());
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeMenu();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const ToastIcon = toast ? TOAST_ICON[toast.kind] : Check;

  return (
    <div className={`shell${sidebarCollapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
      <a className="skip-link" href="#contenido" onClick={(e) => {
        // HashRouter usa el hash para las rutas: mover el foco sin cambiar la URL
        e.preventDefault();
        document.getElementById('contenido')?.focus();
      }}>
        {t('common.skipContent')}
      </a>
      <Sidebar onNavigate={() => closeMenu(false)} onClose={() => closeMenu()} />
      <div className="sidebar-backdrop" onClick={() => closeMenu()} />
      <div className="main">
        <Topbar onSearch={openPalette} />
        <main className="content" id="contenido" tabIndex={-1}>
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <BottomNav onMenu={openMenu} menuOpen={mobileOpen} />
      <CommandPalette open={paletteOpen} onClose={closePalette} />
      {/* región viva permanente: los lectores de pantalla anuncian cada aviso */}
      <div className="toast-region" role="status" aria-live="polite" aria-label={t('common.notifications')}>
        {toast && (
          <div className={`toast toast-${toast.kind}`} key={toast.id}>
            <ToastIcon size={16} aria-hidden="true" />
            <span>{toast.text}</span>
            {toast.action && (
              <button
                className="toast-action"
                onClick={() => {
                  toast.action?.run();
                  dismissToast();
                }}
              >
                {toast.action.label}
              </button>
            )}
            <button className="toast-close" onClick={dismissToast} aria-label={t('common.closeNotice')} title={t('common.closeNotice')}>
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
