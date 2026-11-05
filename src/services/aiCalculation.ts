import { linearInterpolate, bilinearInterpolate } from '@/core/interpolation';
import { solveFuelPlan } from '@/core/fuelPlanning';
import { solveTakeoffEpr } from '@/core/takeoffEpr';
import { solveB737TakeoffEpr } from '@/core/takeoffEprB737';
import { solveEnRouteClimb } from '@/core/enRouteClimb';
import { convert, QUANTITIES, findQuantity } from '@/core/units';
import { parseNumber, formatPlain } from '@/core/format';
import { isIcaoCode } from '@/data/airports';
import { routeScope, SCOPES } from '@/exercises/registry';
import { MODULE_FIELDS, type AIStep, type AIField } from './aeroAnalysis';
import type { Locale } from '@/i18n/types';

export interface AICalculation {
  summary: string;
  outputs: Record<string, number>;
  outputUnits: Record<string, string>;
  procedure: string[];
  values: Record<string, string>;
}
const alias: Record<string,string> = { lbs:'lb', '°c':'c', '°f':'f', 'km/h':'kmh', knots:'kt', kts:'kt', feet:'ft', min:'min', minutes:'min', h:'h', hours:'h', mb:'hpa', 'in.hg':'inhg', 'in.hg.':'inhg' };
export const unitId = (unit: string) => alias[unit.trim().toLowerCase()] ?? unit.trim().toLowerCase();

/** Convert only within a known dimension. Raw extracted values are kept in the session. */
export function convertAIValue(value: number, from: string, to: string): number {
  const a = unitId(from), b = unitId(to);
  if (a === b || !a && !b) return value;
  if (a === 'h' && b === 'min') return value * 60;
  if (a === 'min' && b === 'h') return value / 60;
  const quantity = QUANTITIES.find(q => q.units.some(u => u.id === a) && q.units.some(u => u.id === b));
  if (!quantity) throw new Error(`Unidad incompatible / Incompatible unit: ${from || '?'} → ${to || '?'}`);
  return convert(quantity.id, value, a, b);
}

