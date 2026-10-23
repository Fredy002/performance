import { Camera, ImageUp, Keyboard, ScanText, ShieldCheck, WandSparkles, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { analyzeStatement, type ParseDefaults, type ParseField } from '@/exercises/parseStatement';
import { recognizeImage, type OcrProgress } from '@/services/ocr';
import { reportToFuelForm, type FuelFormValues } from './fuelForm';

type Phase = 'idle' | 'working' | 'review' | 'error';

interface Props {
  defaults: ParseDefaults;
  /** Carga los datos en el formulario (la app resuelve en cuanto cambian) */
  onApply: (values: FuelFormValues) => void;
}

/** Confianza del OCR por debajo de la cual el texto suele tener errores. */
const LOW_CONFIDENCE = 60;

const STATUS_LABEL: Record<ParseField['status'], string> = {
  found: 'Detectado',
  assumed: 'Supuesto',
  missing: 'Falta',
};
const STATUS_CLASS: Record<ParseField['status'], string> = {
  found: 'status-match',
  assumed: 'status-rounding',
  missing: 'status-mismatch',
};

/**
 * Resolver un ejercicio desde una foto o captura del enunciado:
 * OCR en el navegador → lectura de los datos → el formulario se rellena y se resuelve.
 */
export function CaptureSolver({ defaults, onApply }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [image, setImage] = useState<string>();
  const [progress, setProgress] = useState<OcrProgress>();
  const [text, setText] = useState('');
  const [confidence, setConfidence] = useState<number>();
  const [error, setError] = useState<string>();
  const [applied, setApplied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  // URL de la vista previa (en una ref para liberarla también desde el listener de pegado)
  const imageUrl = useRef<string | undefined>(undefined);
  const showImage = (url?: string) => {
    if (imageUrl.current) URL.revokeObjectURL(imageUrl.current);
    imageUrl.current = url;
    setImage(url);
  };
  useEffect(() => () => showImage(undefined), []);

  const report = useMemo(() => (text.trim() ? analyzeStatement(text, defaults) : undefined), [text, defaults]);

  const apply = (r = report) => {
    if (!r) return;
    onApply(reportToFuelForm(r, defaults));
    setApplied(true);
  };

  const reset = () => {
    showImage(undefined);
    setPhase('idle');
    setText('');
    setConfidence(undefined);
    setError(undefined);
    setApplied(false);
    setProgress(undefined);
  };

  const handleImage = async (file: Blob) => {
    if (!file.type.startsWith('image/')) {
      setError('El archivo no es una imagen.');
      setPhase('error');
      return;
    }
    showImage(URL.createObjectURL(file));
    setPhase('working');
    setApplied(false);
    setError(undefined);
    setProgress({ stage: 'engine', progress: 0, status: 'Preparando…' });
    try {
      const res = await recognizeImage(file, setProgress);
      setText(res.text.trim());
      setConfidence(res.confidence);
      setPhase('review');
      // se resuelve solo si el enunciado trae todos los datos imprescindibles
      const r = analyzeStatement(res.text, defaults);
      if (r.complete) apply(r);
    } catch {
      setError('No se pudo leer la imagen. Comprueba la conexión (la primera vez se descarga el motor de reconocimiento) o escribe el enunciado.');
      setPhase('error');
    }
  };

  const startTyping = () => {
    reset();
    setPhase('review');
    requestAnimationFrame(() => textRef.current?.focus());
  };

  // Ctrl+V con una imagen en el portapapeles (p. ej. una captura de pantalla)
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = [...(e.clipboardData?.items ?? [])].find((i) => i.type.startsWith('image/'));
      const file = item?.getAsFile();
      if (file) {
        e.preventDefault();
        void handleImage(file);
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
    // se registra una vez: handleImage solo usa setters y la ref de la imagen
  }, []);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (f) void handleImage(f);
  };

  const missing = report?.fields.filter((f) => f.required && f.status === 'missing') ?? [];

  return (
    <Card
      title={
        <span className="row" style={{ gap: 8 }}>
          <ScanText size={17} /> Resolver desde una captura
        </span>
      }
      action={
        phase !== 'idle' && (
          <button className="btn btn-ghost btn-sm" onClick={reset}>
            <X size={15} /> Cerrar
          </button>
        )
      }
      className={dragging ? 'is-dragging' : undefined}
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void handleImage(f);
        }}
      >
        <p className="muted" style={{ fontSize: 14 }}>
          Toma una foto o sube una captura del enunciado; también puedes pegarla con Ctrl+V o arrastrarla aquí. Se leen
          distancias, vientos, peso de espera, taxi y aeropuertos, y el ejercicio se resuelve solo.
        </p>
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn btn-primary" onClick={() => cameraRef.current?.click()}>
            <Camera size={16} /> Tomar foto
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            <ImageUp size={16} /> Subir imagen
          </button>
          <button className="btn" onClick={startTyping}>
            <Keyboard size={16} /> Escribir o pegar texto
          </button>
        </div>
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={onFile} aria-label="Tomar foto del enunciado" />
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} aria-label="Subir imagen del enunciado" />
        <p className="field-hint" style={{ marginTop: 10, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
          <ShieldCheck size={14} style={{ flexShrink: 0, marginTop: 2 }} /> La imagen se procesa en tu dispositivo. Funciona con enunciados impresos o capturas de
          pantalla; la letra manuscrita no se reconoce de forma fiable (en ese caso, escribe el enunciado).
        </p>

        {phase === 'working' && progress && (
          <div className="stack" style={{ gap: 6, marginTop: 16 }} role="status">
            <span style={{ fontSize: 14 }}>{progress.status}</span>
            <div className="progress">
              <div className="progress-bar" style={{ width: `${Math.round(progress.progress * 100)}%` }} />
            </div>
            {progress.stage === 'engine' && <span className="field-hint">Solo la primera vez: se descargan unos 5 MB.</span>}
          </div>
        )}

        {phase === 'error' && error && (
          <div style={{ marginTop: 16 }}>
            <Alert kind="error">{error}</Alert>
          </div>
        )}

        {phase === 'review' && (
          <div className="capture-review">
            {image && <img src={image} alt="Captura del enunciado" className="capture-preview" />}
            <div className="stack" style={{ gap: 12, minWidth: 0 }}>
              {confidence !== undefined && confidence < LOW_CONFIDENCE && (
                <Alert kind="warning">
                  La captura se leyó con baja confianza ({Math.round(confidence)} %). Revisa el texto; si es manuscrita,
                  escribe el enunciado.
                </Alert>
              )}
              <div className="field">
                <label className="field-label" htmlFor="capture-text">
                  Texto del enunciado {image ? '(reconocido; puedes corregirlo)' : ''}
                </label>
                <textarea
                  id="capture-text"
                  ref={textRef}
                  className="capture-text"
                  value={text}
                  rows={7}
                  placeholder={'Origen - destino: SPUR - SPJC distancia 750 nm F350 (50 TW)\nDestino - alterno: SPJC - SPSO distancia 145 nm F190 (30 HW)\nHolding con 92500 lbs\nCombustible para el taxi: 400 lbs'}
                  onChange={(e) => {
                    setText(e.target.value);
                    setApplied(false);
                  }}
                />
              </div>

              {report && (
                <>
                  <div className="data-table-wrap" style={{ borderRadius: 10, border: '1px solid var(--border)' }}>
                    <table className="data-table capture-fields">
                      <thead>
                        <tr>
                          <th>Dato</th>
                          <th>Valor</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.fields.map((f) => (
                          <tr key={f.key}>
                            <td>{f.label}</td>
                            <td>{f.value ?? '—'}</td>
                            <td>
                              <span className={`status ${f.status === 'missing' && !f.required ? 'status-neutral' : STATUS_CLASS[f.status]}`}>
                                {f.status === 'missing' && !f.required ? 'No indicado' : STATUS_LABEL[f.status]}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {report.warnings.map((w) => (
                    <Alert key={w} kind="warning">
                      {w}
                    </Alert>
                  ))}
                  {report.fields.some((f) => f.status === 'assumed') && (
                    <p className="field-hint">
                      «Supuesto»: el enunciado no lo indica y se usa el criterio habitual (espera de {defaults.holdingMinutes} min a FL{' '}
                      {String(defaults.holdingFlightLevel).padStart(3, '0')}).
                    </p>
                  )}
                </>
              )}

              {applied ? (
                <Alert kind="info">Ejercicio resuelto con estos datos: revisa el formulario y el desarrollo más abajo.</Alert>
              ) : (
                report && (
                  <div className="row">
                    <button className="btn btn-primary" onClick={() => apply()} disabled={!report.complete}>
                      <WandSparkles size={16} /> Resolver
                    </button>
                    {!report.complete && (
                      <>
                        <span className="muted" style={{ fontSize: 13 }}>
                          Falta: {missing.map((f) => f.label.toLowerCase()).join(', ')}.
                        </span>
                        <button className="btn btn-sm" onClick={() => apply()}>
                          Cargar lo detectado
                        </button>
                      </>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
