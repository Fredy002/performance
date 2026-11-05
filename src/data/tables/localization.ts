import { translate, type Locale } from '@/i18n';
import { en as tableEn } from '@/i18n/messages/tables';
import type { PerformanceTable, TableGroup, TableHelp } from './index';

export interface TableDisplay {
  title: string;
  category: string;
  summary: string;
}

function localizedOr(locale: Locale, key: string, fallback: string): string {
  if (locale === 'es') return fallback;
  return key in tableEn ? translate(locale, key) : fallback;
}

export function getTableDisplay(table: PerformanceTable, locale: Locale): TableDisplay {
  return {
    title: localizedOr(locale, `table.${table.id}.title`, table.title),
    category: localizedOr(locale, `table.${table.id}.category`, table.category),
    summary: localizedOr(locale, `table.${table.id}.summary`, table.summary),
  };
}

/** Aircraft label of a table: model names stay as they are; descriptive labels are localized. */
export function getTableAircraft(table: PerformanceTable, locale: Locale): string | undefined {
  return table.aircraft && localizedOr(locale, `table.${table.id}.aircraft`, table.aircraft);
}

export function getTableGroupDisplay(group: TableGroup, locale: Locale): Pick<TableDisplay, 'title' | 'summary'> {
  const key = `table.group.${group.primaryId}`;
  return {
    title: localizedOr(locale, `${key}.title`, group.title),
    summary: localizedOr(locale, `${key}.summary`, group.summary ?? ''),
  };
}

export function getTableVariantLabel(id: string, label: string, locale: Locale): string {
  return localizedOr(locale, `table.variant.${id}.label`, label);
}

function translateList(locale: Locale, id: string, key: string, values: string[]): string[] {
  return values.map((value, index) => localizedOr(locale, `table.${id}.${key}.${index}`, value));
}

function translateHelp(locale: Locale, id: string, help: TableHelp): TableHelp {
  return {
    purpose: localizedOr(locale, `table.${id}.help.purpose`, help.purpose),
    glossary: help.glossary.map((item, index) => ({
      ...item,
      meaning: localizedOr(locale, `table.${id}.help.glossary.${index}.meaning`, item.meaning),
    })),
    steps: translateList(locale, id, 'help.steps', help.steps),
    tips: translateList(locale, id, 'help.tips', help.tips),
  };
}

export function getLocalizedTable(table: PerformanceTable, locale: Locale): PerformanceTable {
  const display = getTableDisplay(table, locale);
  const help = translateHelp(locale, table.id, table.help);
  if (table.kind === 'figure') {
    return {
      ...table,
      ...display,
      help,
      cautions: table.cautions && translateList(locale, table.id, 'cautions', table.cautions),
      uncertain: table.uncertain && translateList(locale, table.id, 'uncertain', table.uncertain),
    };
  }
  if (table.kind === 'holding') {
    return { ...table, ...display, help, sourceRemarks: translateList(locale, table.id, 'sourceRemarks', table.sourceRemarks) };
  }
  if (table.kind === 'flight-planning') {
    return {
      ...table,
      ...display,
      help,
      gaps: table.gaps.map((gap, index) => ({
        ...gap,
        note: localizedOr(locale, `table.${table.id}.gaps.${index}.note`, gap.note),
      })),
    };
  }
  return { ...table, ...display, help };
}
