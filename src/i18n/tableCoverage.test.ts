import { describe, expect, it } from 'vitest';
import { PERFORMANCE_TABLES } from '@/data/tables';
import { en } from './messages/tables';

/** Every localizable table text must have an English entry; otherwise the UI silently shows Spanish. */
function modelKeys(): string[] {
  const keys: string[] = [];
  for (const table of PERFORMANCE_TABLES) {
    const p = `table.${table.id}`;
    keys.push(`${p}.title`, `${p}.category`, `${p}.summary`, `${p}.help.purpose`);
    table.help.glossary.forEach((_, i) => keys.push(`${p}.help.glossary.${i}.meaning`));
    table.help.steps.forEach((_, i) => keys.push(`${p}.help.steps.${i}`));
    table.help.tips.forEach((_, i) => keys.push(`${p}.help.tips.${i}`));
    if (table.kind === 'figure') {
      table.cautions?.forEach((_, i) => keys.push(`${p}.cautions.${i}`));
      table.uncertain?.forEach((_, i) => keys.push(`${p}.uncertain.${i}`));
    }
    if (table.kind === 'holding') table.sourceRemarks.forEach((_, i) => keys.push(`${p}.sourceRemarks.${i}`));
    if (table.kind === 'flight-planning') table.gaps.forEach((_, i) => keys.push(`${p}.gaps.${i}.note`));
    if (table.aircraft && !/^Boeing \d{3}$/.test(table.aircraft)) keys.push(`${p}.aircraft`);
  }
  return keys;
}

describe('table translation coverage', () => {
  it('has an English entry for every localizable table text', () => {
    expect(modelKeys().filter((k) => !(k in en))).toEqual([]);
  });
});
