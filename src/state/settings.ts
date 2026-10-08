import { useEffect } from 'react';
import { createPersistedStore } from './createStore';

export type ThemePref = 'system' | 'light' | 'dark';

export interface Settings {
  theme: ThemePref;
  decimals: number;
  sidebarCollapsed: boolean;
  favorites: string[];
}

const DEFAULTS: Settings = { theme: 'system', decimals: 2, sidebarCollapsed: false, favorites: ['linear'] };

const store = createPersistedStore<Settings>('aeroperf.settings', DEFAULTS);

export function useSettings() {
  const s = { ...DEFAULTS, ...store.useStore() };
  return s;
}

export function updateSettings(patch: Partial<Settings>) {
  store.set((prev) => ({ ...DEFAULTS, ...prev, ...patch }));
}

export function toggleFavorite(toolId: string) {
  store.set((prev) => {
    const favs = prev.favorites ?? [];
    return { ...prev, favorites: favs.includes(toolId) ? favs.filter((f) => f !== toolId) : [...favs, toolId] };
  });
}

/** Aplica el tema elegido al elemento <html>. */
export function useApplyTheme() {
  const { theme } = useSettings();
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, [theme]);
}
