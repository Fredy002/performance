import { Construction } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getTool } from '@/tools/registry';
import NotFound from './NotFound';

export default function ToolPage() {
  const { toolId = '' } = useParams();
  const tool = getTool(toolId);
  if (!tool) return <NotFound />;
  if (tool.status !== 'ready' || !tool.component) {
    return (
      <div className="card empty empty-page">
        <Construction size={40} />
        <h1 className="empty-page-title">{tool.name}</h1>
        <p>Esta herramienta está en desarrollo. Mientras tanto, puedes usar las calculadoras disponibles o consultar las tablas.</p>
        <Link to="/" className="btn">
          Volver al inicio
        </Link>
      </div>
    );
  }
  const Component = tool.component;
  // la key fuerza un estado limpio al pasar entre herramientas
  return <Component key={tool.id} />;
}
