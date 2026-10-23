import { ArrowRight, BadgeCheck, ClipboardCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fuelFormQuery } from '@/components/fuel/fuelForm';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { pendingExercises, SCOPES, verifiedExercises } from '@/exercises/registry';

export default function ExercisesList() {
  const pending = pendingExercises();
  const verified = verifiedExercises();
  return (
    <>
      <PageHeader
        eyebrow={<><ClipboardCheck size={14} /> Pruebas</>}
        title="Pruebas"
        subtitle="Ejercicios resueltos a mano que la app vuelve a resolver con las tablas digitalizadas y la interpolación, para validar paso a paso que los resultados coinciden. Una vez verificados pasan a su herramienta."
      />

      <h2 className="section-title" style={{ marginTop: 0 }}>
        Pendientes de verificación
      </h2>
      {pending.length === 0 ? (
        <Card>
          <div className="empty">
            <ClipboardCheck size={32} />
            No hay pruebas pendientes.
          </div>
        </Card>
      ) : (
        <div className="grid grid-3">
          {pending.map((e) => (
            <Link key={e.id} to={`/pruebas/${e.id}`} className="card tool-card">
              <span className="tool-card-icon">
                <ClipboardCheck size={22} />
              </span>
              <div>
                <div className="chip chip-accent" style={{ marginBottom: 8 }}>
                  {SCOPES[e.scope].label}
                </div>
                <h3>{e.title}</h3>
                <p style={{ marginTop: 4 }}>{e.summary}</p>
              </div>
              <div className="tool-card-footer">
                <span className="chip">{e.aircraft}</span>
                <span className="row" style={{ gap: 4 }}>
                  Abrir prueba <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {verified.length > 0 && (
        <>
          <h2 className="section-title">Ya verificados</h2>
          <Card flush>
            <div className="list" style={{ marginTop: 12 }}>
              {verified.map((e) => (
                <Link key={e.id} to={`/tools/fuel?${fuelFormQuery(e.input, e.airports)}`} className="list-item">
                  <span className="list-item-icon" style={{ color: 'var(--success)', background: 'var(--success-soft)' }}>
                    <BadgeCheck size={18} />
                  </span>
                  <div className="list-item-main">
                    <div className="list-item-title">{e.title}</div>
                    <div className="list-item-sub">
                      {SCOPES[e.scope].label} · disponible en Planificación de combustible
                    </div>
                  </div>
                  <ArrowRight size={16} className="muted" />
                </Link>
              ))}
            </div>
          </Card>
        </>
      )}
    </>
  );
}
