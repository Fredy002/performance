import { Eraser, Link2, RotateCcw, Save } from 'lucide-react';
import { useId } from 'react';
import { addHistory } from '@/state/history';
import { showToast } from '@/state/toast';
import { shareUrl } from '@/hooks/useFormValues';
import { useI18n } from '@/i18n';

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
  const { t } = useI18n();
  const withUndo = (run: () => void, message: string) => () => {
    const restore = capture?.();
    run();
    showToast(message, { kind: 'info', action: restore ? { label: t('ui.actions.undo'), run: restore } : undefined });
  };
  const save = () => {
    addHistory({ toolId, href, summary, result });
    showToast(t('ui.actions.saved'));
  };
  const share = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl(href));
      showToast(t('ui.actions.shareSuccess'));
    } catch {
      showToast(t('ui.actions.shareError'), { kind: 'error' });
    }
  };
  return (
    <>
      {onClear && (
        <button className="btn" onClick={withUndo(onClear, t('ui.actions.cleared'))} title={t('ui.actions.clearTitle')}>
          <Eraser size={16} aria-hidden="true" /> {t('ui.actions.clear')}
        </button>
      )}
      <button className="btn" onClick={withUndo(onReset, t('ui.actions.loadedExample'))} title={t('ui.actions.exampleTitle')}>
        <RotateCcw size={16} aria-hidden="true" /> {t('ui.actions.example')}
      </button>
      <button className="btn" onClick={share} title={t('ui.actions.shareTitle')}>
        <Link2 size={16} aria-hidden="true" /> {t('ui.actions.share')}
      </button>
      <button className="btn btn-primary" onClick={save} disabled={!canSave} aria-describedby={canSave ? undefined : hintId}>
        <Save size={16} aria-hidden="true" /> {t('ui.actions.save')}
      </button>
      {!canSave && (
        <span id={hintId} className="actions-hint">
          {t('ui.actions.saveHint')}
        </span>
      )}
    </>
  );
}
