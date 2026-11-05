import { describe, expect, it } from 'vitest';
import { calculateAIStep } from './aiCalculation';
import { parseExerciseText } from './aeroEngine';
import { findScenarioReference, withScenarioReference } from './aiReferences';
import type { AIAnalysis } from './aeroAnalysis';

const PHOTO = 'Determinar la distancia recorrida durante un ascenso en ruta para condiciones V-5, figuras 56, 57 y 58.';

describe('referencias a tablas de condiciones', () => {
  it('el enunciado de la foto se resuelve en local con los datos de V-5 (FIGURE 56)', () => {
    const analysis = withScenarioReference(parseExerciseText(PHOTO)!, '', 'es');
    expect(analysis.steps.map((s) => s.module)).toEqual(['en-route-climb']);
    const f = Object.fromEntries(analysis.steps[0].fields.map((x) => [x.key, x]));
    expect([f.w.value, f.alt.value, f.elev.value, f.t.value, f.wind.value, f.wk.value]).toEqual(['75000', '31000', '2000', 'ISA10', '40', 'HW']);
    expect(f.w).toMatchObject({ source: 'reference', unit: 'lb', evidence: 'FIGURE 56 · condiciones V-5: BRK REL WEIGHT (X1000) 75' });
    const calc = calculateAIStep(analysis.steps[0], 'es', 2);
    expect(calc.outputs.distanceNm).toBeCloseTo(61.33, 2);
    expect(calc.outputs.fuelLb).toBe(2000);
  });

  it('EPR: G-5 es B727 (FIGURE 81) y R-5 es B737 (FIGURE 53)', () => {
    const g5 = withScenarioReference(parseExerciseText('Determinar el EPR para despegue según condiciones G-5, figuras 81, 82 y 83.')!, '', 'es');
    const c1 = calculateAIStep(g5.steps[0], 'es', 2);
    expect([c1.outputs.eng13, c1.outputs.eng2]).toEqual([2.24, 2.22]);
    const r5 = withScenarioReference(parseExerciseText('Determinar el EPR para despegue para condiciones R-5, figuras 53, 54 y 55.')!, '', 'es');
    expect(calculateAIStep(r5.steps[0], 'es', 2).outputs.epr).toBe(1.98);
  });

  it('los datos explícitos del enunciado tienen prioridad sobre la tabla', () => {
    const base: AIAnalysis = {
      text: 'Ascenso en ruta, condiciones V-5, pero con viento de 20 kt HW',
      steps: [{ id: 'step-1', module: 'en-route-climb', dependsOn: [], bindings: [], fields: [{ key: 'wind', value: '20', unit: 'kt', source: 'statement', evidence: '20 kt', verified: false }] }],
      warnings: [],
      unsupported: [],
    };
    const wind = withScenarioReference(base, '', 'es').steps[0].fields.find((x) => x.key === 'wind')!;
    expect(wind).toMatchObject({ value: '20', source: 'statement' });
  });

  it('crea el paso si el modelo no lo creó y no adivina con referencias ambiguas', () => {
    const empty: AIAnalysis = { text: 'ascenso en ruta para condiciones V-2, figuras 56 a 58', steps: [], warnings: [], unsupported: [] };
    expect(withScenarioReference(empty, '', 'es').steps[0].module).toBe('en-route-climb');
    expect(findScenarioReference('condiciones V-1 y V-2 de la figura 56')).toBeUndefined();
    expect(findScenarioReference('V-5 sin contexto')).toBeUndefined();
  });
});
