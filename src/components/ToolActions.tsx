import { Eraser, Link2, RotateCcw, Save } from 'lucide-react';
import { addHistory } from '@/state/history';
import { showToast } from '@/state/toast';
import { shareUrl } from '@/hooks/useFormValues';

interface Props {
  toolId: string;
  href: string;
  canSave: boolean;
  summary: string;
  result: string;
  onReset: () => void;
  onClear?: () => void;
}

/** Barra de acciones común a todas las calculadoras. */
export function ToolActions({ toolId, href, canSave, summary, result, onReset, onClear }: Props) {
  const save = () => {
    addHistory({ toolId, href, summary, result });
    showToast('Cálculo guardado en el historial');
  };
  const share = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl(href));
      showToast('Enlace copiado al portapapeles');
    } catch {
      showToast('No se pudo copiar el enlace');
    }
  };
  return (
    <>
      {onClear && (
        <button className="btn" onClick={onClear} title="Vaciar campos">
          <Eraser size={16} /> <span className="desktop-only">Vaciar</span>
        </button>
      )}
      <button className="btn" onClick={onReset} title="Restaurar ejemplo">
        <RotateCcw size={16} /> <span className="desktop-only">Ejemplo</span>
      </button>
      <button className="btn" onClick={share} title="Copiar enlace">
        <Link2 size={16} /> <span className="desktop-only">Compartir</span>
      </button>
      <button className="btn btn-primary" onClick={save} disabled={!canSave}>
        <Save size={16} /> Guardar
      </button>
    </>
  );
}
