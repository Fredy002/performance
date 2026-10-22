import { CircleAlert, CircleCheck, ClipboardCheck, RotateCcw, Table } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { NumberField } from '@/components/ui/NumberField';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatPlain } from '@/core/format';
import { solveFuelPlan, type FuelPlanInput, type FuelPlanResult, type LegResult } from '@/core/fuelPlanning';
import { LookupError } from '@/core/tableLookup';
import { getTable } from '@/data/tables';
import type { WindKind } from '@/data/tables/types';
import type { FuelPlanExercise } from '@/exercises/registry';
import { compareWithWritten, type MatchStatus } from '@/exercises/validation';
import { useFormValues } from '@/hooks/useFormValues';

const p = formatPlain;

const STATUS: Record<MatchStatus, { label: string; icon: typeof CircleCheck }> = {
  match: { label: 'Coincide', icon: CircleCheck },
  rounding: { label: 'Redondeo', icon: CircleCheck },
  mismatch: { label: 'No coincide', icon: CircleAlert },
};

function StatusChip({ status, diff }: { status: MatchStatus; diff?: number }) {
  const S = STATUS[status];
  return (
    <span className={`status status-${status}`} title={S.label}>
      <S.icon size={13} />
      <span className="status-text">
        {S.label}
        {status !== 'match' && diff !== undefined && ` (Δ ${p(Math.abs(diff), 3)})`}
      </span>
    </span>
  );
}

function toForm(input: FuelPlanInput): Record<string, string> {
  return {
    td: String(input.trip.distanceNm),
    tw: String(input.trip.windKt),
    tk: input.trip.windKind,
    tfl: String(input.trip.flightLevel ?? ''),
    ad: String(input.alternate.distanceNm),
    aw: String(input.alternate.windKt),
    ak: input.alternate.windKind,
    afl: String(input.alternate.flightLevel ?? ''),
    hw: String(input.holding.weightLb),
    hfl: String(input.holding.flightLevel),
    hm: String(input.holding.minutes),
    taxi: String(input.taxiFuelLb),
  };
}

function WindSelect({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      <select className="select" style={{ height: 46 }} value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
        <option value="HW">Cara (HW) · suma</option>
        <option value="TW">Cola (TW) · resta</option>
      </select>
    </div>
  );
}

/** Desarrollo de un tramo: lectura en la tabla (interpolada o exacta) y corrección por viento. */
function LegSteps({ leg, windKt, kind, timeTag, fuelTag }: { leg: LegResult; windKt: number; kind: WindKind; timeTag: string; fuelTag: string }) {
  const { lookup } = leg;
  const [r1, r2] = lookup.rows;
  const op = kind === 'HW' ? '+' : '−';
  const interpLine = (label: string, a1: number, b1: number, x: number) => (
    <div className="calc-line" key={label}>
      <span className="calc-label">{label}</span>
      <span>
        {p(a1)} + ({p(b1)} − {p(a1)})({p(lookup.distanceNm)} − {r1.distanceNm}) / ({r2.distanceNm} − {r1.distanceNm}) ={' '}
        <b>{p(x)}</b>
      </span>
    </div>
  );
  return (
    <div className="stack" style={{ gap: 10 }}>
      {lookup.interpolated ? (
        <>
          <p className="muted" style={{ fontSize: 14 }}>
            {lookup.distanceNm} NM no está en la tabla: se interpola entre las filas de {r1.distanceNm} y {r2.distanceNm} NM.
          </p>
          {interpLine('TAS', r1.tasKt, r2.tasKt, lookup.tasKt)}
          {interpLine('Tiempo', r1.airTimeMin, r2.airTimeMin, lookup.airTimeMin)}
          {interpLine('Combustible', r1.fuelLb, r2.fuelLb, lookup.fuelLb)}
        </>
      ) : (
        <div className="calc-line">
          <span className="calc-label">Tabla</span>
          <span>
            Fila exacta de {lookup.distanceNm} NM → TAS <b>{p(lookup.tasKt)}</b> kt · tiempo <b>{p(lookup.airTimeMin)}</b> min · combustible{' '}
            <b>{p(lookup.fuelLb)}</b> lb
          </span>
        </div>
      )}
      <p className="muted" style={{ fontSize: 14 }}>
        Viento de {kind === 'HW' ? 'cara (HW): se suma' : 'cola (TW): se resta'}.
      </p>
      <div className="calc-line">
        <span className="calc-label">Δ tiempo</span>
        <span>
          {p(lookup.airTimeMin)} × {p(windKt)} ÷ {p(lookup.tasKt)} = <b>{p(Math.abs(leg.deltaTimeMin), 3)}</b>
        </span>
      </div>
      <div className="calc-line">
        <span className="calc-label">{timeTag}</span>
        <span>
          {p(lookup.airTimeMin)} {op} {p(Math.abs(leg.deltaTimeMin), 3)} = <b>{p(leg.timeMin, 3)}</b> min
        </span>
      </div>
      <div className="calc-line">
        <span className="calc-label">Δ combustible</span>
        <span>
          {p(lookup.fuelLb)} × {p(windKt)} ÷ {p(lookup.tasKt)} = <b>{p(Math.abs(leg.deltaFuelLb), 3)}</b>
        </span>
      </div>
      <div className="calc-line">
        <span className="calc-label">{fuelTag}</span>
        <span>
          {p(lookup.fuelLb)} {op} {p(Math.abs(leg.deltaFuelLb), 2)} = <b>{p(leg.fuelLb, 2)}</b> lb
        </span>
      </div>
    </div>
  );
}

