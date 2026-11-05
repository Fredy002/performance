import { ClipboardCheck, CornerDownLeft, ScanText, History, LayoutDashboard, Search, Settings, Table, type LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, localizedCategory, localizedToolName, TOOLS, toolPath } from '@/tools/registry';
import { PERFORMANCE_TABLE_GROUPS, getTable } from '@/data/tables';
import { getTableDisplay, getTableGroupDisplay } from '@/data/tables/localization';
import { EXERCISES, getExerciseDisplay } from '@/exercises/registry';
import { useI18n } from '@/i18n';

interface Item {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  to: string;
  keywords: string;
}

const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { locale, t } = useI18n();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo<Item[]>(() => [
    ...TOOLS.filter((tool) => tool.status === 'ready').map((tool) => ({
      id: tool.id,
      label: locale === 'es' ? tool.name : localizedToolName(tool.id, locale),
      hint: tool.category === 'performance'
        ? t('common.aircraftPerformance')
        : locale === 'es' ? CATEGORIES[tool.category] : localizedCategory(tool.category, locale),
      icon: tool.icon,
      to: toolPath(tool.id),
      keywords: normalize([tool.name, tool.description, ...tool.keywords].join(' ')),
    })),
    ...PERFORMANCE_TABLE_GROUPS.map((group) => {
      const table = getTable(group.primaryId)!;
      const tableDisplay = getTableDisplay(table, locale);
      const groupDisplay = getTableGroupDisplay(group, locale);
      return {
        id: `table-${table.id}`,
        label: groupDisplay.title,
        hint: t('common.tableCategory', { category: tableDisplay.category }),
        icon: Table,
        to: `/tables/${table.id}`,
        keywords: normalize([group.title, groupDisplay.title, group.summary ?? table.summary, groupDisplay.summary, ...group.variants.map(variant => getTable(variant.id)?.title ?? ''), table.source.originalTitle, tableDisplay.title, table.category, tableDisplay.category, table.aircraft ?? '', 'tabla performance aeronave'].join(' ')),
      };
    }),
    ...EXERCISES.map((exercise) => {
      const display = getExerciseDisplay(exercise, locale);
      return {
        id: `exercise-${exercise.id}`,
        label: display.title,
        hint: exercise.status === 'verified'
          ? t('common.solvedExercise', { aircraft: exercise.aircraft })
          : t('common.exercise', { aircraft: exercise.aircraft }),
        icon: ClipboardCheck,
        // los verificados se abren en su herramienta (la ruta de pruebas redirige)
        to: `/pruebas/${exercise.id}`,
        keywords: normalize([exercise.title, exercise.summary, display.title, display.summary, exercise.aircraft, 'prueba ejercicio validar'].join(' ')),
      };
    }),
    {
      id: 'capture',
      label: t('common.captureExercise'),
      hint: t('common.fuelPlanning'),
      icon: ScanText,
      to: '/tools/fuel',
      keywords: 'captura foto camara imagen ocr escanear resolver ejercicio enunciado',
    },
    { id: 'pruebas', label: t('common.exercises'), hint: t('common.navigation'), icon: ClipboardCheck, to: '/pruebas', keywords: 'pruebas ejercicios validar' },
    { id: 'tables', label: t('common.tableNavigation'), hint: t('common.navigation'), icon: Table, to: '/tables', keywords: 'tablas referencia performance aeronaves' },
    { id: 'dash', label: t('common.dashboard'), hint: t('common.navigation'), icon: LayoutDashboard, to: '/', keywords: 'panel dashboard inicio' },
    { id: 'hist', label: t('common.history'), hint: t('common.navigation'), icon: History, to: '/history', keywords: 'historial guardados' },
    { id: 'set', label: t('common.settings'), hint: t('common.navigation'), icon: Settings, to: '/settings', keywords: 'ajustes tema decimales' },
  ], [locale, t]);

  const results = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    return items.filter((i) => terms.every((term) => i.keywords.includes(term) || normalize(i.label).includes(term)));
  }, [items, query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    if (open && results[active]) {
      document.getElementById(`pal-${results[active].id}`)?.scrollIntoView({ block: 'nearest' });
    }
  }, [active, open, results]);

  if (!open) return null;

  const go = (item?: Item) => {
    if (!item) return;
    navigate(item.to);
    onClose();
  };

  return (
    <div className="palette-backdrop" onMouseDown={onClose}>
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label={t('common.searchDialog')}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
          else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, results.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === 'Enter') go(results[active]);
        }}
      >
        <div className="palette-input">
          <Search size={18} className="muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('common.searchPlaceholder')}
            aria-label={t('common.searchToolsTablesExercises')}
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={results[active] ? `pal-${results[active].id}` : undefined}
          />
          <kbd>Esc</kbd>
        </div>
        <div className="palette-list" id="palette-list" role="listbox">
          {results.length === 0 && (
            <div className="empty" role="status">
              <div className="empty-title">{t('common.noResults', { query })}</div>
              <div>{t('common.searchSuggestions')}</div>
            </div>
          )}
          {results.map((item, i) => (
            <button
              key={item.id}
              id={`pal-${item.id}`}
              role="option"
              aria-selected={i === active}
              className="palette-item"
              onMouseMove={() => setActive(i)}
              onClick={() => go(item)}
            >
              <span className="palette-item-icon">
                <item.icon size={18} />
              </span>
              <span className="palette-item-text">
                {item.label}
                <small>{item.hint}</small>
              </span>
              {i === active && <CornerDownLeft size={16} className="muted" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
