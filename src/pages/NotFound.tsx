import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="card empty" style={{ padding: 60 }}>
      <Compass size={40} />
      <h2>Página no encontrada</h2>
      <p>Parece que te has salido de la ruta prevista.</p>
      <Link to="/" className="btn btn-primary">
        Volver al panel
      </Link>
    </div>
  );
}
