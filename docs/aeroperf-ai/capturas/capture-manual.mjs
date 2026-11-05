// Capturas reales del manual de AeroPerf AI (sin llamar a Claude: el analizador local resuelve el texto).
// Uso: PW_DIR=<dir con playwright> node capture-manual.mjs <dirCrudas> <cajas.json>
// Después: python3 -I .claude/skills/visual-user-manual/scripts/annotate.py <cajas.json> <dirCrudas> docs/aeroperf-ai/capturas
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(path.join(process.env.PW_DIR ?? process.cwd(), 'noop.js'));
const { chromium } = require('playwright');
const [outDir, boxesOut] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const BASE = process.env.BASE ?? 'http://127.0.0.1:5191/';
const SCALE = 1.5;
const TEXT = `Un B737 tiene programado realizar una operación:
Origen - destino: SEGU(Guayaquil) - SPJC distancia 730 nm F350 (40 HW)
Destino - alterno: SPJC - SPSO distancia 120 nm F190 (25tw)
Holding con 73000 lbs
Combustible para el taxi: 400 lbs`;

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: SCALE });
await ctx.addInitScript(() => {
  if (!sessionStorage.getItem('manual')) {
    localStorage.clear();
    localStorage.setItem('aeroperf.settings', JSON.stringify({ onboardingDismissed: true }));
    sessionStorage.setItem('manual', '1');
  }
});
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(String(e)));
const boxes = {};
const box = async (loc, union) => {
  let r = await loc.first().boundingBox();
  for (const el of union ? await union.all() : []) {
    const u = await el.boundingBox();
    const x = Math.min(r.x, u.x), y = Math.min(r.y, u.y);
    r = { x, y, width: Math.max(r.x + r.width, u.x + u.width) - x, height: Math.max(r.y + r.height, u.y + u.height) - y };
  }
  if (r.y + r.height <= 0 || r.y >= 800) throw new Error('elemento fuera de la captura');
  return Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v * SCALE]));
};
const obstacles = () =>
  p.evaluate(() => {
    const out = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      if (!n.textContent.trim()) continue;
      range.selectNodeContents(n);
      for (const r of range.getClientRects()) if (r.width > 1 && r.bottom > 0 && r.top < innerHeight) out.push({ x: r.x, y: r.y, width: r.width, height: r.height });
    }
    return out;
  });
const shot = async (id, targets) => {
  const list = [];
  for (const [n, label, loc, union] of targets) list.push({ n, label, box: await box(loc, union) });
  await p.screenshot({ path: path.join(outDir, `${id}.png`) });
  boxes[id] = { file: `${id}.png`, targets: list, obstacles: (await obstacles()).map((o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v * SCALE]))) };
  console.log('ok', id);
};

// 1. Inicio: tarjeta del asistente
await p.goto(BASE);
await p.waitForLoadState('networkidle');
await p.locator('.ai-intake textarea').fill(TEXT);
await p.locator('.ai-intake').scrollIntoViewIfNeeded();
await p.evaluate(() => window.scrollBy(0, -40));
await shot('01-inicio-asistente', [
  [1, 'Foto o imagen', p.locator('.ai-capture-actions .btn').first(), p.locator('.ai-capture-actions .btn')],
  [2, 'Enunciado', p.locator('.ai-intake textarea')],
  [3, 'Identificar', p.locator('.ai-intake-submit .btn-primary')],
]);

// 2. Revisión de datos detectados
await p.locator('.ai-intake-submit .btn-primary').click();
await p.waitForFunction(() => location.hash.includes('aiReview='));
await p.locator('.ai-review-grid').waitFor();
await p.waitForTimeout(300);
await p.evaluate(() => window.scrollTo(0, 0));
await shot('02-revision', [
  [1, 'Módulo detectado', p.locator('h1')],
  [2, 'Leído del enunciado', p.locator('.ai-field').first()],
]);
// supuestos y botón de cálculo (más abajo en la misma pantalla)
await p.locator('.ai-field', { hasText: 'Nivel de espera' }).scrollIntoViewIfNeeded();
await p.evaluate(() => window.scrollBy(0, 120));
await p.waitForTimeout(150);
await shot('03-supuestos-y-calcular', [
  [1, 'Supuestos', p.locator('.ai-field', { hasText: 'Nivel de espera' }), p.locator('.ai-field', { hasText: 'Tiempo de espera' })],
  [2, 'Confirmar y calcular', p.locator('.ai-review .btn-primary').first()],
]);

// 3. Confirmar abre la calculadora real con los datos y la barra del asistente
await p.locator('.ai-review .btn-primary').first().click();
await p.waitForFunction(() => location.hash.includes('from='));
await p.locator('.ai-banner').waitFor();
await p.locator('.answer-grid').waitFor();
await p.waitForTimeout(400);
await p.evaluate(() => window.scrollTo(0, 0));
await shot('04-calculadora-real', [
  [1, 'Barra del asistente', p.locator('.ai-banner')],
  [2, 'Respuestas', p.locator('.answer-grid')],
]);

// 4. Volver a revisar: resumen y «Ver en …»
await p.getByRole('link', { name: /Revisar datos detectados/ }).click();
await p.waitForFunction(() => location.hash.includes('aiReview='));
await p.locator('.ai-result-summary').waitFor();
await p.getByRole('button', { name: /Ver en/ }).scrollIntoViewIfNeeded();
await p.waitForTimeout(200);
await shot('05-volver-a-revisar', [
  [1, 'Resultado guardado', p.locator('.ai-result')],
  [2, 'Ver en la calculadora', p.getByRole('button', { name: /Ver en/ })],
]);

// 5. Historial
await p.goto(BASE + '#/history');
await p.locator('.history-row').first().waitFor();
await p.waitForTimeout(200);
await shot('07-historial', [[1, 'Ejercicio guardado', p.locator('.history-row').first()]]);

fs.writeFileSync(boxesOut, JSON.stringify(boxes, null, 2));
await b.close();
if (errors.length) { console.error('Errores JS:', errors); process.exit(1); }
