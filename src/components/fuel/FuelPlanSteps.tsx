import { Card } from '@/components/ui/Card';
import { formatPlain } from '@/core/format';
import type { FuelPlanResult, LegResult } from '@/core/fuelPlanning';
import type { WindKind } from '@/data/tables/types';
import type { FuelPlanInput } from '@/core/fuelPlanning';

type Fmt = (v: number) => string;

/** Lectura de la tabla (exacta o interpolada) y corrección por viento de un tramo. */
function LegSteps({ leg, windKt, kind, timeTag, fuelTag, p }: { leg: LegResult; windKt: number; kind: WindKind; timeTag: string; fuelTag: string; p: Fmt }) {
  const { lookup } = leg;
  const [r1, r2] = lookup.rows;
  const op = kind === 'HW' ? '+' : '−';
  const interpLine = (label: string, a1: number, b1: number, x: number) => (
    <div className="calc-line" key={label}>
      <span className="calc-label">{label}</span>
      <span>
        {a1} + ({b1} − {a1})({formatPlain(lookup.distanceNm, 2)} − {r1.distanceNm}) / ({r2.distanceNm} − {r1.distanceNm}) = <b>{p(x)}</b>
      </span>
    </div>
  );
  return (
    <div className="stack" style={{ gap: 10 }}>
      {lookup.interpolated ? (
        <>
          <p className="muted" style={{ fontSize: 14 }}>
            {formatPlain(lookup.distanceNm, 2)} NM no está en la tabla: se interpola entre las filas de {r1.distanceNm} y{' '}
            {r2.distanceNm} NM.
          </p>
          {lookup.gap && (
            <div className="alert alert-warning" role="note" style={{ fontSize: 13 }}>
              <span>
                Entre {lookup.gap.afterNm} y {lookup.gap.beforeNm} NM la tabla no publica filas intermedias: se interpola
                directamente entre ambas (método del curso). Es una aproximación.
              </span>
            </div>
          )}
          {interpLine('TAS', r1.tasKt, r2.tasKt, lookup.tasKt)}
          {interpLine('Tiempo', r1.airTimeMin, r2.airTimeMin, lookup.airTimeMin)}
          {interpLine('Combustible', r1.fuelLb, r2.fuelLb, lookup.fuelLb)}
        </>
      ) : (
        <div className="calc-line">
          <span className="calc-label">Tabla</span>
          <span>
            Fila exacta de {lookup.distanceNm} NM → TAS <b>{p(lookup.tasKt)}</b> kt · tiempo <b>{p(lookup.airTimeMin)}</b> min ·
            combustible <b>{p(lookup.fuelLb)}</b> lb
          </span>
        </div>
      )}
      <p className="muted" style={{ fontSize: 14 }}>
        Viento de {kind === 'HW' ? 'cara (HW): se suma' : 'cola (TW): se resta'}.
      </p>
      <div className="calc-line">
        <span className="calc-label">Δ tiempo</span>
        <span>
          {p(lookup.airTimeMin)} × {p(windKt)} ÷ {p(lookup.tasKt)} = <b>{p(Math.abs(leg.deltaTimeMin))}</b>
        </span>
      </div>
      <div className="calc-line">
        <span className="calc-label">{timeTag}</span>
        <span>
          {p(lookup.airTimeMin)} {op} {p(Math.abs(leg.deltaTimeMin))} = <b>{p(leg.timeMin)}</b> min
        </span>
      </div>
      <div className="calc-line">
        <span className="calc-label">Δ combustible</span>
        <span>
          {p(lookup.fuelLb)} × {p(windKt)} ÷ {p(lookup.tasKt)} = <b>{p(Math.abs(leg.deltaFuelLb))}</b>
        </span>
      </div>
      <div className="calc-line">
        <span className="calc-label">{fuelTag}</span>
        <span>
          {p(lookup.fuelLb)} {op} {p(Math.abs(leg.deltaFuelLb))} = <b>{p(leg.fuelLb)}</b> lb
        </span>
      </div>
    </div>
  );
}

