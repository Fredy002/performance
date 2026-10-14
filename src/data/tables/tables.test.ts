import { describe, expect, it } from 'vitest';
import fig67Source from './__fixtures__/fig67.source.md?raw';
import fig69Source from './__fixtures__/fig69.source.md?raw';
import { bilinearInterpolate, linearInterpolate } from '@/core/interpolation';
import {
  FIG66_OPERATING_CONDITIONS as F66,
  FIG67_ABBREVIATED_FLIGHT_PLANNING as F67,
  FIG69_B737_HOLDING as F69,
  getTable,
  PERFORMANCE_TABLES,
  windCorrection,
} from './index';

/** Filas de una tabla Markdown → celdas de texto (sin asteriscos de negrita). */
function parseMarkdownRows(md: string): string[][] {
  return md
    .split('\n')
    .filter((l) => l.trim().startsWith('|'))
    .map((l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.replace(/\*/g, '').trim()));
}

describe('biblioteca de tablas', () => {
  it('tiene ids únicos y todas se pueden recuperar', () => {
    const ids = PERFORMANCE_TABLES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(getTable(id)?.id).toBe(id));
    expect(getTable('no-existe')).toBeUndefined();
  });

  it('cada tabla incluye ayuda completa', () => {
    for (const t of PERFORMANCE_TABLES) {
      expect(t.help.purpose.length).toBeGreaterThan(40);
      expect(t.help.steps.length).toBeGreaterThanOrEqual(3);
      expect(t.help.glossary.length).toBeGreaterThanOrEqual(3);
      expect(t.source.figure).toMatch(/^FIGURE \d+$/);
    }
  });

  it('las tablas relacionadas existen', () => {
    for (const t of PERFORMANCE_TABLES) t.related?.forEach((r) => expect(getTable(r)).toBeDefined());
  });
});

describe('figura 66 · condiciones de operación', () => {
  it('transcribe Z-1 a Z-5', () => {
    expect(F66.conditions.map((c) => [c.id, c.distanceNm, c.wind.speedKt, c.wind.kind])).toEqual([
      ['Z-1', 340, 25, 'TW'],
      ['Z-2', 650, 45, 'HW'],
      ['Z-3', 900, 35, 'TW'],
      ['Z-4', 290, 25, 'HW'],
      ['Z-5', 400, 60, 'HW'],
    ]);
  });

  it('todas las distancias aparecen exactas en la figura 67', () => {
    const dists = F67.rows.map((r) => r.distanceNm);
    F66.conditions.forEach((c) => expect(dists).toContain(c.distanceNm));
  });
});

