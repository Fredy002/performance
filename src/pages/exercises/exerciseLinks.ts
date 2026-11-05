import { fuelFormQuery } from '@/components/fuel/fuelForm';
import { climbFormQuery } from '@/components/climb/climbForm';
import { eprFormQuery, type EprCase } from '@/components/takeoff/eprForm';
import { SCOPES, type Exercise } from '@/exercises/registry';
import { toolPath } from '@/tools/registry';

/** Etiqueta del ámbito: vuelo nacional/internacional o, en despegue, el escenario. */
export const exerciseScopeLabel = (e: Exercise) =>
  e.kind === 'fuel-plan' ? SCOPES[e.scope].label : e.kind === 'takeoff-epr' ? `Despegue · condiciones ${e.scenario}` : `Ascenso en ruta · condiciones ${e.scenario}`;

/** Herramienta en la que vive un ejercicio verificado, con sus datos cargados. */
export const exerciseToolHref = (e: Exercise) =>
  e.kind === 'fuel-plan'
    ? `${toolPath('fuel')}?${fuelFormQuery(e.input, e.airports)}`
    : e.kind === 'takeoff-epr'
      ? `${toolPath('takeoff-epr')}?${eprFormQuery({ aircraft: e.aircraftId, input: e.input } as EprCase)}`
      : `${toolPath('en-route-climb')}?${climbFormQuery(e.input)}`;

/** Nombre de la herramienta para «disponible en …». */
export const exerciseToolName = (e: Exercise) =>
  e.kind === 'fuel-plan' ? 'Planificación de combustible' : e.kind === 'takeoff-epr' ? 'EPR de despegue' : 'Ascenso en ruta';