function HoldingSteps({ r, weightLb }: { r: FuelPlanResult['holding']; weightLb: number }) {
  const h = r.lookup;
  const fl = (v: number) => `FL ${String(v).padStart(3, '0')}`;
  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="calc-line">
        <span className="calc-label">Tabla</span>
        <span>
          {fl(h.flightLevel)} · {p(weightLb)} lb →{' '}
          {h.interpolated
            ? `interpolado entre ${h.flightLevels.map(fl).join(' y ')} / ${h.weightsKlb.map((w) => w * 1000).join(' y ')} lb → `
            : ''}
          FF <b>{p(h.ffPerEngineLbHr, 1)}</b> lb/h por motor (EPR {p(h.epr)} · IAS {p(h.iasKt, 0)} kt)
        </span>
      </div>
      <div className="calc-line">
        <span className="calc-label">Por motor</span>
        <span>
          {p(h.ffPerEngineLbHr, 1)} × {p(r.minutes)} ÷ 60 = <b>{p(r.fuelPerEngineLb)}</b> lb
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

export function FuelPlanExerciseView({ exercise }: { exercise: FuelPlanExercise }) {
  const defaults = useMemo(() => toForm(exercise.input), [exercise]);
  const form = useFormValues(defaults);
  const v = form.values;
  const n = form.numbers;

  const input: FuelPlanInput = {
    trip: { distanceNm: n.td, windKt: n.tw, windKind: v.tk === 'HW' ? 'HW' : 'TW', flightLevel: n.tfl },
    alternate: { distanceNm: n.ad, windKt: n.aw, windKind: v.ak === 'TW' ? 'TW' : 'HW', flightLevel: n.afl },
    holding: { weightLb: n.hw, flightLevel: n.hfl, minutes: n.hm },
    taxiFuelLb: n.taxi,
  };

  const required = [n.td, n.tw, n.ad, n.aw, n.hw, n.hfl, n.hm, n.taxi];
  const incomplete = required.some((x) => !Number.isFinite(x));
  const isOriginal = Object.keys(defaults).every((k) => v[k] === defaults[k]);

  // el objeto `input` se recrea en cada render; su serialización sirve como clave estable
  const inputKey = JSON.stringify(input);
  const outcome = useMemo((): { result?: FuelPlanResult; error?: string } => {
    if (incomplete) return {};
    try {
      return { result: solveFuelPlan(JSON.parse(inputKey) as FuelPlanInput) };
    } catch (e) {
      return { error: e instanceof LookupError ? e.message : 'Error de cálculo' };
    }
  }, [inputKey, incomplete]);

  const r = outcome.result;
  const checks = r ? exercise.expected.map((s) => ({ step: s, cmp: compareWithWritten(s.written, s.pick(r)) })) : [];
  const answers = checks.filter((c) => c.step.answer);
  const counts = {
    match: checks.filter((c) => c.cmp.status === 'match').length,
    rounding: checks.filter((c) => c.cmp.status === 'rounding').length,
    mismatch: checks.filter((c) => c.cmp.status === 'mismatch').length,
  };
  const field = (k: string, label: string, unit?: string) => (
    <NumberField label={label} value={v[k]} onChange={(x) => form.set(k, x)} unit={unit} invalid={v[k] !== '' && Number.isNaN(n[k])} />
  );

  return (
    <>
      <PageHeader
        eyebrow={<><ClipboardCheck size={14} /> Pruebas · {exercise.aircraft}</>}
        title={exercise.title}
        subtitle={exercise.summary}
        actions={
          !isOriginal && (
            <button className="btn" onClick={form.reset}>
              <RotateCcw size={16} /> Restaurar enunciado
            </button>
          )
        }
      />

      <div className="grid grid-calc">
        <Card title="Enunciado">
          <ul className="statement">
            {exercise.statement.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p style={{ marginTop: 14, fontWeight: 600, fontSize: 14 }}>Se pide:</p>
          <ul className="statement" style={{ fontSize: 14, marginTop: 4 }}>
            {exercise.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
          <div style={{ marginTop: 14 }}>
            <Alert kind="info">
              {exercise.assumptions.map((a) => (
                <p key={a} style={{ marginBottom: 4 }}>
                  {a}
                </p>
              ))}
            </Alert>
          </div>
          <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>
            Tablas usadas:{' '}
            {exercise.tables.map((id, i) => (
              <span key={id}>
                {i > 0 && ' · '}
                <Link to={`/tables/${id}`}>{getTable(id)?.title ?? id}</Link>
              </span>
            ))}
          </p>
        </Card>

        <Card title="Respuestas">
          {r ? (
            <div className="answer-grid">
              {answers.map(({ step, cmp }) => (
                <div className="answer" key={step.label}>
                  <div className="answer-label">
                    {step.answer}) {step.label}
                  </div>
                  <div className="answer-value">
                    {p(cmp.actual)}
                    <small>{step.unit}</small>
                  </div>
                  {isOriginal && (
                    <div className="row" style={{ marginTop: 6, gap: 6 }}>
                      <span className="muted" style={{ fontSize: 12 }}>
                        Cuaderno: {step.written}
                      </span>
                      <StatusChip status={cmp.status} diff={cmp.diff} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">{outcome.error ? 'Revisa los datos.' : 'Completa los datos.'}</div>
          )}
          {r && (
            <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>
              Autonomía: {Math.floor(r.enduranceMin / 60)} h {p(r.enduranceMin % 60, 0)} min.
            </p>
          )}
        </Card>
      </div>

      <h2 className="section-title">Datos</h2>
      <Card>
        <div className="stack">
          <div>
            <p className="field-label" style={{ marginBottom: 8 }}>
              Origen – destino ({exercise.route.trip.join(' – ')})
            </p>
            <div className="inline-fields">
              {field('td', 'Distancia', 'NM')}
              {field('tw', 'Viento', 'kt')}
              <WindSelect label="Tipo de viento (origen)" value={v.tk} onChange={(x) => form.set('tk', x)} />
              {field('tfl', 'Nivel de vuelo', 'FL')}
            </div>
          </div>
          <div>
            <p className="field-label" style={{ marginBottom: 8 }}>
              Destino – alterno ({exercise.route.alternate.join(' – ')})
            </p>
            <div className="inline-fields">
              {field('ad', 'Distancia', 'NM')}
              {field('aw', 'Viento', 'kt')}
              <WindSelect label="Tipo de viento (alterno)" value={v.ak} onChange={(x) => form.set('ak', x)} />
              {field('afl', 'Nivel de vuelo', 'FL')}
            </div>
          </div>
          <div>
            <p className="field-label" style={{ marginBottom: 8 }}>
              Espera y rodaje
            </p>
            <div className="inline-fields">
              {field('hw', 'Peso en espera', 'lb')}
              {field('hfl', 'Nivel de espera', 'FL')}
              {field('hm', 'Tiempo de espera', 'min')}
              {field('taxi', 'Combustible de taxi', 'lb')}
            </div>
          </div>
        </div>
      </Card>

      {outcome.error && (
        <div style={{ marginTop: 16 }}>
          <Alert kind="error">{outcome.error}</Alert>
        </div>
      )}

      {r && (
        <>
          <h2 className="section-title">Desarrollo</h2>
          <div className="grid grid-2">
            <Card title={`1. Origen – destino · ${p(n.td)} NM`}>
              <LegSteps leg={r.trip} windKt={n.tw} kind={input.trip.windKind} timeTag="T.T" fuelTag="T.F" />
            </Card>
            <Card title={`2. Destino – alterno · ${p(n.ad)} NM`}>
              <LegSteps leg={r.alternate} windKt={n.aw} kind={input.alternate.windKind} timeTag="A.T" fuelTag="A.F" />
            </Card>
            <Card title="3. Espera (holding)">
              <HoldingSteps r={r.holding} weightLb={n.hw} />
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
      )}

      <h2 className="section-title">Validación con la resolución manual</h2>
      {!isOriginal ? (
        <Alert kind="info">
          Has cambiado los datos del enunciado: la validación solo se aplica a los datos originales.{' '}
          <button className="btn btn-sm" onClick={form.reset} style={{ marginLeft: 6 }}>
            Restaurar enunciado
          </button>
        </Alert>
      ) : (
        r && (
          <Card
            flush
            title={
              counts.mismatch === 0
                ? `${checks.length}/${checks.length} pasos coinciden`
                : `${counts.mismatch} de ${checks.length} pasos no coinciden`
            }
            action={
              <span className="row" style={{ gap: 6 }}>
                <span className="status status-match">{counts.match} exactos</span>
                {counts.rounding > 0 && <span className="status status-rounding">{counts.rounding} por redondeo</span>}
                {counts.mismatch > 0 && <span className="status status-mismatch">{counts.mismatch} distintos</span>}
              </span>
            }
          >
            <p className="muted" style={{ padding: '8px 22px 12px', fontSize: 14 }}>
              «Coincide»: el valor de la app redondeado a los decimales del cuaderno es idéntico. «Redondeo»: difiere en
              menos de 0,05 por redondeos intermedios (el cuaderno suma T.T = 80,4 y T.F = 7825,4 ya redondeados).
            </p>
            <div className="data-table-wrap">
              <table className="data-table validation-table">
                <thead>
                  <tr>
                    <th>Paso</th>
                    <th>Cuaderno</th>
                    <th>App</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {checks.map(({ step, cmp }) => (
                    <tr key={step.label} className={step.answer ? 'is-answer' : undefined}>
                      <td style={{ fontFamily: 'var(--font-sans)' }}>
                        {step.answer && `${step.answer}) `}
                        {step.label}
                      </td>
                      <td>
                        {step.written} {step.unit}
                      </td>
                      <td>
                        {p(cmp.actual, 3)} {step.unit}
                      </td>
                      <td>
                        <StatusChip status={cmp.status} diff={cmp.diff} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      )}

      <p className="muted row" style={{ marginTop: 20, fontSize: 13, gap: 6 }}>
        <Table size={14} /> Los valores salen de las tablas digitalizadas y del mismo núcleo de interpolación que usan las
        calculadoras.
      </p>
    </>
  );
}
