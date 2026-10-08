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
      <div className="card empty" style={{ padding: 60 }}>
        <Construction size={40} />
        <h2>{tool.name}</h2>
        <p>Esta herramienta está en desarrollo.</p>
        <Link to="/" className="btn">
          Volver al panel
        </Link>
      </div>
    );
  }
  const Component = tool.component;
  // la key fuerza un estado limpio al pasar entre herramientas
  return <Component key={tool.id} />;
}
