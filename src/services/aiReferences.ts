/**
 * Referencias a las tablas de condiciones digitalizadas (FIGURE 53 R-x, FIGURE 56 V-x, FIGURE 81 G-x).
 *
 * Muchos enunciados solo dicen «para condiciones V-5, figuras 56, 57 y 58»: los datos están en la
 * tabla de condiciones, no en el enunciado. AeroPerf ya tiene esas tablas transcritas y verificadas,
 * así que los valores se toman de ahí (fuente «reference», con la fila como evidencia), nunca del modelo.
 * Solo se rellenan los campos vacíos: lo que el enunciado diga explícitamente tiene prioridad.
 */
import type { Locale } from '@/i18n/types';
import { B737_CLIMB_SCENARIOS } from '@/data/tables/enRouteClimbData';
import { B727_TAKEOFF_SCENARIOS, B737_TAKEOFF_SCENARIOS } from '@/data/tables/takeoffEprData';
import type { AIAnalysis, AIField, AIModule, AIStep } from './aeroAnalysis';

export interface ScenarioReference {
  /** «V-5», «R-1», «G-3» */
  id: string;
  module: AIModule;
  figure: string;
  /** Campo → [valor, unidad, texto de la fila en la fuente] */
  values: Record<string, [string, string, string]>;
}

const onOff = (b: boolean) => (b ? 'on' : 'off');

function lookup(id: string): ScenarioReference | undefined {
  const climb = B737_CLIMB_SCENARIOS.find((s) => s.id === id);
  if (climb) {
    const wk = climb.windKt >= 0 ? 'HW' : 'TW';
    return {
      id,
      module: 'en-route-climb',
      figure: 'FIGURE 56',
      values: {
        aircraft: ['B737', '', 'B-737 – En Route Climb'],
        w: [String(climb.weightLb), 'lb', `BRK REL WEIGHT (X1000) ${climb.weightLb / 1000}`],
        alt: [String(climb.cruiseAltFt), 'ft', `CRUISE PRESS ALT ${climb.cruiseAltFt}`],
        elev: [String(climb.airportElevationFt), 'ft', `AIRPORT ELEVATION ${climb.airportElevationFt}`],
        t: [climb.temp === 'ISA+10' ? 'ISA10' : 'ISA', '', `ISA TEMPERATURE ${climb.temp === 'ISA+10' ? '+10°' : 'ISA'}`],
        wind: [String(Math.abs(climb.windKt)), 'kt', `AVG WIND COMP ${Math.abs(climb.windKt)} ${wk}`],
        wk: [wk, '', `AVG WIND COMP ${Math.abs(climb.windKt)} ${wk}`],
      },
    };
  }
  const b737 = B737_TAKEOFF_SCENARIOS.find((s) => s.id === id);
  if (b737) {
    return {
      id,
      module: 'takeoff-epr',
      figure: 'FIGURE 53',
      values: {
        av: ['b737', '', 'B-737 – Takeoff'],
        elev: [String(b737.elevationFt), 'ft', `FIELD ELEVATION ${b737.elevationFt}`],
        qnh: [String(b737.altimeter), b737.altimeterUnit, `ALTIMETER SETTING ${b737.altimeter}${b737.altimeterUnit === 'mb' ? ' mb' : '"'}`],
        qu: [b737.altimeterUnit, '', `ALTIMETER SETTING ${b737.altimeter}${b737.altimeterUnit === 'mb' ? ' mb' : '"'}`],
        oat: [String(b737.temperature), b737.temperatureUnit, `TEMPERATURE (OAT) ${b737.temperature} °${b737.temperatureUnit}`],
        tu: [b737.temperatureUnit, '', `TEMPERATURE (OAT) ${b737.temperature} °${b737.temperatureUnit}`],
        ac: [onOff(b737.airConditioning), '', `AIR CONDITIONING ${onOff(b737.airConditioning).toUpperCase()}`],
        ai: [onOff(b737.engineAntiIce), '', `ENGINE ANTI-ICE ${onOff(b737.engineAntiIce).toUpperCase()}`],
      },
    };
  }
  const b727 = B727_TAKEOFF_SCENARIOS.find((s) => s.id === id);
  if (b727) {
    return {
      id,
      module: 'takeoff-epr',
      figure: 'FIGURE 81',
      values: {
        av: ['b727', '', 'B-727 – Takeoff'],
        elev: [String(b727.elevationFt), 'ft', `FIELD ELEVATION FT ${b727.elevationFt}`],
        qnh: [String(b727.altimeter), b727.altimeterUnit, `ALTIMETER SETTING ${b727.altimeter}${b727.altimeterUnit === 'mb' ? ' mb' : '"'}`],
        qu: [b727.altimeterUnit, '', `ALTIMETER SETTING ${b727.altimeter}${b727.altimeterUnit === 'mb' ? ' mb' : '"'}`],
        oat: [String(b727.temperature), b727.temperatureUnit, `TEMPERATURE ${b727.temperature} °${b727.temperatureUnit}`],
        tu: [b727.temperatureUnit, '', `TEMPERATURE ${b727.temperature} °${b727.temperatureUnit}`],
        ac: [onOff(b727.airCondEng13), '', `AIR COND ENGS 1 AND 3 ${onOff(b727.airCondEng13).toUpperCase()}`],
        ai: [onOff(b727.antiIceEng2), '', `ANTI-ICE ENG 2 ${onOff(b727.antiIceEng2).toUpperCase()}`],
        b6: [onOff(b727.sixthStageBleed), '', `6TH STAGE BLEED ${onOff(b727.sixthStageBleed).toUpperCase()}`],
      },
    };
  }
  return undefined;
}