/** Validated form values, never merged with a calculator's example defaults. */
export function aiFormValues(step: AIStep, locale: Locale = 'es'): { values: Record<string,string>; conversions: string[] } {
  const values: Record<string,string> = {};
  const conversions: string[] = [];
  const fail = (es: string, en: string): never => { throw new Error(locale === 'es' ? es : en); };
  for (const def of MODULE_FIELDS[step.module]) {
    const field = step.fields.find(f => f.key === def.key);
    const raw = field?.value.trim() ?? '';
    values[def.key] = raw;
    const required = def.required || step.module === 'takeoff-epr' && def.key === 'b6' && step.fields.some(f => f.key === 'av' && f.value === 'b727');
    if (!raw) {
      if (required) fail(`Falta: ${def.label.es}.`, `Missing: ${def.label.en}.`);
      continue;
    }
    if (def.options) {
      if (!def.options.includes(raw)) fail(`Revisa: ${def.label.es}.`, `Review: ${def.label.en}.`);
      continue;
    }
    if (step.module === 'fuel' && ['dep','dst','alt'].includes(def.key)) {
      if (!isIcaoCode(raw)) fail(`Código OACI inválido: ${raw}.`, `Invalid ICAO code: ${raw}.`);
      continue;
    }
    let value = parseNumber(raw);
    if (!Number.isFinite(value)) fail(`Número inválido: ${def.label.es}.`, `Invalid number: ${def.label.en}.`);
    let expected = def.unit;
    if (step.module === 'takeoff-epr' && def.key === 'qnh') expected = step.fields.find(f => f.key === 'qu')?.value ?? '';
    if (step.module === 'takeoff-epr' && def.key === 'oat') expected = step.fields.find(f => f.key === 'tu')?.value ?? '';
    if (step.module === 'units' && def.key === 'v') expected = step.fields.find(f => f.key === 'u')?.value ?? '';
    if (expected) {
      const original = value;
      // The QNH/OAT/value unit is stated by its own selector (qu, tu, u): that selector is the confirmation.
      const statedBySelector = (step.module === 'takeoff-epr' && (def.key === 'qnh' || def.key === 'oat')) || (step.module === 'units' && def.key === 'v');
      if (field && !field.unit && statedBySelector) field.unit = expected;
      // A missing unit is not confirmation that the value has the required unit.
      if (!field?.unit) fail(`Confirma la unidad de ${def.label.es} (${expected}).`, `Confirm the unit for ${def.label.en} (${expected}).`);
      value = convertAIValue(value, field!.unit, expected);
      if (unitId(field!.unit) !== unitId(expected)) conversions.push(`${raw} ${field!.unit} = ${value} ${expected}`);
      else if (original !== value) throw new Error('Invalid conversion');
    }
    values[def.key] = String(value);
  }
  if (step.module === 'fuel') {
    if (values.dep === values.dst || values.dst === values.alt) fail('Revisa la ruta: destino y alterno deben ser diferentes.', 'Review the route: destination and alternate must differ.');
    for (const key of ['td','tw','ad','aw','hw','hfl','hm','taxi']) if (Number(values[key]) < 0) fail('Distancias, viento, peso, tiempo y combustible no pueden ser negativos.', 'Distance, wind, weight, time and fuel cannot be negative.');
    if (Number(values.hw) === 0 || Number(values.hm) === 0) fail('Peso y tiempo de espera deben ser mayores que cero.', 'Holding weight and duration must be greater than zero.');
  }
  if (step.module === 'en-route-climb' && (Number(values.wind) < 0 || Number(values.w) <= 0 || Number(values.alt) < Number(values.elev))) fail('Revisa peso, altitudes y magnitud del viento.', 'Review weight, altitudes and wind magnitude.');
  if (step.module === 'units') {
    const quantity = findQuantity(values.q);
    if (!quantity?.units.some(u => u.id === values.u) || !quantity.units.some(u => u.id === values.to)) fail('Las unidades no corresponden a la magnitud seleccionada.', 'The units do not match the selected quantity.');
  }
  return {values, conversions};
}

