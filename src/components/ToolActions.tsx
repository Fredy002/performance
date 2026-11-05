import { Eraser, Link2, RotateCcw, Save } from 'lucide-react';
import { useId } from 'react';
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
  /**
   * Guarda el estado actual antes de «Ejemplo» o «Vaciar» y devuelve cómo
   * restaurarlo, para ofrecer «Deshacer».
   */
  capture?: () => () => void;
}

/** Barra de acciones común a todas las calculadoras. */
export function ToolActions({ toolId, href, canSave, summary, result, onReset, onClear, capture }: Props) {
  const hintId = useId();
  const withUndo = (run: () => void, message: string) => () => {
    const restore = capture?.();
    run();
    showToast(message, { kind: 'info', action: restore ? { label: 'Deshacer', run: restore } : undefined });
  };
  const save = () => {
    addHistory({ toolId, href, summary, result });
    showToast('Cálculo guardado en el historial');
  };
  const share = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl(href));
      showToast('Enlace copiado: pégalo para abrir este cálculo con los mismos datos');
    } catch {
      showToast('No se pudo copiar el enlace. Copia la dirección desde la barra del navegador.', { kind: 'error' });
    }
  };
  return (
    <>
      {onClear && (
        <button className="btn" onClick={withUndo(onClear, 'Campos vaciados')} title="Borra todos los campos">
          <Eraser size={16} aria-hidden="true" /> Vaciar
        </button>
      )}
      <button className="btn" onClick={withUndo(onReset, 'Se cargó el ejemplo')} title="Sustituye tus datos por el ejemplo">
        <RotateCcw size={16} aria-hidden="true" /> Ejemplo
      </button>
      <button className="btn" onClick={share} title="Copia un enlace a este cálculo">
        <Link2 size={16} aria-hidden="true" /> Compartir
      </button>
      <button className="btn btn-primary" onClick={save} disabled={!canSave} aria-describedby={canSave ? undefined : hintId}>
        <Save size={16} aria-hidden="true" /> Guardar
      </button>
      {!canSave && (
        <span id={hintId} className="actions-hint">
          Guardar se activa cuando hay un resultado.
        </span>
      )}
    </>
  );
}
