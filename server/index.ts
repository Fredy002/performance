import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClaudeMiddleware } from './claude.ts';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDirectory = resolve(projectRoot, 'dist');
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 3000);

if (!Number.isInteger(port) || port < 0 || port > 65535) {
  throw new Error('PORT debe ser un número entero entre 0 y 65535.');
}

const analyzeStatement = createClaudeMiddleware({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: process.env.ANTHROPIC_MODEL,
  workspaceId: process.env.ANTHROPIC_WORKSPACE_ID,
  allowedOrigin: process.env.CLAUDE_ALLOWED_ORIGIN,
});

const contentTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

function respond(response: ServerResponse, status: number, text: string) {
  response.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(text);
}

function isInside(root: string, path: string): boolean {
  const localPath = relative(root, path);
  return localPath === '' || (!isAbsolute(localPath) && localPath !== '..' && !localPath.startsWith(`..${sep}`));
}

async function serveStatic(request: IncomingMessage, response: ServerResponse, pathname: string) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    respond(response, 405, 'Método no permitido.');
    return;
  }

  // Check both the lexical and real paths to prevent escapes through symlinks.
  const requestedFile = resolve(distDirectory, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (!isInside(distDirectory, requestedFile) || pathname.split('/').some((part) => part.startsWith('.'))) {
    respond(response, 404, 'Archivo no encontrado.');
    return;
  }

  let absoluteFile: string;
  let fileStat;
  try {
    absoluteFile = await realpath(requestedFile);
    fileStat = await stat(absoluteFile);
    if (!fileStat.isFile()) throw new Error('La ruta no es un archivo.');
  } catch {
    if (extname(pathname)) {
      respond(response, 404, 'Archivo no encontrado.');
      return;
    }
    try {
      absoluteFile = await realpath(resolve(distDirectory, 'index.html'));
      fileStat = await stat(absoluteFile);
    } catch {
      respond(response, 503, 'No existe dist/index.html. Ejecuta npm run build antes de npm start.');
      return;
    }
  }

  const realDistDirectory = await realpath(distDirectory);
  if (!isInside(realDistDirectory, absoluteFile)) {
    respond(response, 404, 'Archivo no encontrado.');
    return;
  }

  response.writeHead(200, {
    'Content-Type': contentTypes[extname(absoluteFile).toLowerCase()] || 'application/octet-stream',
    'Content-Length': fileStat.size,
    'Cache-Control': extname(absoluteFile) === '.html' ? 'no-cache' : pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=3600',
    'X-Content-Type-Options': 'nosniff',
  });
  if (request.method === 'HEAD') {
    response.end();
    return;
  }

  const stream = createReadStream(absoluteFile);
  stream.on('error', () => response.destroy());
  response.on('close', () => stream.destroy());
  stream.pipe(response);
}

const server = createServer((request, response) => {
  let pathname: string;
  try {
    pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
    if (pathname.includes('\0') || pathname.includes('\\')) throw new Error('Ruta inválida.');
  } catch {
    respond(response, 400, 'Ruta inválida.');
    return;
  }

  if (pathname === '/api/analyze-statement') {
    analyzeStatement(request, response, () => respond(response, 404, 'Endpoint no encontrado.'));
    return;
  }
  if (pathname === '/api' || pathname.startsWith('/api/')) {
    respond(response, 404, 'Endpoint no encontrado.');
    return;
  }

  void serveStatic(request, response, pathname).catch(() => {
    if (response.headersSent) response.destroy();
    else respond(response, 500, 'No se pudo servir la aplicación.');
  });
});

server.listen(port, host, () => {
  const address = server.address();
  const listeningPort = typeof address === 'object' && address ? address.port : port;
  const listeningHost = host.includes(':') ? `[${host}]` : host;
  console.log(`AeroPerf listo en http://${listeningHost}:${listeningPort}`);
});
