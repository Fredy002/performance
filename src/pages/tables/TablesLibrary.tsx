import { ArrowRight, Table } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { PERFORMANCE_TABLE_GROUPS, getTable, type PerformanceTable } from '@/data/tables';

const KIND_LABEL: Record<PerformanceTable['kind'], string> = {
  conditions: 'Datos de ejercicio',
  'flight-planning': 'Tabla de 1 entrada',
  holding: 'Tabla de 2 entradas',
  figure: 'Tabla de referencia',
};

export default function TablesLibrary() {
  return (
    <>
      <PageHeader
        eyebrow={<><Table size={14} /> Referencia</>}
        title="Tablas de performance de aeronaves"
        subtitle="Tablas de referencia para ejercicios de performance, con datos, unidades y guía de uso. La planificación abreviada y la espera B737 alimentan la calculadora de combustible; las demás se consultan por separado."
      />
      <div className="grid grid-3">
        {PERFORMANCE_TABLE_GROUPS.map((group) => {
          const t = getTable(group.primaryId)!;
          return (
            <Link key={t.id} to={`/tables/${t.id}`} className="card tool-card">
              <span className="tool-card-icon tone-yellow">
                <Table size={20} />
              </span>
              <div className="tool-card-body">
                <div className="chip chip-accent">{t.category}</div>
                <h3>{group.title}</h3>
                <p>{group.summary ?? t.summary}</p>
              </div>
              <div className="tool-card-footer">
                <span className="chip">{t.aircraft ?? KIND_LABEL[t.kind]}</span>
                <span className="tool-card-cta">
                  Ver tabla <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
