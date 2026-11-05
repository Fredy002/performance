import { useEffect } from 'react';
import { createPersistedStore } from './createStore';
import type { Locale } from '@/i18n/types';

export type ThemePref = 'system' | 'light' | 'dark';

export interface Settings {
  theme: ThemePref;
  locale: Locale;
  decimals: number;
  sidebarCollapsed: boolean;
  favorites: string[];
  /** El usuario cerró la tarjeta «Cómo empezar» del inicio */
  onboardingDismissed: boolean;
}

const DEFAULTS: Settings = {
  theme: 'system',
  locale: 'es',
  decimals: 2,
  sidebarCollapsed: false,
  favorites: ['linear'],
  onboardingDismissed: false,
};

const store = createPersistedStore<Settings>('aeroperf.settings', DEFAULTS);

export function useSettings() {
  const s = { ...DEFAULTS, ...store.useStore() };
  if (s.locale !== 'es' && s.locale !== 'en') s.locale = 'es';
  return s;
}

export function updateSettings(patch: Partial<Settings>) {
  const next = { ...DEFAULTS, ...store.get(), ...patch };
  if (next.locale !== 'es' && next.locale !== 'en') next.locale = 'es';
  store.set(next);
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

/** Applies the persisted interface language to document semantics. */
export function useApplyLocale() {
  const { locale } = useSettings();
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
}

/** Decimales elegidos en Ajustes para mostrar resultados. */
export function useDecimals(): number {
  return useSettings().decimals;
}
