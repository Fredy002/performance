import { ArrowRight, Fuel, Spline, Table, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { readyTools, toolPath, upcomingTools } from '@/tools/registry';
import { useHistory } from '@/state/history';
import { HistoryList } from './History';

const ACTIONS: { to: string; icon: LucideIcon; title: string; text: string; cta: string }[] = [
  {
    to: toolPath('fuel'),
    icon: Fuel,
    title: 'Planificación de combustible',
    text: 'Pega o fotografía el enunciado y obtén T.T, T.F, FOB y autonomía.',
    cta: 'Resolver un ejercicio',
  },
  {
    to: toolPath('linear'),
    icon: Spline,
    title: 'Interpolar un valor',
    text: 'Entre dos filas de una tabla del manual: A y B dan X.',
    cta: 'Interpolar',
  },
  {
    to: '/tables',
    icon: Table,
    title: 'Consultar tablas',
    text: 'Planificación de vuelo y espera del B737, con ayuda de uso.',
    cta: 'Ver tablas',
  },
];

// las tres primeras ya tienen acceso directo arriba
const MAIN = new Set(['fuel', 'linear']);

export default function Dashboard() {
  const history = useHistory();
  const others = readyTools().filter((t) => !MAIN.has(t.id));
  const upcoming = upcomingTools();

  return (
    <>
      <section className="home-hero">
        <h1>¿Qué quieres resolver?</h1>
        <p>Cálculos de performance con las tablas del manual y su desarrollo paso a paso.</p>
      </section>

      <div className="action-grid">
        {ACTIONS.map((a, i) => (
          <Link key={a.to} to={a.to} className={`card action-tile${i === 0 ? ' primary' : ''}`}>
            <span className="action-icon">
              <a.icon size={24} />
            </span>
            <span className="action-title">{a.title}</span>
            <span className="action-text">{a.text}</span>
            <span className="action-cta">
              {a.cta} <ArrowRight size={15} />
            </span>
          </Link>
        ))}
      </div>

      <div className="grid grid-2" style={{ marginTop: 28, alignItems: 'start' }}>
        <section>
          <h2 className="section-title" style={{ marginTop: 0 }}>
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
                    <span className="list-item-title" style={{ display: 'block' }}>
                      {t.name}
                    </span>
                    <span className="list-item-sub" style={{ display: 'block' }}>
                      {t.description}
                    </span>
                  </span>
                  <ArrowRight size={16} className="muted" />
                </Link>
              ))}
            </div>
          </Card>
          {upcoming.length > 0 && (
            <p className="field-hint" style={{ marginTop: 10 }}>
              Próximamente: {upcoming.map((t) => t.name).join(', ')}.
            </p>
          )}
        </section>

        <section>
          <h2 className="section-title" style={{ marginTop: 0 }}>
            Actividad reciente
            {history.length > 0 && (
              <Link to="/history" style={{ fontSize: 13, fontWeight: 500 }}>
                Ver todo
              </Link>
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
