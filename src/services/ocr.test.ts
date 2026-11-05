// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { recognizeImage } from './ocr';
import { IMAGE_ANALYSIS_SCHEMA } from './statementAnalysis';

const image = () => new File(['image-content'], 'exercise.png', { type: 'image/png' });
const result = () => ({
  text: 'Un enunciado interpretado directamente de una imagen.',
  parsed: { aircraft: 'B737', trip: { distanceNm: 750, windKt: 50, windKind: 'TW' }, alternate: {}, holding: {}, taxiFuelLb: null },
  warnings: ['No se distingue el alterno.'],
});

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('cliente de análisis de imágenes', () => {
  it('envía una imagen al servidor sin credenciales de Anthropic', async () => {
    vi.stubEnv('VITE_STATEMENT_API_URL', '');
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(result())));
    vi.stubGlobal('fetch', request);
    const analysis = await recognizeImage(image());
    expect(analysis.parsed.trip.distanceNm).toBe(750);
    expect(analysis.parsed.taxiFuelLb).toBeUndefined();
    expect(analysis.warnings).toEqual(['No se distingue el alterno.']);
    const [url, init] = request.mock.calls[0];
    expect(url).toBe('/api/analyze-statement');
    expect(init?.method).toBe('POST');
    expect(new Headers(init?.headers).has('Authorization')).toBe(false);
    expect(new Headers(init?.headers).has('x-api-key')).toBe(false);
    const payload = JSON.parse(String(init?.body));
    expect(payload.image.mediaType).toBe('image/png');
    expect(atob(payload.image.data)).toBe('image-content');
  });

  it('permite un backend desplegado por separado', async () => {
    vi.stubEnv('VITE_STATEMENT_API_URL', 'https://api.example.test/api/analyze-statement');
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(result())));
    vi.stubGlobal('fetch', request);
    await recognizeImage(image());
    expect(request.mock.calls[0][0]).toBe('https://api.example.test/api/analyze-statement');
  });

  it('envía el idioma seleccionado al backend y localiza validaciones de imagen', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(result())));
    vi.stubGlobal('fetch', request);
    await recognizeImage(image(), undefined, 'en');
    expect(new Headers(request.mock.calls[0][1]?.headers).get('Accept-Language')).toBe('en');
    await expect(
      recognizeImage(new File(['document'], 'file.pdf', { type: 'application/pdf' }), undefined, 'en'),
    ).rejects.toThrow('Use a JPEG, PNG, GIF, or WebP image.');
  });

  it('rechaza archivos no compatibles antes de subirlos', async () => {
    const request = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', request);
    await expect(recognizeImage(new File(['document'], 'file.pdf', { type: 'application/pdf' }))).rejects.toThrow('JPEG, PNG, GIF o WebP');
    await expect(recognizeImage(new File([], 'empty.png', { type: 'image/png' }))).rejects.toThrow('vacía');
    expect(request).not.toHaveBeenCalled();
  });

  it('muestra el error de configuración del servidor para permitir corregirlo', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ error: 'La credencial de Claude ha vencido.' }), { status: 503 })));
    await expect(recognizeImage(image())).rejects.toThrow('La credencial de Claude ha vencido.');
  });

  it('rechaza respuestas incompletas en vez de volver al parser local de fotos', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ text: 'Texto sin estructura', warnings: [] }))));
    await expect(recognizeImage(image())).rejects.toThrow('inválida');
  });

  it('respeta el límite del proveedor de 16 campos con tipos alternativos', () => {
    function unions(value: unknown): number {
      if (!value || typeof value !== 'object') return 0;
      const node = value as Record<string, unknown>;
      return (Array.isArray(node.anyOf) || Array.isArray(node.type) ? 1 : 0)
        + Object.values(node).reduce<number>((total, child) => total + (Array.isArray(child) ? child.reduce((sum, item) => sum + unions(item), 0) : unions(child)), 0);
    }
    expect(unions(IMAGE_ANALYSIS_SCHEMA)).toBeLessThanOrEqual(16);
  });
});