describe('figura 67 · planificación abreviada', () => {
  it('tiene 25 filas con distancias crecientes', () => {
    expect(F67.rows).toHaveLength(25);
    for (let i = 1; i < F67.rows.length; i++) expect(F67.rows[i].distanceNm).toBeGreaterThan(F67.rows[i - 1].distanceNm);
  });

  it('tiempo y combustible crecen con la distancia y los valores son coherentes', () => {
    for (let i = 1; i < F67.rows.length; i++) {
      expect(F67.rows[i].airTimeMin).toBeGreaterThan(F67.rows[i - 1].airTimeMin);
      expect(F67.rows[i].fuelLb).toBeGreaterThan(F67.rows[i - 1].fuelLb);
    }
    F67.rows.forEach((r) => {
      expect(r.recAltFt[0]).toBeLessThan(r.recAltFt[1]);
      expect(r.tasKt).toBeGreaterThan(250);
    });
  });

  it('transcribe filas clave de la fuente', () => {
    const at = (d: number) => F67.rows.find((r) => r.distanceNm === d);
    expect(at(50)).toEqual({ distanceNm: 50, recAltFt: [6000, 7000], tasKt: 279, airTimeMin: 16, fuelLb: 1800 });
    expect(at(280)).toEqual({ distanceNm: 280, recAltFt: [27000, 28000], tasKt: 445, airTimeMin: 47, fuelLb: 4850 });
    expect(at(340)).toEqual({ distanceNm: 340, recAltFt: [31000, 33000], tasKt: 438, airTimeMin: 55, fuelLb: 5550 });
    expect(at(1000)).toEqual({ distanceNm: 1000, recAltFt: [33000, 35000], tasKt: 433, airTimeMin: 142, fuelLb: 13500 });
  });

  it('suma de control de las columnas', () => {
    const sum = (k: 'airTimeMin' | 'fuelLb' | 'tasKt') => F67.rows.reduce((s, r) => s + r[k], 0);
    expect(sum('airTimeMin')).toBe(1862);
    expect(sum('fuelLb')).toBe(183700);
    expect(sum('tasKt')).toBe(10613);
  });

  it('coincide fila a fila con la transcripción literal de la fuente', () => {
    const lines = parseMarkdownRows(fig67Source);
    expect(lines).toHaveLength(F67.rows.length);
    lines.forEach(([dist, alt, tas, time, fuel], i) => {
      const r = F67.rows[i];
      expect(r.distanceNm).toBe(Number(dist));
      expect(r.recAltFt).toEqual(alt.split('-').map(Number));
      expect([r.tasKt, r.airTimeMin, r.fuelLb]).toEqual([tas, time, fuel].map(Number));
    });
  });

  it('declara el tramo omitido 70–250 NM', () => {
    expect(F67.gaps).toEqual([expect.objectContaining({ afterNm: 60, beforeNm: 260 })]);
  });

  it('reproduce el ejemplo de corrección por viento de la fuente', () => {
    const e = F67.windCorrection.example;
    const r = windCorrection(e.timeMin, e.fuelLb, e.windKt, e.tasKt, 'HW');
    expect(Math.round(r.deltaFuelLb)).toBe(e.deltaFuelLb);
    expect(r.deltaTimeMin).toBeCloseTo(1.9, 1);
  });

  it('resuelve las condiciones Z-1…Z-5 (fig. 66 + fig. 67)', () => {
    const solve = (id: string) => {
      const c = F66.conditions.find((x) => x.id === id)!;
      const r = F67.rows.find((x) => x.distanceNm === c.distanceNm)!;
      return windCorrection(r.airTimeMin, r.fuelLb, c.wind.speedKt, r.tasKt, c.wind.kind);
    };
    // Z-1: 340 NM, 25 TW → 55 − 3,1 min; 5550 − 317 lb
    expect(solve('Z-1').timeMin).toBeCloseTo(51.86, 2);
    expect(Math.round(solve('Z-1').fuelLb)).toBe(5233);
    // Z-2: 650 NM, 45 HW
    expect(Math.round(solve('Z-2').fuelLb)).toBe(10267);
    // Z-3: 900 NM, 35 TW
    expect(Math.round(solve('Z-3').fuelLb)).toBe(11306);
    // Z-4: 290 NM, 25 HW
    expect(Math.round(solve('Z-4').fuelLb)).toBe(5229);
    // Z-5: 400 NM, 60 HW
    expect(Math.round(solve('Z-5').fuelLb)).toBe(7116);
    expect(solve('Z-5').timeMin).toBeCloseTo(70.59, 2);
  });

  it('se puede interpolar entre filas con el núcleo existente', () => {
    // 425 NM entre 400 (62 min / 6250 lb) y 450 (69 min / 6850 lb)
    expect(linearInterpolate({ a: 400, b: 450, c: 425, a1: 6250, b1: 6850 }).x).toBe(6550);
  });
});

