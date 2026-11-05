import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { Choice } from '@/components/ui/Choice';
import { InfoTip } from '@/components/ui/InfoTip';
import { NumberField, numberError } from '@/components/ui/NumberField';
import { HELP } from '@/content/help';
import type { ClimbInput, ClimbRead, ClimbResult } from '@/core/enRouteClimb';
import { formatPlain, parseNumber } from '@/core/format';
import type { ClimbFormKey, ClimbFormValues } from './climbForm';

/** Datos de la FIGURE 56: peso, altitud de crucero, elevación, temperatura y viento. */
export function ClimbForm({ values: v, set }: { values: ClimbFormValues; set: (k: ClimbFormKey, x: string) => void }) {
  const err = (k: ClimbFormKey) => numberError(v[k], parseNumber(v[k]), HELP.invalidNumber);
  return (
    <div className="grid grid-2 climb-form">
      <NumberField label="Peso al soltar frenos" unit="lb" value={v.w} onChange={(x) => set('w', x)} help={HELP.brakeReleaseWeight} error={err('w')} hint="Ejemplo: 75000" />
      <NumberField label="Altitud de crucero" unit="ft" value={v.alt} onChange={(x) => set('alt', x)} help={HELP.cruiseAlt} error={err('alt')} hint="Altitud de presión, p. ej. 31000" />
      <NumberField label="Elevación del aeropuerto" unit="ft" value={v.elev} onChange={(x) => set('elev', x)} help={HELP.airportElevation} error={err('elev')} />
      <Choice label="Temperatura" help={HELP.climbTemp} value={v.t} onChange={(x) => set('t', x)} options={[['ISA', 'ISA'], ['ISA10', 'ISA +10 °C']]} />
      <NumberField label="Viento medio" unit="kt" value={v.wind} onChange={(x) => set('wind', x)} help={HELP.climbWind} error={err('wind')} />
      <Choice label="Tipo de viento" value={v.wk} onChange={(x) => set('wk', x)} options={[['HW', 'Cara (HW)'], ['TW', 'Cola (TW)']]} />
    </div>
  );
}

/** Respuestas: combustible consumido y distancia recorrida en el ascenso. */
export function ClimbAnswers({ result: r, decimals, placeholder, footer }: { result?: ClimbResult; decimals: number; placeholder?: ReactNode; footer?: (key: string) => ReactNode }) {
  const p = (x: number) => formatPlain(x, decimals);
  return (
    <Card title="Respuestas">
      {r ? (
        <>
          <div className="answer-grid">
            <div className="answer">
              <div className="answer-label">
                a) Combustible consumido <InfoTip label="el combustible consumido">{HELP.climbFuel}</InfoTip>
              </div>
              <div className="answer-value">
                {p(r.fuelLb)}
                <small>lb</small>
              </div>
              {footer?.('fuel')}
            </div>
            <div className="answer">
              <div className="answer-label">
                b) Distancia recorrida <InfoTip label="la distancia recorrida">{HELP.climbDistance}</InfoTip>
              </div>
              <div className="answer-value">
                {p(r.distNm)}
                <small>NM</small>
              </div>
              {footer?.('distance')}
            </div>
          </div>
          <p className="calc-note">
            Tiempo de ascenso {p(r.timeMin)} min · TAS {p(r.tasKt)} kt · {r.table.figure} ({r.table.temp === 'ISA' ? 'ISA' : 'ISA +10 °C'}).
          </p>
        </>
      ) : (
        (placeholder ?? <div className="empty">Completa peso, altitudes y viento.</div>)
      )}
    </Card>
  );
}

