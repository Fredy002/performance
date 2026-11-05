import { createServer, type Server } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createClaudeMiddleware, type ClaudeOptions } from '../../server/claude';
import { MAX_IMAGE_BYTES } from './statementAnalysis';

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO/a9WQAAAAASUVORK5CYII=';
const requestBody = () => ({ image: { mediaType: 'image/png', data: PNG } });
const analysis = () => ({
  text: 'Lectura del enunciado de una foto.',
  parsed: {
    aircraft: 'B737',
    trip: { from: 'SPUR', to: 'SPJC', distanceNm: 750, windKt: 50, windKind: 'TW' },
    alternate: { from: 'SPJC', to: 'SPSO', distanceNm: 145, windKt: 30, windKind: 'HW' },
    holding: { weightLb: 92500, flightLevel: null, minutes: null },
    taxiFuelLb: 400,
  },
  warnings: ['El nivel de espera no está indicado.'],
});
const providerResponse = (value: unknown = analysis()) => new Response(JSON.stringify({
  stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify(value) }],
}), { status: 200, headers: { 'Content-Type': 'application/json' } });
const servers: Server[] = [];

async function endpoint(options: ClaudeOptions) {
  const middleware = createClaudeMiddleware(options);
  const server = createServer((req, res) => {
    void middleware(req, res, () => { res.writeHead(404); res.end(); });
  });
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('No se pudo iniciar el servidor de prueba.');
  return `http://127.0.0.1:${address.port}`;
}

async function post(base: string, body: unknown = requestBody(), headers: Record<string, string> = {}) {
  return fetch(`${base}/api/analyze-statement`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body),
  });
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  })));
});

