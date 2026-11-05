import { describe, expect, it } from 'vitest';
import { PERFORMANCE_TABLES, PERFORMANCE_TABLE_GROUPS, getTable, getTableGroup, type FigBlock, type FigureTable } from './index';

function blocks(items: FigBlock[]): Extract<FigBlock, { type: 'table' }>[] {
  return items.flatMap(block => block.type === 'table' ? [block] : block.type === 'columns' ? block.columns.flatMap(blocks) : []);
}

const tables = (id: string) => (getTable(id) as FigureTable).sheets.flatMap(sheet => blocks(sheet.blocks));

describe('reviewed source editions and duplicate subjects', () => {
  it('assigns each data sheet to exactly one visible subject', () => {
    const ids = PERFORMANCE_TABLE_GROUPS.flatMap(group => group.variants.map(variant => variant.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(PERFORMANCE_TABLES.map(table => table.id).sort());
    PERFORMANCE_TABLE_GROUPS.forEach(group => expect(group.variants.some(variant => variant.id === group.primaryId)).toBe(true));
    expect(getTableGroup('ascenso-ruta-280-070-isa')).toBe(getTableGroup('ascenso-ruta-280-070-isa-mas-10'));
  });

  it('keeps a single altimeter table for both identical source sheets', () => {
    const source = getTable('reglaje-altimetrico-altitud-presion')!.source;
    expect(source.equivalentFigures).toEqual(['FIGURE 82']);
    expect(PERFORMANCE_TABLES.some(table => table.source.figure === 'FIGURE 82')).toBe(false);
    const qnh = tables('reglaje-altimetrico-altitud-presion')[0];
    expect(qnh.rows).toHaveLength(22);
    qnh.rows.forEach(row => {
      expect(Array.isArray(row)).toBe(true);
      if (Array.isArray(row)) expect(row.reduce((sum, cell) => sum + (cell.cs ?? 1), 0)).toBe(3);
    });
  });

  it('identifies the reviewed 2005 publication for every data sheet', () => {
    for (const table of PERFORMANCE_TABLES) {
      expect(table.source.document).toContain('FAA-CT-8080-7C (2005)');
      expect(table.source.references?.[0].url).toMatch(/7C.*\.pdf#page=\d+$/);
    }
  });

  it('preserves edition differences and the published ISA +10 anomaly', () => {
    const climb = tables('ascenso-ruta-280-070-isa-mas-10')[0];
    const row = climb.rows.find(row => Array.isArray(row) && row[0].t === '35000');
    expect(Array.isArray(row) && row[9].t).toBe('10/2800\n104/382');
    const holding = getTable('espera-b737')!;
    if (holding.kind !== 'holding') throw new Error('Expected holding data');
    expect(holding.rows.find(row => row.flightLevel === 150)?.cells[1].ffPerEngineLbHr).toBe(2680);
  });

  it('uses the higher resolution B727 readings in the correct cells', () => {
    const sourceTables = tables('performance-despegue-b727');
    const epr = sourceTables.find(table => table.rows.some(row => Array.isArray(row) && row.some(cell => cell.t.includes('3856 &'))));
    expect(epr).toBeDefined();
    expect(JSON.stringify(epr)).not.toContain('3858');
    const speeds = sourceTables.find(table => table.rows.some(row => Array.isArray(row) && row.some(cell => cell.t === 'GROSS\nWEIGHT\n1000 LB')));
    expect(speeds).toBeDefined();
    // Weight bands repeat for each flap setting: select the third band within flaps 15.
    const rows = speeds!.rows.filter(row => Array.isArray(row));
    const flap15 = rows.findIndex(row => row[0].t === '15');
    expect(rows[flap15 + 2].at(-1)?.t.split('\n')[0]).toBe('136');
  });
});
