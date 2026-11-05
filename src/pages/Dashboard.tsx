import { ArrowRight, Fuel, Spline, Table, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { readyTools, toolPath, upcomingTools } from '@/tools/registry';
import { useHistory } from '@/state/history';
import { HistoryList } from './History';

type Tone = 'accent' | 'yellow' | 'mint';

const ACTIONS: { to: string; icon: LucideIcon; tone: Tone; title: string; text: string; cta: string }[] = [
  {
    to: toolPath('fuel'),
    tone: 'accent',
    icon: Fuel,
    title: 'Planificación de combustible',
    text: 'Pega o fotografía el enunciado y obtén T.T, T.F, FOB y autonomía.',
    cta: 'Resolver un ejercicio',
  },
  {
    to: toolPath('linear'),
    tone: 'yellow',
    icon: Spline,
    title: 'Interpolar un valor',
    text: 'Entre dos filas de una tabla del manual: A y B dan X.',
    cta: 'Interpolar',
  },
  {
    to: '/tables',
    tone: 'mint',
    icon: Table,
    title: 'Consultar tablas',
    text: 'Planificación de vuelo y espera del B737, con ayuda de uso.',
    cta: 'Ver tablas',
  },
];

// las tres primeras ya tienen acceso directo arriba
const MAIN = new Set(['fuel', 'linear']);

/** Composición decorativa de formas planas en colores de categoría. */
function HeroArt() {
  return (
    <svg className="home-hero-art" viewBox="0 0 232 152" aria-hidden="true" focusable="false">
      <rect x="0" y="40" width="72" height="72" rx="16" fill="var(--cat-yellow)" />
      <circle cx="124" cy="44" r="36" fill="var(--cat-mint)" />
      <rect x="88" y="88" width="64" height="64" rx="16" fill="var(--cat-ink)" />
      <rect x="168" y="16" width="64" height="64" rx="32" fill="var(--cat-blush)" />
      <rect x="168" y="96" width="56" height="56" rx="16" fill="var(--accent)" />
    </svg>
  );
}

export default function Dashboard() {
  const history = useHistory();
  const others = readyTools().filter((t) => !MAIN.has(t.id));
  const upcoming = upcomingTools();

  return (
    <>
      <section className="home-hero">
        <div className="home-hero-copy">
          <h1>¿Qué quieres resolver?</h1>
          <p>Cálculos de performance con las tablas del manual y su desarrollo paso a paso.</p>
        </div>
        <HeroArt />
      </section>

      <div className="action-grid">
        {ACTIONS.map((a) => (
          <Link key={a.to} to={a.to} className="card action-tile">
            <span className={`action-icon tone-${a.tone}`}>
              <a.icon size={20} />
            </span>
            <span className="action-title">{a.title}</span>
            <span className="action-text">{a.text}</span>
            <span className="action-cta">
              {a.cta} <ArrowRight size={16} />
            </span>
          </Link>
        ))}
      </div>

      <div className="grid grid-2 home-columns">
        <section>
          <h2 className="section-title section-title-flush">
            Otras herramientas
          </h2>
          <Card flush>
            <div className="list">
              {others.map((t) => (
                <Link key={t.id} to={toolPath(t.id)} className="list-item">
                  <span className="list-item-icon">
                    <t.icon size={18} />
                  </span>
                  <span className="list-item-main">
                    <span className="list-item-title">{t.name}</span>
                    <span className="list-item-sub">{t.description}</span>
                  </span>
                  <ArrowRight size={16} className="list-item-arrow" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </Card>
          {upcoming.length > 0 && (
            <>
              <h2 className="section-title">Próximamente</h2>
              <Card flush>
                <div className="list">
                  {upcoming.map((t) => (
                    <div key={t.id} className="list-item upcoming" aria-disabled="true">
                      <span className="list-item-icon">
                        <t.icon size={18} />
                      </span>
                      <span className="list-item-main">
                        <span className="list-item-title">{t.name}</span>
                        <span className="list-item-sub">{t.description}</span>
                      </span>
                      <span className="chip chip-warning">Pronto</span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </section>

        <section>
          <h2 className="section-title section-title-flush">
            Actividad reciente
            {history.length > 0 && (
              <Link to="/history">Ver todo</Link>
            )}
          </h2>
          <Card flush>
            <HistoryList entries={history.slice(0, 5)} compact />
          </Card>
        </section>
      </div>
    </>
  );
}