describe('servidor de análisis de fotos con Claude', () => {
  it('envía la imagen a Claude y mantiene la credencial solo en la cabecera del servidor', async () => {
    const apiKey = 'test-only-server-secret';
    const providerFetch = vi.fn<typeof fetch>().mockResolvedValueOnce(providerResponse());
    const base = await endpoint({ apiKey, model: 'test-vision-model', fetch: providerFetch });
    const response = await post(base);
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    const body = await response.json();
    expect(body.parsed.trip.distanceNm).toBe(750);
    expect(body.parsed.holding).toEqual({ weightLb: 92500 });
    expect(body.warnings).toContain('El nivel de espera no está indicado.');
    expect(JSON.stringify(body)).not.toContain(apiKey);
    expect(providerFetch).toHaveBeenCalledTimes(1);
    const [url, init] = providerFetch.mock.calls[0];
    expect(url).toBe('https://api.anthropic.com/v1/messages');
    expect(new Headers(init?.headers).get('Authorization')).toBe(`Bearer ${apiKey}`);
    const upstream = JSON.parse(String(init?.body));
    expect(upstream.model).toBe('test-vision-model');
    expect(upstream.messages[0].content[0]).toEqual({
      type: 'image', source: { type: 'base64', media_type: 'image/png', data: PNG },
    });
    expect(upstream.output_config.format.type).toBe('json_schema');
    expect(String(init?.body)).not.toContain(apiKey);
  });

  it('informa que falta configuración sin hacer solicitudes externas', async () => {
    const providerFetch = vi.fn<typeof fetch>();
    const base = await endpoint({ fetch: providerFetch });
    const response = await post(base);
    expect(response.status).toBe(503);
    expect((await response.json()).error).toContain('ANTHROPIC_API_KEY');
    expect(providerFetch).not.toHaveBeenCalled();
  });

  it.each([401, 403])('traduce credencial inválida (%s) sin devolver el error privado de Anthropic', async (status) => {
    const apiKey = 'private-server-key-for-test';
    const providerFetch = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response(`private upstream detail ${apiKey}`, { status }));
    const base = await endpoint({ apiKey, fetch: providerFetch });
    const response = await post(base);
    expect(response.status).toBe(503);
    const text = await response.text();
    expect(text).toContain('no es válida o ha vencido');
    expect(text).not.toContain(apiKey);
    expect(text).not.toContain('private upstream detail');
  });

  it('rechaza JSON mal formado antes de llamar a Claude', async () => {
    const providerFetch = vi.fn<typeof fetch>();
    const base = await endpoint({ apiKey: 'test-key', fetch: providerFetch });
    const response = await fetch(`${base}/api/analyze-statement`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{broken',
    });
    expect(response.status).toBe(400);
    expect((await response.json()).error).toContain('JSON válido');
    expect(providerFetch).not.toHaveBeenCalled();
  });

  it.each([
    [{}, 400],
    [{ image: { mediaType: 'text/html', data: PNG } }, 415],
    [{ image: { mediaType: 'image/png', data: 'not base64' } }, 400],
    [{ image: { mediaType: 'image/png', data: Buffer.from('plain text').toString('base64') } }, 400],
    [{ image: { mediaType: 'image/jpeg', data: PNG } }, 400],
  ])('rechaza una carga inválida (%j)', async (body, status) => {
    const providerFetch = vi.fn<typeof fetch>();
    const base = await endpoint({ apiKey: 'test-key', fetch: providerFetch });
    const response = await post(base, body);
    expect(response.status).toBe(status);
    expect(providerFetch).not.toHaveBeenCalled();
  });

  it('rechaza una imagen de más de 5 MiB sin enviarla a Claude', async () => {
    const data = Buffer.alloc(MAX_IMAGE_BYTES + 1);
    Buffer.from(PNG, 'base64').copy(data);
    const providerFetch = vi.fn<typeof fetch>();
    const base = await endpoint({ apiKey: 'test-key', fetch: providerFetch });
    const response = await post(base, { image: { mediaType: 'image/png', data: data.toString('base64') } });
    expect(response.status).toBe(413);
    expect(providerFetch).not.toHaveBeenCalled();
  });

  it('rechaza un origen ajeno y admite el origen explícitamente configurado', async () => {
    const providerFetch = vi.fn<typeof fetch>().mockResolvedValue(providerResponse());
    const base = await endpoint({ apiKey: 'test-key', allowedOrigin: 'https://app.example.test', fetch: providerFetch });
    const rejected = await post(base, requestBody(), { Origin: 'https://untrusted.example.test' });
    expect(rejected.status).toBe(403);
    expect(rejected.headers.has('Access-Control-Allow-Origin')).toBe(false);
    expect(providerFetch).not.toHaveBeenCalled();
    const accepted = await post(base, requestBody(), { Origin: 'https://app.example.test' });
    expect(accepted.status).toBe(200);
    expect(accepted.headers.get('Access-Control-Allow-Origin')).toBe('https://app.example.test');
  });

  it('permite el preflight y rechaza métodos de lectura', async () => {
    const base = await endpoint({ apiKey: 'test-key' });
    const preflight = await fetch(`${base}/api/analyze-statement`, { method: 'OPTIONS', headers: { Origin: base } });
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    const response = await fetch(`${base}/api/analyze-statement`);
    expect(response.status).toBe(405);
  });

  it('explica el límite de Anthropic sin propagar su cuerpo de error', async () => {
    const providerFetch = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response('private rate detail', { status: 429 }));
    const base = await endpoint({ apiKey: 'test-key', fetch: providerFetch });
    const response = await post(base);
    expect(response.status).toBe(429);
    expect((await response.json()).error).toContain('límite de solicitudes');
  });

  it('devuelve timeout y libera el cupo para reintentar', async () => {
    const providerFetch = vi.fn<typeof fetch>().mockImplementationOnce(async (_url, init) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), { once: true });
      });
    }).mockResolvedValueOnce(providerResponse());
    const base = await endpoint({ apiKey: 'test-key', timeoutMs: 10, fetch: providerFetch });
    const timeout = await post(base);
    expect(timeout.status).toBe(504);
    expect((await timeout.json()).error).toContain('tardó demasiado');
    expect((await post(base)).status).toBe(200);
  });

  it.each([
    { text: '', parsed: {}, warnings: [] },
    { ...analysis(), parsed: { ...analysis().parsed, trip: { distanceNm: '750' } } },
    { ...analysis(), parsed: { ...analysis().parsed, holding: { weightLb: -92500 } } },
    { ...analysis(), parsed: { ...analysis().parsed, trip: { from: 'invalid' } } },
  ])('rechaza datos inválidos de Claude en vez de calcular con ellos', async (value) => {
    const providerFetch = vi.fn<typeof fetch>().mockResolvedValueOnce(providerResponse(value));
    const base = await endpoint({ apiKey: 'test-key', fetch: providerFetch });
    const response = await post(base);
    expect(response.status).toBe(502);
    expect((await response.json()).error).toContain('lectura incompleta o inválida');
  });
});
