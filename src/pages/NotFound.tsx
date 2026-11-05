import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="card empty empty-page">
      <Compass size={40} />
      <h1 className="empty-page-title">Página no encontrada</h1>
      <p>El enlace no existe o ha cambiado. Vuelve al inicio o usa «Buscar» para encontrar lo que necesitas.</p>
      <Link to="/" className="btn btn-primary">
        Volver al inicio
      </Link>
    </div>
  );
}