/** Palabras o figuras que confirman a qué tabla se refiere la letra (evita confundir «V-5» suelto). */
const CONTEXT: Record<string, RegExp> = {
  V: /ascenso|climb|en.?route|\b5[678]\b|figuras?\s*5[678]|figure\s*5[678]/i,
  R: /EPR|despegue|take.?off|\b5[345]\b/i,
  G: /EPR|despegue|take.?off|\b8[123]\b|\b727\b/i,
};

/** Condiciones citadas en el enunciado: «condiciones V-5», «conditions R-1», «G-5». */
export function findScenarioReference(text: string): ScenarioReference | undefined {
  const matches = [...text.matchAll(/\b([VRG])\s*[-–‐]\s*([1-5])\b/g)];
  const ids = [...new Set(matches.map((m) => `${m[1]}-${m[2]}`))];
  // una sola referencia y con contexto coherente: si hay varias, la decide el usuario
  if (ids.length !== 1) return undefined;
  const [letter] = ids[0];
  if (!CONTEXT[letter].test(text)) return undefined;
  return lookup(ids[0]);
}

/**
 * Completa el análisis con los valores de la tabla de condiciones citada. Si el modelo no creó el
 * paso (p. ej. porque «faltaban datos»), lo crea para el módulo de esa tabla.
 */
export function withScenarioReference(analysis: AIAnalysis, extraText: string, locale: Locale): AIAnalysis {
  const ref = findScenarioReference(`${analysis.text}\n${extraText}`);
  if (!ref) return analysis;
  const es = locale === 'es';
  const fill = (step: AIStep): AIStep => {
    const fields: AIField[] = [...step.fields];
    for (const [key, [value, unit, row]] of Object.entries(ref.values)) {
      const current = fields.find((f) => f.key === key);
      if (current?.value) continue;
      const field: AIField = {
        key,
        value,
        unit,
        source: 'reference',
        evidence: `${ref.figure} · ${es ? 'condiciones' : 'conditions'} ${ref.id}: ${row}`,
        verified: false,
      };
      if (current) fields[fields.indexOf(current)] = field;
      else fields.push(field);
    }
    return { ...step, fields };
  };
  const steps = analysis.steps.some((s) => s.module === ref.module)
    ? analysis.steps.map((s) => (s.module === ref.module ? fill(s) : s))
    : analysis.steps.length === 0
      ? [fill({ id: 'step-1', module: ref.module, fields: [], dependsOn: [], bindings: [] })]
      : analysis.steps;
  const note = es
    ? `Datos de ${ref.id} tomados de la tabla de condiciones digitalizada (${ref.figure}).`
    : `${ref.id} data taken from the digitized conditions table (${ref.figure}).`;
  return { ...analysis, steps, warnings: [...analysis.warnings, note] };
}
