import { Camera, ImageUp, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import type { ParseField, ParseReport } from '@/exercises/parseStatement';
import { recognizeImage, type OcrProgress, type OcrResult } from '@/services/ocr';

/** Group data by route, trip, alternate, holding and taxi. */
const GROUPS: { label: string; keys: string[] }[] = [
  { label: 'Ruta', keys: ['route'] },
  { label: 'Viaje', keys: ['td', 'tw', 'tfl'] },
  { label: 'Alterno', keys: ['ad', 'aw', 'afl'] },
  { label: 'Espera', keys: ['hw', 'hfl', 'hm'] },
  { label: 'Taxi', keys: ['taxi'] },
];

const SHORT: Record<string, string> = {
  td: 'distancia',
  tw: 'viento',
  ad: 'distancia',
  aw: 'viento',
  hw: 'peso',
  hfl: 'nivel',
  hm: 'tiempo',
  taxi: 'combustible',
};

function DataChips({ fields }: { fields: ParseField[] }) {
  return (
    <div className="data-chips" aria-label="Datos detectados">
      {GROUPS.map((g) => {
        const fs = g.keys.map((k) => fields.find((f) => f.key === k)).filter((f): f is ParseField => !!f);
        const missing = fs.filter((f) => f.required && f.status === 'missing');
        const assumed = fs.some((f) => f.status === 'assumed');
        const values = fs.filter((f) => f.value !== undefined).map((f) => (f.status === 'assumed' ? `${f.value}*` : f.value));
        const state = missing.length ? 'mismatch' : assumed ? 'rounding' : values.length ? 'match' : 'neutral';
        return (
          <span key={g.label} className={`data-chip status-${state}`}>
            <b>{g.label}</b>
            {values.length > 0 && <span>{values.join(' · ')}</span>}
            {missing.length > 0 && <span>falta {missing.map((f) => SHORT[f.key] ?? f.label).join(' y ')}</span>}
            {!values.length && !missing.length && <span>sin indicar</span>}
          </span>
        );
      })}
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
      setError('El archivo no es una imagen.');
      return;
    }
    busyRef.current = true;
    const request = ++requestRef.current;
    const current = () => mountedRef.current && requestRef.current === request;
    setError(undefined);
    onStatusRef.current('loading');
    setProgress({ stage: 'prepare', progress: 0, status: 'Preparando la imagen…' });
    try {
      const res = await recognizeImage(file, (next) => {
        if (current()) setProgress(next);
      });
      if (current()) onAnalysisRef.current(res);
    } catch (cause) {
      if (current()) {
        onStatusRef.current('failed');
        const detail = cause instanceof Error ? cause.message : 'Revisa la conexión o escribe el enunciado.';
        setError(`No se pudo analizar la imagen con Claude. ${detail}`);
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
      ? { cls: 'status-neutral', label: 'Esperando enunciado' }
      : editedByHand
        ? { cls: 'status-neutral', label: 'Datos editados a mano' }
        : report?.complete
          ? { cls: 'status-match', label: 'Resuelto' }
          : { cls: 'status-mismatch', label: 'Faltan datos' };

  return (
    <Card
      title="Enunciado"
      className={`statement-card${dragging ? ' is-dragging' : ''}`}
      action={
        <select
          className="select select-compact"
          aria-label="Cargar un ejemplo"
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
            Ejemplos
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
          aria-label="Enunciado del ejercicio"
          value={text}
          rows={6}
          disabled={!!progress}
          placeholder={'Escribe o pega el enunciado, por ejemplo:\nOrigen - destino: SPUR - SPJC 750 nm F350 (50 TW)\nDestino - alterno: SPJC - SPSO 145 nm F190 (30 HW)\nHolding con 92500 lbs · Taxi: 400 lbs'}
          onChange={(e) => {
            setError(undefined);
            onTextChange(e.target.value);
          }}
        />

        <div className="statement-toolbar">
          <button className="btn btn-primary" onClick={() => cameraRef.current?.click()} disabled={!!progress}>
            <Camera size={16} /> Foto
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()} disabled={!!progress}>
            <ImageUp size={16} /> Imagen
          </button>
          {text && (
            <button className="btn btn-ghost btn-icon" onClick={() => onTextChange('')} disabled={!!progress} aria-label="Borrar el enunciado" title="Borrar">
              <Trash2 size={16} />
            </button>
          )}
          {status && <span className={`status ${status.cls} statement-status`}>{status.label}</span>}
        </div>
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden disabled={!!progress} onChange={onFile} aria-label="Tomar foto del enunciado" />
        <input ref={fileRef} type="file" accept="image/*" hidden disabled={!!progress} onChange={onFile} aria-label="Subir imagen del enunciado" />

        {progress && (
          <div className="stack gap-8" role="status">
            <span className="progress-status">{progress.status}</span>
            <div className="progress">
              <div className="progress-bar" style={{ width: `${Math.round(progress.progress * 100)}%` }} />
            </div>
            {progress.stage === 'analyze' && <span className="field-hint">Claude está interpretando la imagen; espera unos segundos.</span>}
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
          También puedes pegar una captura (Ctrl+V) o arrastrarla aquí. La imagen se envía a Claude para interpretar el
          enunciado. Si un dato no se distingue, queda pendiente para que lo completes.
          {report?.fields.some((f) => f.status === 'assumed') && ' * Supuesto: no figura en el enunciado.'}
        </p>
      </div>
    </Card>
  );
}
