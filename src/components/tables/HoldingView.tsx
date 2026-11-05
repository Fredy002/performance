import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import type { HoldingCell, HoldingTable } from '@/data/tables';
import { useI18n } from '@/i18n';

type Param = 'all' | 'epr' | 'ias' | 'ff';

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
  const { t } = useI18n();
  const [param, setParam] = useState<Param>('all');
  const params: { id: Param; label: string }[] = [
    { id: 'all', label: t('table.all') },
    { id: 'epr', label: 'EPR' },
    { id: 'ias', label: t('table.ias') },
    { id: 'ff', label: t('table.ffPerEngine') },
  ];
  return (
    <div className="stack">
      <Card
        title={t('table.tableData')}
        action={
          <div className="segmented" role="group" aria-label={t('table.parameterToShow')}>
            {params.map((p) => (
              <button key={p.id} aria-pressed={param === p.id} onClick={() => setParam(p.id)}>
                {p.label}
              </button>
            ))}
          </div>
        }
        flush
      >
        <div className="row card-inset table-toolbar">
          <span className="muted">
            {t('table.columnsWeightRowsFlightLevel')}
          </span>
          {param === 'all' && (
            <span className="legend">
              <span className="legend-epr"><i /> EPR</span>
              <span className="legend-ias"><i /> {t('table.legendIas')}</span>
              <span className="legend-ff"><i /> {t('table.legendFf')}</span>
            </span>
          )}
        </div>
        <div className="data-table-wrap" tabIndex={0} role="region" aria-label={t('table.scrollable')}>
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('table.flightLevelWeight')}</th>
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
        <Card title={t('table.holdingFuel')}>
          <div className="formula-box">
            <span>{t('table.totalFuelFlowFormula', { engines: table.engines })}</span>
            <span>{t('table.holdingFuelFormula')}</span>
          </div>
          <p className="calc-note">
            {t('table.holdingExample')}
          </p>
        </Card>
        <Card title={t('table.sourceObservations')}>
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
