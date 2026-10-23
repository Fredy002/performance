/**
 * Reconocimiento de texto (OCR) en el navegador con Tesseract.js.
 * - La librería se importa bajo demanda: no pesa en la carga inicial de la app.
 * - El motor (WASM) y el modelo de español se descargan del CDN jsDelivr con versiones
 *   fijas la primera vez (~5 MB) y quedan en la caché del navegador.
 * - La imagen se procesa en el dispositivo: no se envía a ningún servidor.
 * Funciona bien con texto impreso o capturas de pantalla; no con letra manuscrita.
 */

export interface OcrProgress {
  stage: 'engine' | 'recognize';
  /** 0–1 */
  progress: number;
  status: string;
}

export interface OcrResult {
  text: string;
  /** Confianza media 0–100 */
  confidence: number;
}

type Listener = (p: OcrProgress) => void;

let listener: Listener | undefined;
let workerPromise: Promise<import('tesseract.js').Worker> | undefined;

const STATUS: Record<string, string> = {
  'loading tesseract core': 'Descargando el motor de reconocimiento…',
  'initializing tesseract': 'Iniciando el motor…',
  'loading language traineddata': 'Descargando el modelo de español…',
  'initializing api': 'Preparando el reconocimiento…',
  'recognizing text': 'Reconociendo el texto…',
};

function getWorker() {
  if (!workerPromise) {
    workerPromise = import('tesseract.js').then(({ createWorker }) =>
      createWorker('spa', 1, {
        logger: (m: { status: string; progress: number }) =>
          listener?.({
            stage: m.status === 'recognizing text' ? 'recognize' : 'engine',
            progress: m.progress,
            status: STATUS[m.status] ?? m.status,
          }),
      }),
    );
    // si falla (sin conexión la primera vez), se podrá reintentar
    workerPromise.catch(() => (workerPromise = undefined));
  }
  return workerPromise;
}

/** Reduce fotos muy grandes (móvil) para acelerar el reconocimiento sin perder legibilidad. */
async function prepareImage(file: Blob, maxSide = 2400): Promise<Blob> {
  if (typeof createImageBitmap !== 'function') return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
    if (scale === 1) return file;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((res) => canvas.toBlob((b) => res(b ?? file), 'image/png'));
  } catch {
    return file;
  }
}

export async function recognizeImage(file: Blob, onProgress?: Listener): Promise<OcrResult> {
  listener = onProgress;
  try {
    const [worker, image] = await Promise.all([getWorker(), prepareImage(file)]);
    const { data } = await worker.recognize(image);
    return { text: data.text, confidence: data.confidence };
  } finally {
    listener = undefined;
  }
}
