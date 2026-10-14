import { ArrowRight, Table } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { PERFORMANCE_TABLES, type PerformanceTable } from '@/data/tables';

const KIND_LABEL: Record<PerformanceTable['kind'], string> = {
  conditions: 'Datos de ejercicio',
  'flight-planning': 'Tabla de 1 entrada',
  holding: 'Tabla de 2 entradas',
};

export default function TablesLibrary() {
  return (
    <>
      <PageHeader
        eyebrow={<><Table size={14} /> Referencia</>}
        title="Tablas de performance"
        subtitle="Tablas digitalizadas del suplemento de examen de la FAA, con explicación de para qué sirven y cómo se usan. Por ahora son solo de consulta: no están conectadas a ninguna calculadora."
      />
      <div className="grid grid-3">
        {PERFORMANCE_TABLES.map((t) => (
          <Link key={t.id} to={`/tables/${t.id}`} className="card tool-card">
            <span className="tool-card-icon">
              <Table size={22} />
            </span>
            <div>
              <div className="chip chip-accent" style={{ marginBottom: 8 }}>
                {t.source.figure.replace('FIGURE', 'Figura')}
              </div>
              <h3>{t.title}</h3>
              <p style={{ marginTop: 4 }}>{t.summary}</p>
            </div>
            <div className="tool-card-footer">
              <span className="chip">{t.aircraft ?? KIND_LABEL[t.kind]}</span>
              <span className="row" style={{ gap: 4 }}>
                Ver tabla <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
