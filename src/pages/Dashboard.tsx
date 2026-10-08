import { ArrowRight, Calculator, Clock, History as HistoryIcon, Layers, Search, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { CATEGORIES, getTool, TOOLS, toolPath, type ToolDef } from '@/tools/registry';
import { toggleFavorite, useSettings } from '@/state/settings';
import { useHistory } from '@/state/history';
import { HistoryList } from './History';

function HeroArt() {
  return (
    <svg className="hero-art" viewBox="0 0 220 160" fill="none" aria-hidden="true">
      <path d="M20 130 Q 110 -20 200 70" stroke="currentColor" strokeOpacity=".35" strokeWidth="2" strokeDasharray="6 8" />
      <circle cx="40" cy="104" r="6" fill="currentColor" fillOpacity=".7" />
      <circle cx="200" cy="70" r="6" fill="currentColor" fillOpacity=".7" />
      <circle cx="118" cy="38" r="8" fill="#fca5a5" stroke="#fff" strokeWidth="3" />
      <g transform="translate(150 18) rotate(30)">
        <path d="M30 4c3-3 7-3 8 0s0 5-3 8l-8 8 4 22-4 4-10-17-9 9 1 8-3 3-4-9-9-4 3-3 8 1 9-9-17-10 4-4 22 4z" fill="#fff" />
      </g>
    </svg>
  );
}

export function ToolCard({ tool, favorite }: { tool: ToolDef; favorite: boolean }) {
  const ready = tool.status === 'ready';
  const body = (
    <>
      <span className="tool-card-icon">
        <tool.icon size={22} />
      </span>
      <div>
        <h3>{tool.name}</h3>
        <p style={{ marginTop: 4 }}>{tool.description}</p>
      </div>
      <div className="tool-card-footer">
        <span className="chip">{CATEGORIES[tool.category]}</span>
        {ready ? (
          <span className="row" style={{ gap: 4 }}>
            Abrir <ArrowRight size={14} />
          </span>
        ) : (
          <span className="chip chip-warning">Próximamente</span>
        )}
      </div>
    </>
  );
  return (
    <div style={{ position: 'relative' }}>
      {ready ? (
        <Link to={toolPath(tool.id)} className="card tool-card" style={{ height: '100%' }}>
          {body}
        </Link>
      ) : (
        <div className="card tool-card soon" style={{ height: '100%' }}>
          {body}
        </div>
      )}
      {ready && (
        <button
          className={`btn btn-ghost btn-icon btn-sm fav-btn${favorite ? ' on' : ''}`}
          onClick={() => toggleFavorite(tool.id)}
          aria-pressed={favorite}
          aria-label={favorite ? `Quitar ${tool.name} de favoritos` : `Añadir ${tool.name} a favoritos`}
        >
          <Star size={17} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { favorites } = useSettings();
  const history = useHistory();
  const ready = TOOLS.filter((t) => t.status === 'ready');
  const favTools = favorites.map(getTool).filter((t): t is ToolDef => !!t && t.status === 'ready');
  const today = history.filter((h) => new Date(h.createdAt).toDateString() === new Date().toDateString()).length;

  const usage = new Map<string, number>();
  history.forEach((h) => usage.set(h.toolId, (usage.get(h.toolId) ?? 0) + 1));
  const topTool = [...usage.entries()].sort((a, b) => b[1] - a[1])[0];

  const stats = [
    { icon: Layers, value: ready.length, label: 'Herramientas activas' },
    { icon: HistoryIcon, value: history.length, label: 'Cálculos guardados' },
    { icon: Clock, value: today, label: 'Guardados hoy' },
    { icon: Calculator, value: topTool ? getTool(topTool[0])?.name ?? '—' : '—', label: 'Más utilizada', small: true },
  ];

  return (
    <>
      <section className="hero">
        <div>
          <h1>Calculadoras de performance</h1>
          <p>
            Interpola tablas del manual de vuelo en segundos, verifica las condiciones atmosféricas y guarda cada cálculo
            con su desarrollo paso a paso.
          </p>
          <div className="hero-actions">
            <Link to={toolPath('linear')} className="btn btn-primary">
              <Calculator size={16} /> Interpolación lineal
            </Link>
            <Link to={toolPath('bilinear')} className="btn">
              Interpolación doble
            </Link>
          </div>
        </div>
        <HeroArt />
      </section>

      <div className="grid grid-4">
        {stats.map((s) => (
          <div className="card stat" key={s.label}>
            <span className="stat-icon">
              <s.icon size={20} />
            </span>
            <div style={{ minWidth: 0 }}>
              <div className="stat-value" style={s.small ? { fontSize: 15, fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } : undefined}>
                {s.value}
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {favTools.length > 0 && (
        <>
          <h2 className="section-title">
            <span className="row" style={{ gap: 8 }}>
              <Star size={18} /> Favoritas
            </span>
          </h2>
          <div className="grid grid-3">
            {favTools.map((t) => (
              <ToolCard key={t.id} tool={t} favorite />
            ))}
          </div>
        </>
      )}

      <div className="grid grid-calc" style={{ marginTop: 32 }}>
        <div>
          <h2 className="section-title" style={{ marginTop: 0 }}>
            Todas las herramientas
            <span className="muted row" style={{ fontSize: 13, fontWeight: 400, gap: 6 }}>
              <Search size={14} /> Ctrl K para buscar
            </span>
          </h2>
          <div className="grid grid-2">
            {TOOLS.map((t) => (
              <ToolCard key={t.id} tool={t} favorite={favorites.includes(t.id)} />
            ))}
          </div>
        </div>
        <div>
          <h2 className="section-title" style={{ marginTop: 0 }}>
            Actividad reciente
            {history.length > 0 && (
              <Link to="/history" style={{ fontSize: 13, fontWeight: 500 }}>
                Ver todo
              </Link>
            )}
          </h2>
          <Card flush>
            <HistoryList entries={history.slice(0, 6)} compact />
          </Card>
        </div>
      </div>
    </>
  );
}
