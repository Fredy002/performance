import { ArrowRight, Camera, ClipboardPaste, ImageUp, LoaderCircle, PenLine, Sparkles, Trash2, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { useI18n } from '@/i18n';
import { AI_MODULES, type AIModule } from '@/services/aeroAnalysis';
import { analyzeExercise } from '@/services/aeroEngine';
import { withScenarioReference } from '@/services/aiReferences';
import { IMAGE_MEDIA_TYPES } from '@/services/statementAnalysis';
import { aiStepHref, createAISession } from '@/state/aiSession';

/** Shared capture surface. Image bytes never enter persistent browser storage. */
export function AIIntake({ context, compact = false }: { context?: AIModule; compact?: boolean }) {
  const { locale, t } = useI18n();
  const navigate = useNavigate();
  const id = useId();
  const [expanded, setExpanded] = useState(!compact);
  const [text, setText] = useState('');
  const [image, setImage] = useState<Blob>();
  const [preview, setPreview] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string>();
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const requestRef = useRef(0);
  const mountedRef = useRef(true);
  const busyRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; requestRef.current += 1; };
  }, []);

  useEffect(() => {
    if (!image) { setPreview(undefined); return; }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const invalidate = () => {
    requestRef.current += 1;
    busyRef.current = false;
    setBusy(false);
    setProgress('');
    setError(undefined);
  };

  const selectImage = (file: Blob) => {
    if (!(IMAGE_MEDIA_TYPES as readonly string[]).includes(file.type)) {
      setError(t('ai.intake.notImage'));
      return;
    }
    if (!file.size || file.size > 25 * 1024 * 1024) {
      setError(t('ai.intake.tooLarge'));
      return;
    }
    invalidate();
    setImage(file);
  };

  useEffect(() => {
    if (!expanded) return;
    const onPaste = (event: ClipboardEvent) => {
      const file = [...(event.clipboardData?.items ?? [])].find(item => item.type.startsWith('image/'))?.getAsFile();
      if (!file) return;
      event.preventDefault();
      selectImage(file);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [expanded, locale]);

  const pasteImage = async () => {
    try {
      if (!navigator.clipboard?.read) throw new Error();
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find(type => (IMAGE_MEDIA_TYPES as readonly string[]).includes(type));
        if (type) { selectImage(await item.getType(type)); return; }
      }
      throw new Error();
    } catch { setError(t('ai.intake.clipboardError')); textRef.current?.focus(); }
  };

  const analyze = async () => {
    if (busyRef.current || (!text.trim() && !image)) return;
    busyRef.current = true;
    const request = ++requestRef.current;
    const current = () => mountedRef.current && requestRef.current === request;
    setError(undefined);
    setBusy(true);
    setProgress(t('ai.intake.analyzing'));
    try {
      const analysis = withScenarioReference(await analyzeExercise({ text: text.trim() || undefined, image, context }, next => {
        if (current()) setProgress(next.status);
      }, locale), text, locale);
      if (!current()) return;
      const first = analysis.steps[0];
      if (!first || !(AI_MODULES as readonly string[]).includes(first.module)) {
        setError([t('ai.intake.unsupported'), ...analysis.unsupported, ...analysis.warnings].join(' '));
        return;
      }
      const session = createAISession(analysis, image, { locale, originalText: text });
      navigate(aiStepHref(session, first));
    } catch (cause) {
      if (current()) setError(cause instanceof Error && cause.message ? cause.message : t('ai.intake.failed'));
    } finally {
      if (current()) { busyRef.current = false; setBusy(false); setProgress(''); }
    }
  };

  if (!expanded) return (
    <div className="ai-intake-closed">
      <button className="btn" onClick={() => setExpanded(true)}><Sparkles size={16} aria-hidden="true" />{t('ai.intake.open')}</button>
    </div>
  );

  return (
    <section
      className={`card ai-intake${compact ? ' ai-intake-compact' : ''}${dragging ? ' is-dragging' : ''}`}
      aria-labelledby={`${id}-title`}
      aria-busy={busy}
      onDragOver={event => { event.preventDefault(); setDragging(true); }}
      onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }}
      onDrop={event => {
        event.preventDefault();
        setDragging(false);
        const file = event.dataTransfer.files[0];
        if (file) selectImage(file);
      }}
    >
      <div className="ai-intake-topline">
        <span className="ai-intake-eyebrow"><Sparkles size={16} aria-hidden="true" />{t('ai.intake.title')}</span>
        {compact && <button className="btn btn-ghost btn-icon" aria-label={t('ai.intake.close')} onClick={() => { invalidate(); setExpanded(false); }}><X size={18} /></button>}
      </div>
      <h2 id={`${id}-title`}>{t('ai.intake.heading')}</h2>
      <p className="ai-intake-description">{t('ai.intake.description')}</p>

      <div className="ai-capture-actions">
        <button className="btn" onClick={() => cameraRef.current?.click()}><Camera size={18} aria-hidden="true" />{t('ai.intake.camera')}</button>
        <button className="btn" onClick={() => fileRef.current?.click()}><ImageUp size={18} aria-hidden="true" />{t('ai.intake.upload')}</button>
        <button className="btn" onClick={() => textRef.current?.focus()}><PenLine size={18} aria-hidden="true" />{t('ai.intake.write')}</button>
        <button className="btn" onClick={() => void pasteImage()}><ClipboardPaste size={18} aria-hidden="true" />{t('ai.intake.paste')}</button>
      </div>
      <input ref={cameraRef} className="ai-file-input" type="file" accept="image/jpeg,image/png,image/gif,image/webp" capture="environment" aria-label={t('ai.intake.camera')} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) selectImage(file); }} />
      <input ref={fileRef} className="ai-file-input" type="file" accept="image/jpeg,image/png,image/gif,image/webp" aria-label={t('ai.intake.upload')} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) selectImage(file); }} />

      <div className={`ai-input-area${image ? ' has-image' : ''}`}>
        {preview && <figure className="ai-image-preview">
          <img src={preview} alt={t('ai.intake.image')} />
          <figcaption>
            <span>{t('ai.intake.ready')}</span>
            <div className="ai-image-actions">
              <button className="btn btn-sm" onClick={() => fileRef.current?.click()}>{t('ai.intake.replace')}</button>
              <button className="btn btn-ghost btn-icon" aria-label={t('ai.intake.remove')} onClick={() => { invalidate(); setImage(undefined); }}><Trash2 size={16} /></button>
            </div>
          </figcaption>
        </figure>}
        <div className="ai-text-area">
          <label className="field-label" htmlFor={`${id}-statement`}>{t('ai.intake.label')}</label>
          <textarea ref={textRef} id={`${id}-statement`} className="capture-text" maxLength={20000} value={text} placeholder={t('ai.intake.placeholder')} onChange={event => { invalidate(); setText(event.target.value); }} aria-describedby={`${id}-paste`} />
          <p id={`${id}-paste`} className="ai-input-hint">{t('ai.intake.pasteHint')}</p>
        </div>
      </div>
      {error && <Alert kind="error">{error}</Alert>}
      <div className="ai-intake-submit">
        <button className="btn btn-primary" disabled={busy || (!text.trim() && !image)} onClick={() => void analyze()}>
          {busy ? <LoaderCircle size={18} className="ai-spinner" aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}
          {busy ? t('ai.intake.analyzing') : error ? t('ai.intake.retry') : t('ai.intake.analyze')}
        </button>
        {busy && <button className="btn btn-ghost" onClick={invalidate}>{t('ai.intake.cancel')}</button>}
        <span role="status" aria-live="polite" className="ai-progress">{progress}</span>
      </div>
      <p className="ai-privacy">{t('ai.intake.privacy')}</p>
      <p className="ai-education">{t('ai.intake.educational')}</p>
    </section>
  );
}
