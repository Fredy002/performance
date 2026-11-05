import { ArrowRight, Table } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { PERFORMANCE_TABLE_GROUPS, getTable } from '@/data/tables';
import { getTableAircraft, getTableDisplay, getTableGroupDisplay } from '@/data/tables/localization';
import { useI18n } from '@/i18n';

export default function TablesLibrary() {
  const { t, locale } = useI18n();
  return (
    <>
      <PageHeader
        eyebrow={<><Table size={14} /> {t('table.library.eyebrow')}</>}
        title={t('table.library.title')}
        subtitle={t('table.library.subtitle')}
      />
      <div className="grid grid-3">
        {PERFORMANCE_TABLE_GROUPS.map((group) => {
          const table = getTable(group.primaryId)!;
          const tableDisplay = getTableDisplay(table, locale);
          const groupDisplay = getTableGroupDisplay(group, locale);
          return (
            <Link key={table.id} to={`/tables/${table.id}`} className="card tool-card">
              <span className="tool-card-icon tone-yellow">
                <Table size={20} />
              </span>
              <div className="tool-card-body">
                <div className="chip chip-accent">{tableDisplay.category}</div>
                <h2 className="tool-card-title">{groupDisplay.title}</h2>
                <p>{groupDisplay.summary || tableDisplay.summary}</p>
              </div>
              <div className="tool-card-footer">
                <span className="chip">{getTableAircraft(table, locale) ?? t(`table.kind.${table.kind}`)}</span>
                <span className="tool-card-cta">
                  {t('table.library.view')} <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
