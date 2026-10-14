import { Download, Table } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ConditionsView } from '@/components/tables/ConditionsView';
import { FlightPlanningView } from '@/components/tables/FlightPlanningView';
import { HoldingView } from '@/components/tables/HoldingView';
import { TableHelp } from '@/components/tables/TableHelp';
import { PageHeader } from '@/components/ui/PageHeader';
import { getTable, type PerformanceTable } from '@/data/tables';
import { tableToCsv } from '@/data/tables/csv';
import NotFound from '../NotFound';

function downloadCsv(t: PerformanceTable) {
  const blob = new Blob([tableToCsv(t)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${t.source.figure.toLowerCase().replace(/\s+/g, '-')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function TableBody({ table }: { table: PerformanceTable }) {
  switch (table.kind) {
    case 'conditions':
      return <ConditionsView table={table} />;
    case 'flight-planning':
      return <FlightPlanningView table={table} />;
    case 'holding':
      return <HoldingView table={table} />;
  }
}

export default function TableDetail() {
  const { tableId = '' } = useParams();
  const table = getTable(tableId);
  if (!table) return <NotFound />;

  return (
    <>
      <PageHeader
        eyebrow={<><Table size={14} /> {table.source.figure.replace('FIGURE', 'Figura')}{table.aircraft ? ` · ${table.aircraft}` : ''}</>}
        title={table.title}
        subtitle={
          <>
            {table.summary}
            <br />
            <span style={{ fontSize: 13 }}>
              Original: <i>{table.source.originalTitle}</i> — {table.source.document}
            </span>
          </>
        }
        actions={
          <button className="btn" onClick={() => downloadCsv(table)}>
            <Download size={16} /> CSV
          </button>
        }
      />
      <TableBody table={table} />
      <h2 className="section-title">Ayuda</h2>
      <TableHelp help={table.help} />
      {table.related && table.related.length > 0 && (
        <p className="muted" style={{ marginTop: 20, fontSize: 14 }}>
          Se usa junto con:{' '}
          {table.related.map((id, i) => {
            const r = getTable(id);
            return r ? (
              <span key={id}>
                {i > 0 && ', '}
                <Link to={`/tables/${id}`}>
                  {r.source.figure.replace('FIGURE', 'Figura')} · {r.title}
                </Link>
              </span>
            ) : null;
          })}
        </p>
      )}
    </>
  );
}
