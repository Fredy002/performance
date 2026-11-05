import { describe, expect, it } from 'vitest';
import { scenarioClimbInput } from '@/components/climb/climbForm';
import { checkSteps, VALIDATION_DECIMALS } from '@/components/fuel/ExerciseValidation';
import { B737_CLIMB_SCENARIOS, CLIMB_TABLES } from '@/data/tables/enRouteClimbData';
import { FIG56_B737_EN_ROUTE_CLIMB_CONDITIONS } from '@/data/tables/fig56-b737-en-route-climb-conditions';
import type { FigCell } from '@/data/tables/types';
import { CLIMB_EXERCISES } from '@/exercises/registry';
import { ClimbError, solveEnRouteClimb } from './enRouteClimb';

const scenario = (id: string) => scenarioClimbInput(B737_CLIMB_SCENARIOS.find((s) => s.id === id)!);
const solve2 = (i: ReturnType<typeof scenario>) => solveEnRouteClimb(i, { decimals: 2 });

describe('datos del ascenso en ruta', () => {
  it('las tablas ISA e ISA +10 se leen de las láminas', () => {
    for (const t of Object.values(CLIMB_TABLES)) {
      expect(t.weightsLb).toEqual([120000, 115000, 110000, 105000, 100000, 95000, 90000, 85000, 80000, 75000, 65000]);
      expect(t.rows.map((r) => r.altFt)).toEqual([37000, 36000, 35000, 34000, 33000, 32000, 31000, 30000, 29000, 28000, 27000, 26000, 25000, 24000, 23000, 22000, 6000, 1500]);
      expect(t.fuelAdjustment.map((a) => a.elevationFt)).toEqual([2000, 4000, 6000, 8000, 10000, 12000]);
    }
    expect(CLIMB_TABLES['ISA+10'].rows.find((r) => r.altFt === 31000)!.cells[9]).toEqual({ timeMin: 13, fuelLb: 2100, distNm: 70, tasKt: 373 });
    expect(CLIMB_TABLES.ISA.fuelAdjustment.map((a) => a.fuelLb)).toEqual([-100, -200, -400, -500, -600, -700]);
    expect(CLIMB_TABLES['ISA+10'].fuelAdjustment.map((a) => a.fuelLb)).toEqual([-100, -300, -400, -500, -600, -800]);
  });

  it('las condiciones V-1 a V-5 coinciden con la FIGURE 56 tal como se muestra', () => {
    const rows = FIG56_B737_EN_ROUTE_CLIMB_CONDITIONS.sheets
      .flatMap((s) => s.blocks)
      .flatMap((b) => (b.type === 'table' ? b.rows.filter((r): r is FigCell[] => Array.isArray(r)) : []));
    const cell = (label: string, i: number) => String(rows.find((r) => r[0].t === label)![i + 1].t);
    B737_CLIMB_SCENARIOS.forEach((s, i) => {
      expect(Number(cell('BRK REL WEIGHT (X1000)', i)) * 1000).toBe(s.weightLb);
      expect(Number(cell('CRUISE PRESS ALT', i).replace(',', ''))).toBe(s.cruiseAltFt);
      expect(Number(cell('AIRPORT ELEVATION', i).replace(',', ''))).toBe(s.airportElevationFt);
      expect(cell('ISA TEMPERATURE', i) === 'ISA' ? 'ISA' : 'ISA+10').toBe(s.temp);
      const w = cell('AVG WIND COMP (KTS)', i);
      expect(Number(w.replace(/\D/g, '')) * (w.includes('TW') ? -1 : 1)).toBe(s.windKt);
    });
  });
});

