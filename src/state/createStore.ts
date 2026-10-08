import { useSyncExternalStore } from 'react';
import { readJSON, writeJSON } from './storage';

/** Store mínimo persistido en localStorage y suscribible desde React. */
export function createPersistedStore<T>(key: string, initial: T) {
  let state: T = readJSON(key, initial);
  const listeners = new Set<() => void>();

  const get = () => state;
  const set = (updater: T | ((prev: T) => T)) => {
    state = typeof updater === 'function' ? (updater as (prev: T) => T)(state) : updater;
    writeJSON(key, state);
    listeners.forEach((l) => l());
  };
  const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  };
  const useStore = () => useSyncExternalStore(subscribe, get, get);

  return { get, set, subscribe, useStore };
}