export function calculateAIStep(step: AIStep, locale: Locale = 'es', decimals = 2): AICalculation {
  const {values:v, conversions} = aiFormValues(step, locale);
  const n = (key: string) => parseNumber(v[key]);
  // mismo formato que las calculadoras y las resoluciones a mano (sin separador de miles)
  const fmt = (value: number) => formatPlain(value, decimals, locale === 'es' ? 'es-ES' : 'en-US');
  const procedure = [...conversions];
  let outputs: Record<string,number> = {}, outputUnits: Record<string,string> = {}, summary = '';
  const say = (es:string,en:string) => locale === 'es' ? es : en;
  if (step.module === 'linear') {
    const r = linearInterpolate({a:n('a'),b:n('b'),c:n('c'),a1:n('a1'),b1:n('b1')});
    const units = step.fields.find(f => f.key === 'a1')?.unit ?? '';
    const other = step.fields.find(f => f.key === 'b1')?.unit ?? '';
    if (unitId(units) !== unitId(other)) throw new Error(say('A1 y B1 deben usar la misma unidad.','A1 and B1 must use the same unit.'));
    outputs = {x:r.x}; outputUnits={x:units}; summary=`X = ${fmt(r.x)} ${units}`;
    procedure.push(`X = ${v.a1} + (${v.b1} − ${v.a1}) × (${v.c} − ${v.a}) / (${v.b} − ${v.a}) = ${fmt(r.x)}`);
    if (r.extrapolated) procedure.push(say('Extrapolación: el valor buscado está fuera del intervalo de la tabla.','Extrapolation: target input is outside the table interval.'));
  } else if (step.module === 'bilinear') {
    const r=bilinearInterpolate({x1:n('x1'),x2:n('x2'),x:n('x'),y1:n('y1'),y2:n('y2'),y:n('y'),q11:n('q11'),q21:n('q21'),q12:n('q12'),q22:n('q22')});
    const units=step.fields.find(f=>f.key==='q11')?.unit??'';
    if (['q21','q12','q22'].some(key=>unitId(step.fields.find(f=>f.key===key)?.unit??'')!==unitId(units))) throw new Error(say('Las cuatro celdas deben usar la misma unidad.','The four table cells must use the same unit.'));
    outputs={value:r.value};outputUnits={value:units};summary=`X = ${fmt(r.value)} ${units}`;
    procedure.push(`R1 = ${fmt(r.r1)}; R2 = ${fmt(r.r2)}`,`X = R1 + (R2 − R1) × (${v.y} − ${v.y1}) / (${v.y2} − ${v.y1}) = ${fmt(r.value)}`);
    if(r.extrapolated) procedure.push(say('Extrapolación fuera del intervalo de la tabla.','Extrapolation outside the table interval.'));
  } else if (step.module === 'units') {
    const value=convert(v.q,n('v'),v.u,v.to);outputs={value};outputUnits={value:v.to};const sym=(id:string)=>findQuantity(v.q)?.units.find(u=>u.id===id)?.symbol??id;summary=`${v.v} ${sym(v.u)} = ${fmt(value)} ${sym(v.to)}`;
    procedure.push(summary,say('Conversión mediante los factores del conversor de AeroPerf.','Conversion using AeroPerf unit conversion factors.'));
  } else if (step.module === 'fuel') {
    const scope=routeScope({origin:v.dep,destination:v.dst,alternate:v.alt});
    const r=solveFuelPlan({trip:{distanceNm:n('td'),windKt:n('tw'),windKind:v.tk as 'HW'|'TW',flightLevel:n('tfl')},alternate:{distanceNm:n('ad'),windKt:n('aw'),windKind:v.ak as 'HW'|'TW',flightLevel:n('afl')},holding:{weightLb:n('hw'),flightLevel:n('hfl'),minutes:n('hm')},taxiFuelLb:n('taxi'),contingencyPct:SCOPES[scope].contingencyPct},undefined,{decimals});
    outputs={fobLb:r.fobLb,enduranceMin:r.enduranceMin};outputUnits={fobLb:'lb',enduranceMin:'min'};summary=`FOB ${fmt(r.fobLb)} lb · ${fmt(r.enduranceMin)} min`;
    procedure.push('B737 · FAA FIGURE 67 / FIGURE 69',`T.F = ${fmt(r.trip.lookup.fuelLb)} + (${fmt(r.trip.deltaFuelLb)}) = ${fmt(r.trip.fuelLb)} lb`,`A.F = ${fmt(r.alternate.lookup.fuelLb)} + (${fmt(r.alternate.deltaFuelLb)}) = ${fmt(r.alternate.fuelLb)} lb`,`H.F = ${fmt(r.holding.lookup.ffPerEngineLbHr)} × ${v.hm} / 60 × ${r.holding.engines} = ${fmt(r.holding.fuelLb)} lb`,`FOB = ${fmt(r.trip.fuelLb)} + ${fmt(r.contingency.fuelLb)} + ${fmt(r.alternate.fuelLb)} + ${fmt(r.holding.fuelLb)} + ${v.taxi} = ${fmt(r.fobLb)} lb`,`${say('Autonomía','Endurance')} = ${fmt(r.trip.timeMin)} + ${fmt(r.contingency.timeMin)} + ${fmt(r.alternate.timeMin)} + ${v.hm} = ${fmt(r.enduranceMin)} min`);
  } else if (step.module === 'takeoff-epr') {
    const common={elevationFt:n('elev'),altimeter:n('qnh'),altimeterUnit:v.qu as 'inHg'|'mb',temperature:n('oat'),temperatureUnit:v.tu as 'C'|'F'};
    if(v.av==='b737') {
      const r=solveB737TakeoffEpr({...common,airConditioning:v.ac==='on',engineAntiIce:v.ai==='on'});outputs={epr:r.final};outputUnits={epr:''};summary=`EPR ${fmt(r.final)}`;
      procedure.push('B737 · FAA FIGURE 54 / FIGURE 55',`PA = ${v.elev} + (${r.pressure.correctionFt}) = ${r.pressure.pressureAltitudeFt} ft`,`TEMP LIMIT EPR = ${r.temp.table} + ${r.temp.airCondCorrection} = ${r.temp.limit}`,`PRESS LIMIT EPR = ${r.press.limit}`,`EPR = min(${r.temp.limit}, ${r.press.limit}) = ${r.final}`);
    } else {
      const r=solveTakeoffEpr({...common,airCondEng13:v.ac==='on',antiIceEng2:v.ai==='on',sixthStageBleed:v.b6==='on'});outputs={eng13:r.eng13.final,eng2:r.eng2.final};outputUnits={eng13:'',eng2:''};summary=`EPR 1/3 ${fmt(r.eng13.final)} · 2 ${fmt(r.eng2.final)}`;
      procedure.push('B727 · FAA FIGURE 82 / FIGURE 83',`PA = ${v.elev} + (${r.pressure.correctionFt}) = ${r.pressure.pressureAltitudeFt} ft`,`EPR 1/3 = ${r.eng13.table} + (${r.eng13.corrections.map(c=>c.value).join(' + ')||'0'}) = ${r.eng13.final}`,`EPR 2 = ${r.eng2.table} + (${r.eng2.corrections.map(c=>c.value).join(' + ')||'0'}) = ${r.eng2.final}`);
    }
  } else {
    const r=solveEnRouteClimb({weightLb:n('w'),cruiseAltFt:n('alt'),airportElevationFt:n('elev'),temp:v.t==='ISA10'?'ISA+10':'ISA',windKt:n('wind'),windKind:v.wk as 'HW'|'TW'},{decimals});
    outputs={fuelLb:r.fuelLb,distanceNm:r.distNm,timeMin:r.timeMin};outputUnits={fuelLb:'lb',distanceNm:'NM',timeMin:'min'};summary=`${fmt(r.fuelLb)} lb · ${fmt(r.distNm)} NM`;
    procedure.push(`B737 · FAA FIGURE ${v.t==='ISA10'?'58':'57'}`,`${say('Tiempo','Time')} = ${fmt(r.timeMin)} min`,`${say('Combustible','Fuel')} = ${fmt(r.tableFuelLb)} + (${fmt(r.adjustment.fuelLb)}) = ${fmt(r.fuelLb)} lb`,`Δd = ${fmt(r.timeMin)} / 60 × ${v.wind} = ${fmt(r.windDistNm)} NM`,`d = ${fmt(r.tableDistNm)} ${v.wk==='HW'?'−':'+'} ${fmt(r.windDistNm)} = ${fmt(r.distNm)} NM`);
  }
  if(Object.values(outputs).some(value=>!Number.isFinite(value))) throw new Error(say('Resultado no finito; revisa los datos.','Non-finite result; review the inputs.'));
  return {summary,outputs,outputUnits,procedure,values:v};
}

/** A dependency may only consume a named, unit-compatible output, never a model answer. */
export function applyAIBindings(step: AIStep, results: Record<string,AICalculation>): AIStep {
  const fields: AIField[] = step.fields.map(field=>({...field}));
  for(const binding of step.bindings??[]) {
    const result=results[binding.stepId];
    if(!step.dependsOn.includes(binding.stepId)||!result||!Object.hasOwn(result.outputs,binding.output)) throw new Error('Dependencia pendiente / Pending dependency');
    const definition=MODULE_FIELDS[step.module].find(field=>field.key===binding.key);
    if(!definition||definition.options) throw new Error('Destino de dependencia inválido / Invalid dependency target');
    const unit=result.outputUnits[binding.output];
    if(unit===undefined) throw new Error('Unidad de dependencia desconocida / Unknown dependency unit');
    if(definition.unit) convertAIValue(result.outputs[binding.output],unit,definition.unit);
    const replacement: AIField={key:binding.key,value:String(result.outputs[binding.output]),unit,source:'user',evidence:`${binding.stepId}.${binding.output}`,verified:true};
    const index=fields.findIndex(field=>field.key===binding.key);if(index<0)fields.push(replacement);else fields[index]=replacement;
  }
  return {...step,fields};
}
