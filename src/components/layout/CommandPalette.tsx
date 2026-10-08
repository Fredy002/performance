import { CornerDownLeft, History, LayoutDashboard, Search, Settings, type LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, TOOLS, toolPath } from '@/tools/registry';

interface Item {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  to: string;
  keywords: string;
}

const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const ITEMS: Item[] = [
  ...TOOLS.filter((t) => t.status === 'ready').map((t) => ({
    id: t.id,
    label: t.name,
    hint: CATEGORIES[t.category],
    icon: t.icon,
    to: toolPath(t.id),
    keywords: normalize([t.name, t.description, ...t.keywords].join(' ')),
  })),
  { id: 'dash', label: 'Panel', hint: 'Navegación', icon: LayoutDashboard, to: '/', keywords: 'panel dashboard inicio' },
  { id: 'hist', label: 'Historial', hint: 'Navegación', icon: History, to: '/history', keywords: 'historial guardados' },
  { id: 'set', label: 'Ajustes', hint: 'Navegación', icon: Settings, to: '/settings', keywords: 'ajustes tema decimales' },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    return ITEMS.filter((i) => terms.every((t) => i.keywords.includes(t) || normalize(i.label).includes(t)));
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

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
        aria-label="Buscar"
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
            placeholder="Buscar calculadoras, páginas…"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={results[active] ? `pal-${results[active].id}` : undefined}
          />
          <kbd>Esc</kbd>
        </div>
        <div className="palette-list" id="palette-list" role="listbox">
          {results.length === 0 && <div className="empty">Sin resultados para «{query}»</div>}
          {results.map((item, i) => (
            <button
              key={item.id}
              id={`pal-${item.id}`}
              role="option"
              aria-selected={i === active}
              className="palette-item"
              onMouseEnter={() => setActive(i)}
              onClick={() => go(item)}
            >
              <span className="list-item-icon">
                <item.icon size={18} />
              </span>
              <span style={{ flex: 1 }}>
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
