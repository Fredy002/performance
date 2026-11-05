import { describe, expect, it } from 'vitest';
import { checkSteps } from '@/components/fuel/ExerciseValidation';
import { b727ScenarioCase } from '@/components/takeoff/eprForm';
import { B727_TAKEOFF_SCENARIOS, EPR_OAT_F, MAX_TAKEOFF_EPR, QNH_TO_PRESSURE_ALTITUDE } from '@/data/tables/takeoffEprData';
import { FIG81_B727_TAKEOFF_CONDITIONS } from '@/data/tables/fig81-b727-takeoff-conditions';
import type { FigCell } from '@/data/tables/types';
import { getTakeoffEprExercise } from '@/exercises/registry';
import { pressureAltitude, solveTakeoffEpr, TakeoffEprError, type TakeoffEprInput } from './takeoffEpr';

const scenario = (id: string) => b727ScenarioCase(B727_TAKEOFF_SCENARIOS.find((s) => s.id === id)!).input as TakeoffEprInput;

describe('datos de las láminas', () => {
  it('las condiciones G-1 a G-5 coinciden con la FIGURE 81 tal como se muestra', () => {
    const block = FIG81_B727_TAKEOFF_CONDITIONS.sheets[0].blocks[0];
    if (block.type !== 'table') throw new Error('tabla esperada');
    const rows = block.rows.filter((r): r is FigCell[] => Array.isArray(r));
    const cell = (label: string, col: number) => String(rows.find((r) => r[0].t === label)![col + 1].t);
    B727_TAKEOFF_SCENARIOS.forEach((s, i) => {
      expect(Number(cell('FIELD ELEVATION FT', i).replace(',', ''))).toBe(s.elevationFt);
      const alt = cell('ALTIMETER SETTING', i);
      expect(Number(alt.replace(/["mb ]/g, ''))).toBe(s.altimeter);
      expect(alt.includes('mb') ? 'mb' : 'inHg').toBe(s.altimeterUnit);
      const t = cell('TEMPERATURE', i).replace('–', '-');
      expect(Number(t.replace(/[^\d.-]/g, ''))).toBe(s.temperature);
      expect(t.includes('°C') ? 'C' : 'F').toBe(s.temperatureUnit);
      expect(cell('AIR COND ENGS 1 AND 3', i) === 'ON').toBe(s.airCondEng13);
      expect(cell('ANTI-ICE ENG 2', i) === 'ON').toBe(s.antiIceEng2);
      expect(cell('6TH STAGE BLEED', i) === 'ON').toBe(s.sixthStageBleed);
      expect(Number(cell('GROSS WEIGHT (X1000)', i))).toBe(s.grossWeightKlb);
      expect(Number(cell('FLAP POSITION', i).replace('°', ''))).toBe(s.flapsDeg);
    });
  });

  it('la tabla de reglaje y la de EPR tienen las filas y columnas de la fuente', () => {
    expect(QNH_TO_PRESSURE_ALTITUDE).toHaveLength(21);
    expect(QNH_TO_PRESSURE_ALTITUDE.find((r) => r.correctionFt === 400)).toEqual({ inHg: [29.44, 29.55], mb: [997, 1001], correctionFt: 400 });
    expect(MAX_TAKEOFF_EPR.map((r) => r.altFt)).toEqual([-1000, 0, 1000, 2000, 3000, 3856]);
    expect(EPR_OAT_F).toEqual([-9, -4, 5, 14, 23, 32, 41, 50, 59, 68, 77, 86, 95, 104, 113, 120]);
    MAX_TAKEOFF_EPR.forEach((r) => expect([r.eng13.length, r.eng2.length]).toEqual([16, 16]));
  });
});

describe('EPR de despegue · G-5 (resolución manual)', () => {
  const r = solveTakeoffEpr(scenario('G-5'));

  it('altitud de presión: 2150 + 400 = 2550 ft', () => {
    expect(r.pressure.correctionFt).toBe(400);
    expect(r.pressure.pressureAltitudeFt).toBe(2550);
    expect(r.pressure.boundary).toBeUndefined();
  });

  it('motores 1 y 3: 2,21 + (2,26 − 2,21)(2550 − 2000)/(3000 − 2000) = 2,2375 → 2,24', () => {
    expect(r.columns).toEqual([2]); // columna de 5 °F
    expect(r.eng13.byColumn[0]).toMatchObject({ a1: 2.21, b1: 2.26, exact: false });
    expect(r.eng13.table).toBeCloseTo(2.2375, 10);
    expect(r.eng13.corrections).toEqual([]);
    expect(r.eng13.final).toBe(2.24);
  });

  it('motor 2: 2,22 + (2,28 − 2,22)(550)/1000 = 2,253; antihielo ON −0,03 → 2,223 → 2,22', () => {
    expect(r.eng2.table).toBeCloseTo(2.253, 10);
    expect(r.eng2.corrections).toEqual([{ label: 'Antihielo del motor 2 ON', value: -0.03 }]);
    expect(r.eng2.corrected).toBeCloseTo(2.223, 10);
    expect(r.eng2.final).toBe(2.22);
  });

  it('el ejercicio de Pruebas coincide paso a paso con la resolución', () => {
    const ex = getTakeoffEprExercise('b727-epr-despegue-g5')!;
    if (ex.aircraftId !== 'b727') throw new Error('ejercicio del B727 esperado');
    expect(checkSteps(ex.expected, solveTakeoffEpr(ex.input)).filter((c) => c.cmp.status !== 'match')).toEqual([]);
  });
});

describe('EPR de despegue · otros escenarios y casos', () => {
  it('G-1: AC OFF suma 0,04 a 1 y 3; antihielo resta 0,03 al motor 2', () => {
    const r = solveTakeoffEpr(scenario('G-1'));
    expect(r.pressure.pressureAltitudeFt).toBe(1550); // 29.36" → +500
    expect(r.eng13.table).toBeCloseTo(2.183, 10); // 2,15 → 2,21 en la columna de 23 °F
    expect(r.eng13.corrections.map((c) => c.value)).toEqual([0.04]);
    expect(r.eng13.final).toBe(2.22);
    expect(r.eng2.final).toBe(2.16); // 2,193 − 0,03
  });

  it('G-2: milibares, °C y 6.ª etapa ON con 10 °C → −0,05 al motor 2', () => {
    const r = solveTakeoffEpr(scenario('G-2'));
    expect(r.pressure.pressureAltitudeFt).toBe(1900); // 1016 mb → −100
    expect(r.oatF).toBe(50);
    expect(r.eng13.final).toBe(2.14); // 2,139
    expect(r.eng2.corrections.map((c) => c.value)).toEqual([-0.05]);
    expect(r.eng2.final).toBe(2.11); // 2,159 − 0,05
  });

  it('G-3: desde 3856 ft se usa la última fila sin interpolar', () => {
    const r = solveTakeoffEpr(scenario('G-3'));
    expect(r.pressure.pressureAltitudeFt).toBe(4150); // 30.10" → −200
    expect(r.eng13.byColumn[0].exact).toBe(true);
    expect([r.eng13.final, r.eng2.final]).toEqual([2.14, 2.1]);
  });

  it('G-4: interpola entre 3000 y 3856 ft', () => {
    const r = solveTakeoffEpr(scenario('G-4'));
    expect(r.pressure.pressureAltitudeFt).toBe(3150); // 1010 mb → +100
    expect(r.oatF).toBe(23);
    expect(r.eng13.byColumn[0]).toMatchObject({ exact: false, a1: 2.23, b1: 2.23 });
    expect([r.eng13.final, r.eng2.final]).toEqual([2.23, 2.21]);
  });

  it('la 6.ª etapa no corrige por debajo de 10 °C (50 °F)', () => {
    const r = solveTakeoffEpr({ ...scenario('G-2'), temperature: 9 });
    expect(r.eng2.corrections).toEqual([]);
  });

  it('una OAT entre columnas se interpola también entre columnas', () => {
    const r = solveTakeoffEpr({ ...scenario('G-5'), temperature: 30 }); // entre 23 y 32 °F
    expect(r.columns).toEqual([4, 5]);
    expect(r.oatRatio).toBeCloseTo(7 / 9, 10);
    const [c23, c32] = r.eng13.byColumn.map((x) => x.value);
    expect(r.eng13.table).toBeCloseTo(c23 + (c32 - c23) * (7 / 9), 10);
  });

  it('el reglaje en el límite de dos filas avisa y usa la fila en la que es el límite superior', () => {
    const p = pressureAltitude(2000, 29.55, 'inHg');
    expect(p.correctionFt).toBe(400);
    expect(p.boundary).toEqual({ otherCorrectionFt: 300 });
  });

  it('valores fuera de las tablas dan un mensaje claro', () => {
    expect(() => pressureAltitude(1000, 1016, 'inHg')).toThrow(/fuera de la tabla.*Revisa la unidad/);
    expect(() => solveTakeoffEpr({ ...scenario('G-5'), temperature: 130 })).toThrow(TakeoffEprError);
    expect(() => solveTakeoffEpr({ ...scenario('G-5'), elevationFt: -2000 })).toThrow(/por debajo de la tabla/);
  });
});