/** Desarrollo como en la resolución manual: lectura, combustible y distancia. */
export function ClimbSteps({ result: r, input, decimals }: { result: ClimbResult; input: ClimbInput; decimals: number }) {
  const p = (x: number) => formatPlain(x, decimals);
  const exactCell = r.rows.length === 1 && r.weights.length === 1;
  const readLine = (label: string, q: ClimbRead, unit: string) => (
    <div className="calc-line" key={label}>
      <span className="calc-label">{label}</span>
      <span>
        {q.byRow.map((b, i) => (
          <span key={b.altFt}>
            {i > 0 && ' · '}
            {r.weights.length === 2 && (
              <>
                {r.rows.length === 2 && `${b.altFt} ft: `}
                {b.lo} + ({b.hi} − {b.lo})({input.weightLb} − {r.weights[0]}) / ({r.weights[1]} − {r.weights[0]}) = {p(b.value)}
              </>
            )}
          </span>
        ))}
        {r.rows.length === 2 && (
          <>
            {r.weights.length === 2 && ' → '}
            {p(q.byRow[0].value)} + ({p(q.byRow[1].value)} − {p(q.byRow[0].value)})({input.cruiseAltFt} − {q.byRow[0].altFt}) / ({q.byRow[1].altFt} − {q.byRow[0].altFt})
          </>
        )}{' '}
        = <b>{p(q.value)}</b> {unit}
      </span>
    </div>
  );
  return (
    <div className="grid grid-2">
      <Card title={`1. Lectura de la tabla (${r.table.figure})`}>
        <div className="stack gap-12">
          <p className="calc-text">
            {r.table.temp === 'ISA' ? 'Temperatura ISA' : 'Temperatura ISA +10 °C'}: tabla «En Route Climb 280/.70 {r.table.temp === 'ISA' ? 'ISA' : 'ISA +10 °C'}».
          </p>
          {exactCell ? (
            <>
              <div className="calc-line">
                <span className="calc-label">Celda</span>
                <span>
                  Fila {r.rows[0].altFt} ft · columna {r.weights[0]} lb → TIME/FUEL <b>{p(r.timeMin)}/{p(r.tableFuelLb)}</b> · DIST./TAS{' '}
                  <b>
                    {p(r.tableDistNm)}/{p(r.tasKt)}
                  </b>
                </span>
              </div>
              <p className="calc-text">
                Tiempo {p(r.timeMin)} min · combustible {p(r.tableFuelLb)} lb · distancia {p(r.tableDistNm)} NM · TAS {p(r.tasKt)} kt.
              </p>
            </>
          ) : (
            <>
              <p className="calc-text">
                {r.weights.length === 2 && `${input.weightLb} lb está entre las columnas de ${r.weights[0]} y ${r.weights[1]} lb. `}
                {r.rows.length === 2 && `${input.cruiseAltFt} ft está entre las filas de ${r.rows[0].altFt} y ${r.rows[1].altFt} ft. `}
                Se interpola cada valor.
              </p>
              {readLine('Tiempo', r.read.timeMin, 'min')}
              {readLine('Combustible', r.read.fuelLb, 'lb')}
              {readLine('Distancia', r.read.distNm, 'NM')}
              {readLine('TAS', r.read.tasKt, 'kt')}
            </>
          )}
        </div>
      </Card>
      <Card title="2. Combustible consumido">
        <div className="stack gap-12">
          <div className="calc-line">
            <span className="calc-label">Ajuste</span>
            <span>
              {r.adjustment.belowTable ? (
                <>Aeropuerto a {input.airportElevationFt} ft: por debajo de 2000 ft no hay ajuste → <b>0</b></>
              ) : r.adjustment.between ? (
                <>
                  {input.airportElevationFt} ft entre {r.adjustment.between[0]} y {r.adjustment.between[1]} ft → <b>{p(r.adjustment.fuelLb)}</b> lb
                </>
              ) : (
                <>
                  Aeropuerto a {input.airportElevationFt} ft → <b>{p(r.adjustment.fuelLb)}</b> lb
                </>
              )}
            </span>
          </div>
          <div className="calc-line">
            <span className="calc-label">Combustible</span>
            <span>
              {p(r.tableFuelLb)} {r.adjustment.fuelLb < 0 ? '−' : '+'} {p(Math.abs(r.adjustment.fuelLb))} = <b>{p(r.fuelLb)}</b> lb
            </span>
          </div>
          <p className="calc-text">El ajuste por elevación solo afecta al combustible: la tabla indica que el efecto en tiempo y distancia es despreciable.</p>
        </div>
      </Card>
      <Card title="3. Distancia recorrida (d = t · v)">
        <div className="stack gap-12">
          <div className="calc-line">
            <span className="calc-label">Viento</span>
            <span>
              d = ({p(r.timeMin)} min ÷ 60) × {p(input.windKt)} kt = <b>{p(r.windDistNm)}</b> NM
            </span>
          </div>
          <div className="calc-line">
            <span className="calc-label">Distancia</span>
            <span>
              {p(r.tableDistNm)} {input.windKind === 'HW' ? '−' : '+'} {p(r.windDistNm)} = <b>{p(r.distNm)}</b> NM
            </span>
          </div>
          <p className="calc-text">Viento de {input.windKind === 'HW' ? 'cara (HW): se resta' : 'cola (TW): se suma'}.</p>
        </div>
      </Card>
    </div>
  );
}
