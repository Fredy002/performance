import { describe, expect, it } from 'vitest';
import { checkSteps } from '@/components/fuel/ExerciseValidation';
import { b737ScenarioCase } from '@/components/takeoff/eprForm';
import { B737_EPR_OAT_F, B737_PRESS_LIMIT_EPR, B737_TAKEOFF_SCENARIOS, B737_TEMP_LIMIT_EPR } from '@/data/tables/takeoffEprData';
import { FIG53_B737_TAKEOFF_CONDITIONS } from '@/data/tables/fig53-b737-takeoff-conditions';
import { FIG55_B737_TAKEOFF_PERFORMANCE } from '@/data/tables/fig55-b737-takeoff-performance';
import type { FigCell } from '@/data/tables/types';
import { getTakeoffEprExercise } from '@/exercises/registry';
import { TakeoffEprError } from './takeoffEpr';
import { solveB737TakeoffEpr, type B737EprInput } from './takeoffEprB737';

const scenario = (id: string) => b737ScenarioCase(B737_TAKEOFF_SCENARIOS.find((s) => s.id === id)!).input as B737EprInput;
const tableRows = (t: typeof FIG53_B737_TAKEOFF_CONDITIONS) =>
  t.sheets.flatMap((sh) => sh.blocks).flatMap((b) => (b.type === 'table' ? b.rows.filter((r): r is FigCell[] => Array.isArray(r)) : []));

