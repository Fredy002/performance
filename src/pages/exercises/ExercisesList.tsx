import { ArrowRight, BadgeCheck, ClipboardCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { pendingExercises, verifiedExercises } from '@/exercises/registry';
import { exerciseScopeLabel, exerciseToolHref, exerciseToolName } from './exerciseLinks';

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

      <h2 className="section-title section-title-flush">
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
              <span className="tool-card-icon tone-blush">
                <ClipboardCheck size={20} />
              </span>
              <div className="tool-card-body">
                <div className="chip chip-accent">{exerciseScopeLabel(e)}</div>
                <h3>{e.title}</h3>
                <p>{e.summary}</p>
              </div>
              <div className="tool-card-footer">
                <span className="chip">{e.aircraft}</span>
                <span className="tool-card-cta">
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
            <div className="list">
              {verified.map((e) => (
                <Link key={e.id} to={exerciseToolHref(e)} className="list-item">
                  <span className="list-item-icon is-success">
                    <BadgeCheck size={18} />
                  </span>
                  <div className="list-item-main">
                    <div className="list-item-title">{e.title}</div>
                    <div className="list-item-sub">
                      {exerciseScopeLabel(e)} · disponible en {exerciseToolName(e)}
                    </div>
                  </div>
                  <ArrowRight size={16} className="list-item-arrow" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </Card>
        </>
      )}
    </>
  );
}
