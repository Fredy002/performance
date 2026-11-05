import { Download, Table } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ConditionsView } from '@/components/tables/ConditionsView';
import { FigureView } from '@/components/tables/FigureView';
import { FlightPlanningView } from '@/components/tables/FlightPlanningView';
import { HoldingView } from '@/components/tables/HoldingView';
import { TableHelp } from '@/components/tables/TableHelp';
import { PageHeader } from '@/components/ui/PageHeader';
import { getTable, getTableGroup, type PerformanceTable } from '@/data/tables';
import { tableToCsv } from '@/data/tables/csv';
import NotFound from '../NotFound';

function downloadCsv(t: PerformanceTable) {
  const blob = new Blob([tableToCsv(t)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${t.id}.csv`;
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
    case 'figure':
      return <FigureView table={table} />;
  }
}

export default function TableDetail() {
  const { tableId = '' } = useParams();
  const table = getTable(tableId);
  if (!table) return <NotFound />;
  const group = getTableGroup(table.id);
  // Related variants are available in the subject navigation; deduplicate other subjects.
  const related = [...new Set(table.related?.map(id => getTableGroup(id)?.primaryId ?? id))]
    .filter(id => id !== group?.primaryId);

  return (
    <>
      <PageHeader
        eyebrow={<><Table size={14} /> {table.category}{table.aircraft ? ` · ${table.aircraft}` : ''}</>}
        title={table.title}
        subtitle={
          <>
            {table.summary}
            <span className="page-subtitle-note">
              Original: <i>{table.source.originalTitle}</i> — {table.source.document}
            </span>
            {!!table.source.references?.length && <span className="page-subtitle-note row">
              Referencias: {table.source.references.map(reference => <a key={reference.url} href={reference.url} target="_blank" rel="noreferrer">{reference.label}</a>)}
            </span>}
          </>
        }
        actions={
          <button className="btn" onClick={() => downloadCsv(table)}>
            <Download size={16} /> CSV
          </button>
        }
      />
      {group && group.variants.length > 1 && <nav className="table-variants" aria-label="Versiones de la tabla">
        {group.variants.map(variant => <Link key={variant.id} to={`/tables/${variant.id}`} className="btn"
          aria-current={variant.id === table.id ? 'page' : undefined}>{variant.label}</Link>)}
      </nav>}
      <TableBody table={table} />
      <h2 className="section-title">Ayuda</h2>
      <TableHelp help={table.help} />
      {related.length > 0 && (
        <p className="calc-footnote">
          Se usa junto con:{' '}
          {related.map((id, i) => {
            const r = getTable(id);
            return r ? (
              <span key={id}>
                {i > 0 && ', '}
                <Link to={`/tables/${id}`}>
                  {getTableGroup(id)?.title ?? r.title}
                </Link>
              </span>
            ) : null;
          })}
        </p>
      )}
    </>
  );
}