describe('datos del B737', () => {
  it('las condiciones R-1 a R-5 coinciden con la FIGURE 53 tal como se muestra', () => {
    const rows = tableRows(FIG53_B737_TAKEOFF_CONDITIONS);
    const cell = (label: string, i: number) => String(rows.find((r) => r[0].t === label)![i + 1].t).replace('–', '-');
    B737_TAKEOFF_SCENARIOS.forEach((s, i) => {
      expect(Number(cell('FIELD ELEVATION', i).replace(',', ''))).toBe(s.elevationFt);
      const alt = cell('ALTIMETER SETTING', i);
      expect(Number(alt.replace(/["mb ]/g, ''))).toBe(s.altimeter);
      expect(alt.includes('mb') ? 'mb' : 'inHg').toBe(s.altimeterUnit);
      const t = cell('TEMPERATURE (OAT)', i);
      expect(Number(t.replace(/[^\d.-]/g, ''))).toBe(s.temperature);
      expect(t.includes('°C') ? 'C' : 'F').toBe(s.temperatureUnit);
      expect(Number(cell('WEIGHT (X1000)', i))).toBe(s.weightKlb);
      expect(Number(cell('FLAP POSITION', i).replace('°', ''))).toBe(s.flapsDeg);
      const w = cell('WIND COMPONENT (KTS)', i);
      expect(Number(w.replace(/\D/g, '')) * (w.includes('TW') ? -1 : 1)).toBe(s.windKt);
      const sl = cell('RUNWAY SLOPE %', i);
      expect(Number(sl.replace(/[^\d.]/g, '')) * (sl.includes('DN') ? -1 : 1)).toBe(s.slopePct);
      expect(cell('AIR CONDITIONING', i) === 'ON').toBe(s.airConditioning);
      expect(cell('ENGINE ANTI-ICE', i) === 'ON').toBe(s.engineAntiIce);
    });
  });

  it('TEMP LIMIT y PRESS LIMIT son los de la FIGURE 55', () => {
    expect(B737_EPR_OAT_F).toHaveLength(20);
    expect(B737_TEMP_LIMIT_EPR).toHaveLength(20);
    expect(B737_TEMP_LIMIT_EPR[B737_EPR_OAT_F.indexOf(95)]).toBe(1.95);
    // cada recuadro PRESS de la lámina dice «EPR\nALTITUD»
    const pointers = tableRows(FIG55_B737_TAKEOFF_PERFORMANCE)
      .flat()
      .filter((c) => c.pointer)
      .map((c) => String(c.t));
    expect(pointers).toHaveLength(B737_PRESS_LIMIT_EPR.length);
    for (const b of B737_PRESS_LIMIT_EPR) expect(pointers).toContain(`${b.epr.toFixed(2)}\n${b.label}`);
  });
});

describe('EPR de despegue B737 · R-5 (resolución manual)', () => {
  const r = solveB737TakeoffEpr(scenario('R-5'));

  it('altitud de presión: 50 − 200 = −150 ft', () => {
    expect(r.pressure.correctionFt).toBe(-200);
    expect(r.pressure.pressureAltitudeFt).toBe(-150);
  });

  it('límite por temperatura: 1,95 en 95 °F + 0,03 (A/C OFF) = 1,98', () => {
    expect(r.temp.columns).toEqual([B737_EPR_OAT_F.indexOf(95)]);
    expect(r.temp.table).toBe(1.95);
    expect(r.temp.airCondCorrection).toBe(0.03);
    expect(r.temp.limit).toBeCloseTo(1.98, 10);
  });

  it('límite por presión: 2,01 + (1,96 − 2,01)(−150 − 0)/(−1000 − 0) = 2,0025', () => {
    expect([r.press.lo.altFt, r.press.hi.altFt]).toEqual([-1000, 0]);
    expect(r.press.limit).toBeCloseTo(2.0025, 10);
  });

  it('se usa el menor: 1,98 (manda la temperatura)', () => {
    expect(r.governing).toBe('temp');
    expect(r.final).toBe(1.98);
  });

  it('la prueba R-5 coincide paso a paso con la resolución', () => {
    const ex = getTakeoffEprExercise('b737-epr-despegue-r5')!;
    if (ex.aircraftId !== 'b737') throw new Error('ejercicio del B737 esperado');
    expect(checkSteps(ex.expected, solveB737TakeoffEpr(ex.input)).filter((c) => c.cmp.status !== 'match')).toEqual([]);
  });
});

describe('EPR de despegue B737 · otros escenarios y casos', () => {
  it('R-1: 29.50" → +400; 50 °F → 2,04; presión entre S.L. y 1000 ft', () => {
    const r = solveB737TakeoffEpr(scenario('R-1'));
    expect(r.pressure.pressureAltitudeFt).toBe(500);
    expect(r.temp.limit).toBe(2.04);
    expect(r.press.limit).toBeCloseTo(2.035, 10);
    expect([r.governing, r.final]).toEqual(['press', 2.04]); // 2,035 → 2,04
  });

  it('R-2: milibares y °C; 1032 mb → −500; −15 °C = 5 °F', () => {
    const r = solveB737TakeoffEpr(scenario('R-2'));
    expect(r.pressure.pressureAltitudeFt).toBe(3500);
    expect(r.oatF).toBe(5);
    expect(r.temp.limit).toBe(2.19);
    expect(r.press.limit).toBeCloseTo(2.19, 10);
    expect(r.final).toBe(2.19);
  });

  it('R-3: aire acondicionado OFF suma 0,03 al límite por temperatura', () => {
    const r = solveB737TakeoffEpr(scenario('R-3'));
    expect(r.pressure.pressureAltitudeFt).toBe(1450); // 29.40" → +500
    expect(r.temp.limit).toBeCloseTo(2.04, 10); // 2,01 + 0,03
    expect(r.press.limit).toBeCloseTo(2.0825, 10);
    expect([r.governing, r.final]).toEqual(['temp', 2.04]);
  });

  it('R-4: 1017 mb → −100; 0 °C = 32 °F; el antihielo no corrige', () => {
    const r = solveB737TakeoffEpr(scenario('R-4'));
    expect(r.pressure.pressureAltitudeFt).toBe(1900);
    expect(r.temp.limit).toBe(2.11);
    expect(r.press.limit).toBeCloseTo(2.105, 10);
    expect(r.final).toBe(2.11); // 2,105 → 2,11
  });

  it('una OAT entre columnas se interpola; desde 5660 ft se usa el último recuadro', () => {
    const r = solveB737TakeoffEpr({ ...scenario('R-5'), temperature: 100, elevationFt: 6000, altimeter: 29.92 });
    expect(r.temp.columns).toEqual([17, 18]); // 95 y 104 °F
    expect(r.temp.table).toBeCloseTo(1.95 + (1.91 - 1.95) * (5 / 9), 10);
    expect(r.press).toMatchObject({ exact: true, limit: 2.31 });
  });

  it('valores fuera de la tabla dan un mensaje claro', () => {
    expect(() => solveB737TakeoffEpr({ ...scenario('R-5'), temperature: 130 })).toThrow(TakeoffEprError);
    expect(() => solveB737TakeoffEpr({ ...scenario('R-5'), elevationFt: -1500 })).toThrow(/por debajo de la tabla/);
  });
});
