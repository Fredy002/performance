import { IMAGE_MEDIA_TYPES, MAX_IMAGE_BYTES, normalizeImageAnalysis, type ImageAnalysis } from './statementAnalysis';
import { localizeServiceMessage } from '@/i18n/messages/services';
import type { Locale } from '@/i18n/types';

export interface OcrProgress {
  stage: 'prepare' | 'analyze';
  progress: number;
  status: string;
}

export type OcrResult = ImageAnalysis;
type Listener = (progress: OcrProgress) => void;

/** Resize mobile photos before upload; Claude interprets their content. */
export async function prepareImage(file: Blob, maxSide = 2400): Promise<Blob> {
  if (typeof createImageBitmap !== 'function') return file;
  const bitmap = await createImageBitmap(file).catch(() => undefined);
  if (!bitmap) return file;
  try {
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= MAX_IMAGE_BYTES) return file;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext('2d');
    if (!context) return file;
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>(resolve => canvas.toBlob(blob => resolve(blob ?? file), 'image/jpeg', 0.92));
  } finally { bitmap.close(); }
}

export function toBase64(blob: Blob, locale: Locale): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(localizeServiceMessage(locale, 'No se pudo abrir la imagen. Prueba con otro archivo.')));
    reader.onload = () => {
      const data = typeof reader.result === 'string' ? reader.result.split(',')[1] : undefined;
      if (!data) reject(new Error(localizeServiceMessage(locale, 'No se pudo abrir la imagen. Prueba con otro archivo.')));
      else resolve(data);
    };
    reader.readAsDataURL(blob);
  });
}

/** Call the application server without exposing the Claude credential to the browser. */
export async function recognizeImage(file: Blob, onProgress?: Listener, locale: Locale = 'es'): Promise<OcrResult> {
  if (!(IMAGE_MEDIA_TYPES as readonly string[]).includes(file.type)) {
    throw new Error(localizeServiceMessage(locale, 'Usa una imagen JPEG, PNG, GIF o WebP.'));
  }
  if (!file.size) throw new Error(localizeServiceMessage(locale, 'La imagen está vacía. Elige otra foto.'));
  if (file.size > 25 * 1024 * 1024) {
    throw new Error(localizeServiceMessage(locale, 'La foto es demasiado grande. Usa una imagen de menos de 25 MB.'));
  }
  onProgress?.({ stage: 'prepare', progress: 0.1, status: localizeServiceMessage(locale, 'Preparando la imagen…') });
  const image = await prepareImage(file);
  if (image.size > MAX_IMAGE_BYTES) {
    throw new Error(localizeServiceMessage(locale, 'La imagen supera 5 MB después de prepararla. Recorta el enunciado y vuelve a intentarlo.'));
  }
  const data = await toBase64(image, locale);
  onProgress?.({
    stage: 'analyze',
    progress: 0.35,
    status: localizeServiceMessage(locale, 'Claude está interpretando el enunciado…'),
  });
  let response: Response;
  try {
    response = await fetch(import.meta.env.VITE_STATEMENT_API_URL?.trim() || '/api/analyze-statement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept-Language': locale },
      body: JSON.stringify({ image: { data, mediaType: image.type } }),
      signal: AbortSignal.timeout(65000),
    });
  } catch (error) {
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      throw new Error(localizeServiceMessage(locale, 'Claude tardó demasiado en responder. Vuelve a intentarlo.'));
    }
    throw new Error(
      localizeServiceMessage(locale, 'No se pudo conectar con el análisis de Claude. Revisa la conexión y que el servidor esté en marcha.'),
    );
  }
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'error' in body && typeof body.error === 'string' ? body.error : undefined;
    throw new Error(
      localizeServiceMessage(locale, message || 'El análisis de Claude no está disponible. Revisa la configuración del servidor.'),
    );
  }
  let result: OcrResult;
  try {
    result = normalizeImageAnalysis(body);
  } catch (error) {
    if (error instanceof Error) throw new Error(localizeServiceMessage(locale, error.message));
    throw error;
  }
  onProgress?.({
    stage: 'analyze',
    progress: 1,
    status: localizeServiceMessage(locale, 'Enunciado interpretado por Claude.'),
  });
  return result;
}