describe('figura 69 · espera B-737', () => {
  it('tiene 8 niveles × 11 pesos', () => {
    expect(F69.weightsKlb).toEqual([115, 110, 105, 100, 95, 90, 85, 80, 75, 70, 65]);
    expect(F69.rows.map((r) => r.flightLevel)).toEqual([350, 300, 250, 200, 150, 100, 50, 15]);
    F69.rows.forEach((r) => expect(r.cells).toHaveLength(11));
    expect(F69.engines).toBe(2);
  });

  it('valores dentro de rangos físicos razonables', () => {
    F69.rows.forEach((r) =>
      r.cells.forEach((c) => {
        expect(c.epr).toBeGreaterThan(1.1);
        expect(c.epr).toBeLessThan(2.2);
        expect(c.iasKt).toBeGreaterThanOrEqual(210);
        expect(c.iasKt).toBeLessThanOrEqual(234);
        expect(c.ffPerEngineLbHr).toBeGreaterThanOrEqual(1700);
        expect(c.ffPerEngineLbHr).toBeLessThanOrEqual(3050);
      }),
    );
  });

  it('EPR e IAS no crecen al bajar el peso', () => {
    F69.rows.forEach((r) => {
      for (let i = 1; i < r.cells.length; i++) {
        expect(r.cells[i].epr).toBeLessThan(r.cells[i - 1].epr);
        expect(r.cells[i].iasKt).toBeLessThanOrEqual(r.cells[i - 1].iasKt);
        expect(r.cells[i].ffPerEngineLbHr).toBeLessThan(r.cells[i - 1].ffPerEngineLbHr);
      }
    });
  });

  it('transcribe celdas clave de la fuente', () => {
    const cell = (fl: number, w: number) => F69.rows.find((r) => r.flightLevel === fl)!.cells[F69.weightsKlb.indexOf(w)];
    expect(cell(350, 115)).toEqual({ epr: 2.13, iasKt: 234, ffPerEngineLbHr: 2830 });
    expect(cell(200, 115)).toEqual({ epr: 1.56, iasKt: 227, ffPerEngineLbHr: 2716 });
    expect(cell(150, 65)).toEqual({ epr: 1.26, iasKt: 210, ffPerEngineLbHr: 1990 });
    expect(cell(15, 65)).toEqual({ epr: 1.15, iasKt: 210, ffPerEngineLbHr: 2240 });
    expect(cell(100, 100)).toEqual({ epr: 1.31, iasKt: 210, ffPerEngineLbHr: 2560 });
  });

  it('sumas de control por línea de la fuente', () => {
    const sums = F69.rows.map((r) => [
      r.flightLevel,
      Math.round(r.cells.reduce((s, c) => s + c.epr, 0) * 100),
      r.cells.reduce((s, c) => s + c.iasKt, 0),
      r.cells.reduce((s, c) => s + c.ffPerEngineLbHr, 0),
    ]);
    expect(sums).toEqual([
      [350, 2049, 2373, 24580],
      [300, 1846, 2362, 23970],
      [250, 1697, 2354, 24220],
      [200, 1575, 2347, 24696],
      [150, 1481, 2343, 25600],
      [100, 1409, 2340, 26580],
      [50, 1351, 2337, 27790],
      [15, 1320, 2337, 28750],
    ]);
  });

  it('coincide celda a celda con la transcripción literal de la fuente', () => {
    const lines = parseMarkdownRows(fig69Source);
    expect(lines).toHaveLength(F69.rows.length * 3);
    F69.rows.forEach((row, i) => {
      const [epr, ias, ff] = lines.slice(i * 3, i * 3 + 3);
      expect(Number(ias[0])).toBe(row.flightLevel);
      expect(row.cells.map((c) => c.epr)).toEqual(epr.slice(1).map(Number));
      expect(row.cells.map((c) => c.iasKt)).toEqual(ias.slice(1).map(Number));
      expect(row.cells.map((c) => c.ffPerEngineLbHr)).toEqual(ff.slice(1).map(Number));
    });
  });

  it('se puede interpolar con el núcleo existente (FL 225, 102 500 lb)', () => {
    const row = (fl: number) => F69.rows.find((r) => r.flightLevel === fl)!.cells;
    const i105 = F69.weightsKlb.indexOf(105);
    const i100 = F69.weightsKlb.indexOf(100);
    const r = bilinearInterpolate({
      x1: 105, x2: 100, x: 102.5,
      y1: 200, y2: 250, y: 225,
      q11: row(200)[i105].ffPerEngineLbHr, q21: row(200)[i100].ffPerEngineLbHr,
      q12: row(250)[i105].ffPerEngineLbHr, q22: row(250)[i100].ffPerEngineLbHr,
    });
    expect(r.value).toBeCloseTo(2435, 6);
    // combustible total para 30 min de espera con dos motores
    expect((r.value * F69.engines * 30) / 60).toBeCloseTo(2435, 6);
  });
});

import { tableToCsv } from './csv';

describe('exportación CSV', () => {
  it('genera una línea por dato más la cabecera', () => {
    expect(tableToCsv(F66).split('\n')).toHaveLength(6);
    expect(tableToCsv(F67).split('\n')).toHaveLength(26);
    expect(tableToCsv(F69).split('\n')).toHaveLength(1 + 8 * 11);
  });
  it('formato de las filas', () => {
    expect(tableToCsv(F66).split('\n')[1]).toBe('Z-1,340,25,TW');
    expect(tableToCsv(F67).split('\n')[1]).toBe('50,6000,7000,279,16,1800');
    expect(tableToCsv(F69).split('\n')[1]).toBe('350,115,2.13,234,2830');
    expect(tableToCsv(F69).split('\n').at(-1)).toBe('15,65,1.15,210,2240');
  });
});
