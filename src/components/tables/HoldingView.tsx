import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import type { HoldingCell, HoldingTable } from '@/data/tables';

type Param = 'all' | 'epr' | 'ias' | 'ff';

const PARAMS: { id: Param; label: string }[] = [
  { id: 'all', label: 'Todo' },
  { id: 'epr', label: 'EPR' },
  { id: 'ias', label: 'IAS (kt)' },
  { id: 'ff', label: 'FF / motor (lb/h)' },
];

const flLabel = (fl: number) => `FL ${String(fl).padStart(3, '0')}`;

function Cell({ c, param }: { c: HoldingCell; param: Param }) {
  if (param === 'epr') return <>{c.epr.toFixed(2)}</>;
  if (param === 'ias') return <>{c.iasKt}</>;
  if (param === 'ff') return <>{c.ffPerEngineLbHr}</>;
  return (
    <span className="cell-stack">
      <span className="epr">{c.epr.toFixed(2)}</span>
      <span className="ias">{c.iasKt}</span>
      <span className="ff">{c.ffPerEngineLbHr}</span>
    </span>
  );
}

export function HoldingView({ table }: { table: HoldingTable }) {
  const [param, setParam] = useState<Param>('all');
  return (
    <div className="stack">
      <Card
        title="Datos de la tabla"
        action={
          <div className="segmented" role="group" aria-label="Parámetro a mostrar">
            {PARAMS.map((p) => (
              <button key={p.id} aria-pressed={param === p.id} onClick={() => setParam(p.id)}>
                {p.label}
              </button>
            ))}
          </div>
        }
        flush
      >
        <div className="row" style={{ padding: '12px 22px', justifyContent: 'space-between' }}>
          <span className="muted" style={{ fontSize: 13 }}>
            Columnas: peso bruto (×1000 lb) · Filas: nivel de vuelo
          </span>
          {param === 'all' && (
            <span className="legend">
              <span style={{ color: 'var(--accent)' }}><i /> EPR</span>
              <span style={{ color: 'var(--text)' }}><i /> IAS kt</span>
              <span style={{ color: 'var(--result)' }}><i /> FF por motor lb/h</span>
            </span>
          )}
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>FL \ Peso</th>
                {table.weightsKlb.map((w) => (
                  <th key={w}>{w}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((r) => (
                <tr key={r.flightLevel}>
                  <td>{flLabel(r.flightLevel)}</td>
                  {r.cells.map((c, i) => (
                    <td key={table.weightsKlb[i]}>
                      <Cell c={c} param={param} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-2">
        <Card title="Combustible de espera">
          <div className="formula-box">
            <span>Consumo total = FF por motor × {table.engines}</span>
            <span>Combustible = Consumo total × minutos ÷ 60</span>
          </div>
          <p className="muted" style={{ marginTop: 10, fontSize: 14 }}>
            Ejemplo: FL 200, 100 000 lb → 2 390 lb/h por motor → 4 780 lb/h. En 30 min de espera: 2 390 lb.
          </p>
        </Card>
        <Card title="Observaciones sobre la fuente">
          <div className="help-block">
            <ul>
              {table.sourceRemarks.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
