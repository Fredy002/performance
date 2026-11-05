import { History as HistoryIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { useI18n } from '@/i18n';
import { clearHistory, removeHistory, restoreHistory, useHistory, type HistoryEntry } from '@/state/history';
import { showToast } from '@/state/toast';
import { CATEGORIES, getTool, localizedCategory, localizedToolName, TOOLS, toolPath } from '@/tools/registry';

export function HistoryList({ entries, compact }: { entries: HistoryEntry[]; compact?: boolean }) {
  const { locale, t } = useI18n();
  const dateFmt = new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' });
  if (entries.length === 0) {
    return (
      <div className="empty">
        <HistoryIcon size={32} aria-hidden="true" />
        <div>
          <div className="empty-title">{t('page.history.emptyTitle')}</div>
          <div>{t('page.history.emptyBody')}</div>
        </div>
        {!compact && (
          <Link to={toolPath('fuel')} className="btn btn-primary">
            {t('page.history.solveExercise')}
          </Link>
        )}
      </div>
    );
  }
  return (
    <div className="list">
      {entries.map((entry) => {
        const tool = getTool(entry.toolId);
        const Icon = tool?.icon ?? HistoryIcon;
        const toolName = tool ? locale === 'es' ? tool.name : localizedToolName(tool.id, locale) : entry.toolId;
        return (
          <div key={entry.id} className="history-row">
            <Link to={entry.href} className="list-item" title={t('page.history.openCalculation')}>
              <span className="list-item-icon">
                <Icon size={18} />
              </span>
              <div className="list-item-main">
                <div className="list-item-title">{toolName}</div>
                <div className="list-item-sub">
                  {entry.summary} · {dateFmt.format(entry.createdAt)}
                </div>
              </div>
              <span className="list-item-value">{entry.result}</span>
            </Link>
            {!compact && (
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => {
                  const removed = removeHistory(entry.id);
                  if (removed) {
                    showToast(t('page.history.deleteToast'), {
                      kind: 'info',
                      action: { label: t('page.history.undo'), run: () => restoreHistory([removed]) },
                    });
                  }
                }}
                aria-label={t('page.history.deleteLabel', { tool: toolName, result: entry.result })}
                title={t('page.history.deleteTitle')}
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
  const { locale, t } = useI18n();
  const history = useHistory();
  const [filter, setFilter] = useState('all');
  const usedTools = TOOLS.filter((tool) => history.some((entry) => entry.toolId === tool.id));
  const shown = filter === 'all' ? history : history.filter((entry) => entry.toolId === filter);

  return (
    <>
      <PageHeader
        title={t('page.history.title')}
        subtitle={t('page.history.subtitle')}
        actions={
          history.length > 0 && (
            <button
              className="btn"
              onClick={() => {
                const confirmKey = history.length === 1 ? 'page.history.clearConfirmOne' : 'page.history.clearConfirm';
                if (!confirm(t(confirmKey, { count: history.length }))) return;
                const removed = clearHistory();
                showToast(t('page.history.clearToast'), {
                  kind: 'info',
                  action: { label: t('page.history.undo'), run: () => restoreHistory(removed.map((entry, index) => ({ entry, index }))) },
                });
              }}
            >
              <Trash2 size={16} /> {t('page.history.clearAll')}
            </button>
          )
        }
      />
      {usedTools.length > 1 && (
        <div className="segmented history-filter" role="group" aria-label={t('page.history.filter')}>
          <button aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
            {t('page.history.allTools')}
          </button>
          {usedTools.map((tool) => (
            <button
              key={tool.id}
              aria-pressed={filter === tool.id}
              onClick={() => setFilter(tool.id)}
              title={tool.category === 'performance'
                ? t('common.aircraftPerformance')
                : locale === 'es' ? CATEGORIES[tool.category] : localizedCategory(tool.category, locale)}
            >
              <tool.icon size={14} /> {localizedToolName(tool.id, locale)}
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