function HoldingSteps({ r, weightLb, p }: { r: FuelPlanResult['holding']; weightLb: number; p: Fmt }) {
  const h = r.lookup;
  const fl = (v: number) => `FL ${String(v).padStart(3, '0')}`;
  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="calc-line">
        <span className="calc-label">Tabla</span>
        <span>
          {fl(h.flightLevel)} · {formatPlain(weightLb, 0)} lb →{' '}
          {h.interpolated && `interpolado entre ${h.flightLevels.map(fl).join(' y ')} / ${h.weightsKlb.map((w) => w * 1000).join(' y ')} lb → `}
          FF <b>{p(h.ffPerEngineLbHr)}</b> lb/h por motor (EPR {formatPlain(h.epr, 2)} · IAS {formatPlain(h.iasKt, 0)} kt)
        </span>
      </div>
      <div className="calc-line">
        <span className="calc-label">Por motor</span>
        <span>
          {p(h.ffPerEngineLbHr)} × {p(r.minutes)} ÷ 60 = <b>{p(r.fuelPerEngineLb)}</b> lb
        </span>
      </div>
      <div className="calc-line">
        <span className="calc-label">H.F</span>
        <span>
          {p(r.fuelPerEngineLb)} × {r.engines} motores = <b>{p(r.fuelLb)}</b> lb
        </span>
      </div>
    </div>
  );
}

/** Desarrollo completo: tramo, alterno, espera y resumen, con los decimales de Ajustes. */
export function FuelPlanSteps({ result: r, input, decimals }: { result: FuelPlanResult; input: FuelPlanInput; decimals: number }) {
  const p: Fmt = (v) => formatPlain(v, decimals);
  return (
    <>
      <h2 className="section-title">Desarrollo</h2>
      <div className="grid grid-2">
        <Card title={`1. Origen – destino · ${formatPlain(input.trip.distanceNm, 2)} NM`}>
          <LegSteps leg={r.trip} windKt={input.trip.windKt} kind={input.trip.windKind} timeTag="T.T" fuelTag="T.F" p={p} />
        </Card>
        <Card title={`2. Destino – alterno · ${formatPlain(input.alternate.distanceNm, 2)} NM`}>
          <LegSteps leg={r.alternate} windKt={input.alternate.windKt} kind={input.alternate.windKind} timeTag="A.T" fuelTag="A.F" p={p} />
        </Card>
        <Card title="3. Espera (holding)">
          <HoldingSteps r={r.holding} weightLb={input.holding.weightLb} p={p} />
        </Card>
        <Card title="4. Resumen">
          <div className="grid grid-2" style={{ gap: 18 }}>
            <div className="kv">
              <div className="k">T.T</div>
              <div className="v">{p(r.trip.timeMin)}</div>
              <div className="k">A.T</div>
              <div className="v">{p(r.alternate.timeMin)}</div>
              <div className="k">T.H (espera)</div>
              <div className="v">{p(r.holding.minutes)}</div>
              <div className="k" style={{ fontWeight: 700 }}>Autonomía (min)</div>
              <div className="v" style={{ color: 'var(--result)' }}>{p(r.enduranceMin)}</div>
            </div>
            <div className="kv">
              <div className="k">T.F</div>
              <div className="v">{p(r.trip.fuelLb)}</div>
              <div className="k">A.F</div>
              <div className="v">{p(r.alternate.fuelLb)}</div>
              <div className="k">H.F</div>
              <div className="v">{p(r.holding.fuelLb)}</div>
              <div className="k">Taxi</div>
              <div className="v">{p(r.taxiFuelLb)}</div>
              <div className="k" style={{ fontWeight: 700 }}>FOB (lb)</div>
              <div className="v" style={{ color: 'var(--result)' }}>{p(r.fobLb)}</div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
