import { History as HistoryIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { clearHistory, removeHistory, useHistory, type HistoryEntry } from '@/state/history';
import { CATEGORIES, getTool, TOOLS } from '@/tools/registry';

const dateFmt = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' });

export function HistoryList({ entries, compact }: { entries: HistoryEntry[]; compact?: boolean }) {
  if (entries.length === 0) {
    return (
      <div className="empty">
        <HistoryIcon size={32} />
        <div>
          <div className="empty-title">Aún no hay cálculos guardados</div>
          <div>Pulsa «Guardar» en cualquier calculadora para verlo aquí.</div>
        </div>
      </div>
    );
  }
  return (
    <div className="list">
      {entries.map((e) => {
        const tool = getTool(e.toolId);
        const Icon = tool?.icon ?? HistoryIcon;
        return (
          <div key={e.id} className="history-row">
            <Link to={e.href} className="list-item" title="Abrir este cálculo">
              <span className="list-item-icon">
                <Icon size={18} />
              </span>
              <div className="list-item-main">
                <div className="list-item-title">{tool?.name ?? e.toolId}</div>
                <div className="list-item-sub">
                  {e.summary} · {dateFmt.format(e.createdAt)}
                </div>
              </div>
              <span className="list-item-value">{e.result}</span>
            </Link>
            {!compact && (
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => removeHistory(e.id)}
                aria-label="Eliminar del historial"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function HistoryPage() {
  const history = useHistory();
  const [filter, setFilter] = useState('all');
  const usedTools = TOOLS.filter((t) => history.some((h) => h.toolId === t.id));
  const shown = filter === 'all' ? history : history.filter((h) => h.toolId === filter);

  return (
    <>
      <PageHeader
        title="Historial"
        subtitle="Cálculos guardados en este navegador. Pulsa uno para reabrirlo con los mismos datos."
        actions={
          history.length > 0 && (
            <button
              className="btn"
              onClick={() => {
                if (confirm('¿Borrar todo el historial? Esta acción no se puede deshacer.')) clearHistory();
              }}
            >
              <Trash2 size={16} /> Borrar todo
            </button>
          )
        }
      />
      {usedTools.length > 1 && (
        <div className="segmented history-filter" role="group" aria-label="Filtrar por herramienta">
          <button aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
            Todas
          </button>
          {usedTools.map((t) => (
            <button key={t.id} aria-pressed={filter === t.id} onClick={() => setFilter(t.id)} title={CATEGORIES[t.category]}>
              <t.icon size={14} /> {t.name}
            </button>
          ))}
        </div>
      )}
      <Card flush>
        <HistoryList entries={shown} />
      </Card>
    </>
  );
}
