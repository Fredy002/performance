import { Camera, ImageUp, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { InfoTip } from '@/components/ui/InfoTip';
import type { ParseField, ParseReport } from '@/exercises/parseStatement';
import { recognizeImage, type OcrProgress, type OcrResult } from '@/services/ocr';
import { useI18n, type MessageKey } from '@/i18n';

/** Group data by route, trip, alternate, holding and taxi. */
const GROUPS: { label: MessageKey; keys: string[] }[] = [
  { label: 'fuel.group.route', keys: ['route'] },
  { label: 'fuel.group.trip', keys: ['td', 'tw', 'tfl'] },
  { label: 'fuel.group.alternate', keys: ['ad', 'aw', 'afl'] },
  { label: 'fuel.group.holding', keys: ['hw', 'hfl', 'hm'] },
  { label: 'fuel.group.taxi', keys: ['taxi'] },
];

const SHORT: Record<string, MessageKey> = {
  td: 'fuel.field.distanceShort',
  tw: 'fuel.field.windShort',
  ad: 'fuel.field.distanceShort',
  aw: 'fuel.field.windShort',
  hw: 'fuel.field.weightShort',
  hfl: 'fuel.field.levelShort',
  hm: 'fuel.field.timeShort',
  taxi: 'fuel.field.fuelShort',
};

function DataChips({ fields }: { fields: ParseField[] }) {
  const { locale, t } = useI18n();
  return (
    <div className="stack gap-8">
    <div className="chip-legend">
      <span className="with-help">
        <b>{t('fuel.ocrDataDetected')}</b>
        <InfoTip label={t('fuel.ocrDataDetected')}>{t('help.statementChips')}</InfoTip>
      </span>
      <span><span className="dot is-match" aria-hidden="true" />{t('fuel.ocrRead')}</span>
      <span><span className="dot is-assumed" aria-hidden="true" />{t('fuel.ocrAssumed')}</span>
      <span><span className="dot is-missing" aria-hidden="true" />{t('fuel.ocrMissing')}</span>
    </div>
    <div className="data-chips" role="group" aria-label={t('fuel.ocrAria')}>
      {GROUPS.map((g) => {
        const fs = g.keys.map((k) => fields.find((f) => f.key === k)).filter((f): f is ParseField => !!f);
        const missing = fs.filter((f) => f.required && f.status === 'missing');
        const assumed = fs.some((f) => f.status === 'assumed');
        const values = fs.filter((f) => f.value !== undefined).map((f) => (f.status === 'assumed' ? `${f.value}*` : f.value));
        const state = missing.length ? 'mismatch' : assumed ? 'rounding' : values.length ? 'match' : 'neutral';
        return (
          <span key={g.label} className={`data-chip status-${state}`}>
            <b>{t(g.label)}</b>
            {values.length > 0 && <span>{values.join(' · ')}</span>}
            {missing.length > 0 && <span>{t('fuel.missing', { fields: missing.map((f) => SHORT[f.key] ? t(SHORT[f.key]) : f.label).join(locale === 'en' ? ', and ' : ' y ') })}</span>}
            {!values.length && !missing.length && <span>{t('fuel.notSpecified')}</span>}
          </span>
        );
      })}
    </div>
    </div>
  );
}

interface Props {
  text: string;
  revision: number;
  onTextChange: (text: string) => void;
  onImageAnalysis: (result: OcrResult) => void;
  onAnalysisStatusChange: (status: 'loading' | 'failed') => void;
  report?: ParseReport;
  examples: { id: string; label: string; text: string }[];
  /** The user manually edited the data after entering the statement. */
  editedByHand: boolean;
}

/**
 * A single exercise input supports text, pasted or dropped images, and camera photos.
 * Show the Claude-interpreted statement in the same editable text area.
 */
export function StatementBox({ text, revision, onTextChange, onImageAnalysis, onAnalysisStatusChange, report, examples, editedByHand }: Props) {
  const { locale, t } = useI18n();
  const [progress, setProgress] = useState<OcrProgress>();
  const [error, setError] = useState<string>();
  const [dragging, setDragging] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);
  const mountedRef = useRef(true);
  const requestRef = useRef(0);
  // The paste listener always reads the latest parent callback.
  const onAnalysisRef = useRef(onImageAnalysis);
  onAnalysisRef.current = onImageAnalysis;
  const onStatusRef = useRef(onAnalysisStatusChange);
  onStatusRef.current = onAnalysisStatusChange;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      requestRef.current += 1;
    };
  }, []);

  // Discard pending responses when an example is restored or the statement changes.
  useEffect(() => {
    setError(undefined);
    if (busyRef.current) {
      requestRef.current += 1;
      busyRef.current = false;
      setProgress(undefined);
    }
  }, [revision]);

  const readImage = async (file: Blob) => {
    if (busyRef.current) return;
    if (!file.type.startsWith('image/')) {
      setError(t('fuel.notImage'));
      return;
    }
    busyRef.current = true;
    const request = ++requestRef.current;
    const current = () => mountedRef.current && requestRef.current === request;
    setError(undefined);
    onStatusRef.current('loading');
    setProgress({ stage: 'prepare', progress: 0, status: t('fuel.prepareImage') });
    try {
      const res = await recognizeImage(file, (next) => {
        if (current()) setProgress(next);
      }, locale);
      if (current()) onAnalysisRef.current(res);
    } catch (cause) {
      if (current()) {
        onStatusRef.current('failed');
        const detail = cause instanceof Error ? cause.message : t('fuel.retryOrType');
        setError(t('fuel.analyzeError', { detail }));
      }
    } finally {
      if (current()) {
        busyRef.current = false;
        setProgress(undefined);
      }
    }
  };

  // Handle an image pasted from the clipboard.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = [...(e.clipboardData?.items ?? [])].find((i) => i.type.startsWith('image/'))?.getAsFile();
      if (file) {
        e.preventDefault();
        void readImage(file);
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, []);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (f) void readImage(f);
  };

  const status = progress
    ? null
    : !text.trim()
      ? { cls: 'status-neutral', label: t('fuel.statementStatusWaiting') }
      : editedByHand
        ? { cls: 'status-neutral', label: t('fuel.statementStatusEdited') }
        : report?.complete
          ? { cls: 'status-match', label: t('fuel.statementStatusSolved') }
          : { cls: 'status-mismatch', label: t('fuel.statementStatusMissing') };

  return (
    <Card
      title={t('fuel.statementTitle')}
      className={`statement-card${dragging ? ' is-dragging' : ''}`}
      action={
        <select
          className="select select-compact"
          aria-label={t('fuel.loadExample')}
          value=""
          disabled={!!progress}
          onChange={(e) => {
            const ex = examples.find((x) => x.id === e.target.value);
            if (ex) {
              setError(undefined);
              onTextChange(ex.text);
            }
          }}
        >
          <option value="" disabled>
            {t('fuel.loadExample')}
          </option>
          {examples.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.label}
            </option>
          ))}
        </select>
      }
    >
      <div
        className="stack gap-12"
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void readImage(f);
        }}
      >
        <textarea
          className="capture-text statement-text"
          aria-label={t('fuel.exerciseStatementAria')}
          value={text}
          rows={6}
          disabled={!!progress}
          placeholder={t('fuel.statementPlaceholder')}
          onChange={(e) => {
            setError(undefined);
            onTextChange(e.target.value);
          }}
        />

        <div className="statement-toolbar">
          <button className="btn btn-primary" onClick={() => cameraRef.current?.click()} disabled={!!progress} title={t('fuel.takePhotoTitle')}>
            <Camera size={16} aria-hidden="true" /> {t('fuel.takePhotoButton')}
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()} disabled={!!progress} title={t('fuel.imageButtonTitle')}>
            <ImageUp size={16} aria-hidden="true" /> {t('fuel.imageButton')}
          </button>
          {text && (
            <button className="btn btn-ghost btn-icon" onClick={() => onTextChange('')} disabled={!!progress} aria-label={t('fuel.clearStatement')} title={t('fuel.clear')}>
              <Trash2 size={16} aria-hidden="true" />
            </button>
          )}
          {status && <span className={`status ${status.cls} statement-status`}>{status.label}</span>}
        </div>
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden disabled={!!progress} onChange={onFile} aria-label={t('fuel.takePhoto')} />
        <input ref={fileRef} type="file" accept="image/*" hidden disabled={!!progress} onChange={onFile} aria-label={t('fuel.uploadImage')} />

        {progress && (
          <div className="stack gap-8" role="status">
            <span className="progress-status">{progress.status}</span>
            <div className="progress">
              <div className="progress-bar" style={{ width: `${Math.round(progress.progress * 100)}%` }} />
            </div>
            {progress.stage === 'analyze' && <span className="field-hint">{t('fuel.ocrProgress')}</span>}
          </div>
        )}

        {error && <Alert kind="error">{error}</Alert>}
        {report && !progress && <DataChips fields={report.fields} />}
        {report?.warnings.map((w) => (
          <Alert key={w} kind="warning">
            {w}
          </Alert>
        ))}

        <p className="field-hint">
          {t('fuel.pasteHint')}
        </p>
      </div>
    </Card>
  );
}