describe('V-5 (resoluciones manuales)', () => {
  const r = solve2(scenario('V-5'));

  it('lee la FIGURE 58 (ISA +10): 31 000 ft y 75 000 lb → 13/2100 y 70/373', () => {
    expect(r.table.figure).toBe('FIGURE 58');
    expect([r.timeMin, r.tableFuelLb, r.tableDistNm, r.tasKt]).toEqual([13, 2100, 70, 373]);
  });

  it('combustible consumido: 2100 − 100 (aeropuerto a 2000 ft) = 2000 lb', () => {
    expect(r.adjustment).toMatchObject({ fuelLb: -100, belowTable: false });
    expect(r.fuelLb).toBe(2000);
  });

  it('distancia recorrida: (13/60) × 40 = 8,67; 70 − 8,67 = 61,33 NM', () => {
    expect(r.windDistNm).toBe(8.67);
    expect(r.distNm).toBe(61.33);
  });

  it('las dos pruebas coinciden paso a paso con las resoluciones', () => {
    for (const ex of CLIMB_EXERCISES) {
      expect(checkSteps(ex.expected, solveEnRouteClimb(ex.input, { decimals: VALIDATION_DECIMALS })).filter((c) => c.cmp.status !== 'match')).toEqual([]);
    }
  });
});

describe('otros escenarios y casos', () => {
  it('V-1: ISA +10, 33 000 ft, 110 000 lb, 20 kt HW', () => {
    const r = solve2(scenario('V-1'));
    expect([r.timeMin, r.tableFuelLb, r.tableDistNm]).toEqual([26, 4100, 154]);
    expect([r.fuelLb, r.windDistNm, r.distNm]).toEqual([4000, 8.67, 145.33]);
  });

  it('V-2: ISA, aeropuerto a 3000 ft (ajuste interpolado −150) y viento de cola que suma', () => {
    const r = solve2(scenario('V-2'));
    expect(r.table.figure).toBe('FIGURE 57');
    expect(r.adjustment).toMatchObject({ fuelLb: -150, between: [2000, 4000] });
    expect([r.tableFuelLb, r.fuelLb]).toEqual([2400, 2250]);
    expect([r.windDistNm, r.distNm]).toEqual([4.33, 69.33]);
  });

  it('V-3: ISA, 35 000 ft, 85 000 lb, 30 kt HW', () => {
    const r = solve2(scenario('V-3'));
    expect([r.fuelLb, r.distNm]).toEqual([2500, 79]);
  });

  it('V-4: ISA +10, aeropuerto a 4000 ft (−300), 10 kt TW', () => {
    const r = solve2(scenario('V-4'));
    expect([r.tableFuelLb, r.adjustment.fuelLb, r.fuelLb]).toEqual([2400, -300, 2100]);
    expect([r.windDistNm, r.distNm]).toEqual([2.17, 63.17]);
  });

  it('interpola entre pesos y entre altitudes', () => {
    const r = solveEnRouteClimb({ ...scenario('V-5'), weightLb: 77500, cruiseAltFt: 31500 });
    expect(r.weights).toEqual([75000, 80000]);
    expect(r.rows.map((x) => x.altFt)).toEqual([31000, 32000]);
    // combustible ISA +10: 32000 → 2400/2200, 31000 → 2300/2100 → 2300 y 2200 → 2250
    expect(r.tableFuelLb).toBeCloseTo(2250, 10);
  });

  it('por debajo de 2000 ft no hay ajuste por aeropuerto elevado', () => {
    expect(solve2({ ...scenario('V-5'), airportElevationFt: 1000 }).adjustment).toMatchObject({ fuelLb: 0, belowTable: true });
  });

  it('mensajes claros fuera de la tabla, en el corte y en celdas vacías', () => {
    expect(() => solve2({ ...scenario('V-5'), cruiseAltFt: 15000 })).toThrow(/no publica las filas entre 6000 y 22000/);
    expect(() => solve2({ ...scenario('V-5'), weightLb: 130000 })).toThrow(/fuera de la tabla/);
    expect(() => solve2({ ...scenario('V-5'), weightLb: 120000, cruiseAltFt: 37000 })).toThrow(/celda vacía/);
    expect(() => solve2({ ...scenario('V-5'), cruiseAltFt: 1500 })).toThrow(/solo da tiempo y combustible/);
    expect(() => solve2({ ...scenario('V-5'), airportElevationFt: 13000 })).toThrow(ClimbError);
  });
});
