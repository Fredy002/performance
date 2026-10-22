import { ArrowRight, ClipboardCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { EXERCISES } from '@/exercises/registry';

export default function ExercisesList() {
  return (
    <>
      <PageHeader
        eyebrow={<><ClipboardCheck size={14} /> Pruebas</>}
        title="Pruebas"
        subtitle="Ejercicios resueltos a mano que la app vuelve a resolver con las tablas digitalizadas y la interpolación, para validar paso a paso que los resultados coinciden."
      />
      <div className="grid grid-3">
        {EXERCISES.map((e) => (
          <Link key={e.id} to={`/pruebas/${e.id}`} className="card tool-card">
            <span className="tool-card-icon">
              <ClipboardCheck size={22} />
            </span>
            <div>
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
    </>
  );
}
