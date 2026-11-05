import { useSettings, updateSettings } from '@/state/settings';
import * as common from './messages/common';
import * as ai from './messages/ai';
import * as aiWorkflow from './messages/aiWorkflow';
import * as content from './messages/content';
import * as exercises from './messages/exercises';
import * as pages from './messages/pages';
import * as services from './messages/services';
import * as tables from './messages/tables';
import * as tools from './messages/tools';
import type { Locale } from './types';

const en = { ...common.en, ...pages.en, ...tools.en, ...content.en, ...tables.en, ...exercises.en, ...services.en, ...ai.en, ...aiWorkflow.en };
const es = { ...common.es, ...pages.es, ...tools.es, ...content.es, ...tables.es, ...exercises.es, ...services.es, ...ai.es, ...aiWorkflow.es };
export type MessageKey = keyof typeof en;
export type { Locale } from './types';

const catalogs: Record<Locale, Record<MessageKey, string>> = { es, en };

export function translate(locale: Locale, key: string, values?: Record<string, string | number>): string {
  const template = catalogs[locale][key as MessageKey];
  if (typeof template !== 'string') {
    throw new Error(`Missing ${locale} translation for ${key}`);
  }
  return values ? template.replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? `{${name}}`)) : template;
}

export function useI18n() {
  const { locale } = useSettings();
  return {
    locale,
    setLocale: (next: Locale) => updateSettings({ locale: next }),
    t: (key: string, values?: Record<string, string | number>) => translate(locale, key, values),
  };
}

export function assertCatalogParity() {
  const esKeys = Object.keys(es).sort();
  const enKeys = Object.keys(en).sort();
  return {
    missingInEs: enKeys.filter((key) => !(key in es)),
    missingInEn: esKeys.filter((key) => !(key in en)),
  };
}
