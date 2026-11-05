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
import { getLocalizedTable, getTableAircraft, getTableDisplay, getTableGroupDisplay, getTableVariantLabel } from '@/data/tables/localization';
import { SOURCE_EDITION } from '@/data/tables/sources';
import { useI18n } from '@/i18n';
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
  const { t, locale } = useI18n();
  const { tableId = '' } = useParams();
  const table = getTable(tableId);
  if (!table) return <NotFound />;
  const display = getTableDisplay(table, locale);
  const localizedTable = getLocalizedTable(table, locale);
  const group = getTableGroup(table.id);
  // Related variants are available in the subject navigation; deduplicate other subjects.
  const related = [...new Set(table.related?.map(id => getTableGroup(id)?.primaryId ?? id))]
    .filter(id => id !== group?.primaryId);

  return (
    <>
      <PageHeader
        eyebrow={<><Table size={14} /> {display.category}{table.aircraft ? ` · ${getTableAircraft(table, locale)}` : ''}</>}
        title={display.title}
        subtitle={
          <>
            {display.summary}
            <span className="page-subtitle-note">
              {t('table.detail.original')} <i>{table.source.originalTitle}</i> — {table.source.document === SOURCE_EDITION ? t('table.source.edition') : table.source.document}
            </span>
            {!!table.source.references?.length && <span className="page-subtitle-note row">
              {t('table.detail.references')} {table.source.references.map(reference => <a key={reference.url} href={reference.url} target="_blank" rel="noreferrer">{/#page=(\d+)/.test(reference.url) ? t('table.source.reference', { page: /#page=(\d+)/.exec(reference.url)![1] }) : reference.label}</a>)}
            </span>}
          </>
        }
        actions={
          <button className="btn" onClick={() => downloadCsv(table)}>
            <Download size={16} /> {t('table.detail.csv')}
          </button>
        }
      />
      {group && group.variants.length > 1 && <nav className="table-variants" aria-label={t('table.detail.variants')}>
        {group.variants.map(variant => <Link key={variant.id} to={`/tables/${variant.id}`} className="btn"
          aria-current={variant.id === table.id ? 'page' : undefined}>{getTableVariantLabel(variant.id, variant.label, locale)}</Link>)}
      </nav>}
      <TableBody table={localizedTable} />
      <h2 className="section-title">{t('table.detail.help')}</h2>
      <TableHelp help={localizedTable.help} />
      {related.length > 0 && (
        <p className="calc-footnote">
          {t('table.detail.related')}{' '}
          {related.map((id, i) => {
            const r = getTable(id);
            return r ? (
              <span key={id}>
                {i > 0 && ', '}
                <Link to={`/tables/${id}`}>
                  {getTableGroup(id) ? getTableGroupDisplay(getTableGroup(id)!, locale).title : getTableDisplay(r, locale).title}
                </Link>
              </span>
            ) : null;
          })}
        </p>
      )}
    </>
  );
}
