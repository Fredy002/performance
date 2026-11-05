// @vitest-environment jsdom
// AeroPerf AI: sesión, revisión, resolución con motores deterministas e historial.
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { normalizeAIAnalysis } from '@/services/aeroAnalysis';
import { parseExerciseText } from '@/services/aeroEngine';
import { createAISession, getAISession } from '@/state/aiSession';
import { clearHistory, getHistory, removeHistory } from '@/state/history';
import { updateSettings } from '@/state/settings';

vi.mock('@/services/ocr', async (orig) => ({ ...(await orig<typeof import('@/services/ocr')>()), recognizeImage: vi.fn() }));

const FUEL = `Un B737 tiene programado realizar una operación:
Origen - destino: SEGU(Guayaquil) - SPJC distancia 730 nm F350 (40 HW)
Destino - alterno: SPJC - SPSO distancia 120 nm F190 (25tw)
Holding con 73000 lbs
Combustible para el taxi: 400 lbs`;

function open(sessionId: string, stepId = 'step-1', module = 'fuel') {
  window.location.hash = `#/tools/${module}?aiReview=${sessionId}&step=${stepId}`;
  return render(<App />);
}
/** Tras confirmar se abre la calculadora real (no una tarjeta de la IA), con la barra del asistente. */
async function expectRealTool(module: string, ...values: string[]) {
  await screen.findByText('Ejercicio resuelto con IA');
  expect(window.location.hash).toMatch(new RegExp(`^#/tools/${module}\\?.*from=`));
  expect(document.querySelector('.ai-review')).toBeNull();
  expect(document.querySelector('.ai-result-summary')).toBeNull();
  for (const v of values) expect(document.querySelector('main')!.textContent).toContain(v);
}
const status = (label: string) => screen.getByLabelText(label).closest('.ai-field')!.querySelector('.status')!.textContent;

beforeEach(() => {
  localStorage.clear();
  clearHistory();
  updateSettings({ onboardingDismissed: true, decimals: 2, locale: 'es' });
});
afterEach(() => cleanup());

describe('AeroPerf AI · revisión y resolución', () => {
  it('combustible: datos leídos en verde, espera supuesta en naranja y cálculo con el motor de la app', async () => {
    const analysis = parseExerciseText(FUEL)!;
    expect(analysis.steps.map((s) => s.module)).toEqual(['fuel']);
    const session = createAISession(analysis, undefined, { locale: 'es', originalText: FUEL });
    open(session.id);
    await screen.findByRole('heading', { name: 'Ejercicio detectado: Planificación de combustible', level: 1 });
    expect(status('Distancia de viaje')).toBe('Leído del enunciado');
    expect(status('Nivel de espera')).toBe('Supuesto');
    expect((screen.getByLabelText('Tiempo de espera') as HTMLInputElement).value).toBe('30'); // vuelo internacional
    fireEvent.click(screen.getByRole('button', { name: /Confirmar y calcular/ }));
    await expectRealTool('fuel', '17607,26', '181,45');
    // la calculadora normal tiene el enunciado y los datos revisados
    // la calculadora normal, con los datos revisados (sin tarjeta de enunciado)
    expect((screen.getByLabelText('Origen') as HTMLInputElement).value).toBe('SEGU');
    expect((screen.getAllByLabelText('Distancia')[0] as HTMLInputElement).value).toBe('730');
    expect(document.querySelector('main textarea')).toBeNull();
    expect(screen.getByRole('link', { name: /Revisar datos detectados/ }).getAttribute('href')).toMatch(/aiReview=/);
    // una sola entrada de historial, con el enunciado original y el resultado
    expect(getHistory()).toHaveLength(1);
    expect(getHistory()[0].summary).toMatch(/^Un B737 tiene programado/);
    expect(getHistory()[0].result).toBe('FOB 17607,26 lb · 181,45 min');
    expect(getHistory()[0].href).toMatch(/^\/tools\/fuel\?.*from=/); // el historial abre la calculadora real
    expect(getAISession(session.id)!.status).toBe('solved');
    // volver a revisar muestra el resumen y el enlace a la calculadora
    fireEvent.click(screen.getByRole('link', { name: /Revisar datos detectados/ }));
    await screen.findByRole('heading', { name: 'Ejercicio detectado: Planificación de combustible', level: 1 });
    expect(document.querySelector('.ai-result-summary')!.textContent).toBe('FOB 17607,26 lb · 181,45 min');
    fireEvent.click(screen.getByRole('button', { name: /Ver en Planificación de combustible/ }));
    await expectRealTool('fuel', '17607,26');
  });

  it('desde Inicio: identificar abre la revisión (?aiReview=) y confirmar, la calculadora real', async () => {
    window.location.hash = '#/';
    render(<App />);
    fireEvent.change(document.querySelector('.ai-intake textarea')!, { target: { value: 'convierte 100 NM a km' } });
    fireEvent.click(screen.getByRole('button', { name: 'Identificar ejercicio' }));
    await screen.findByRole('heading', { name: 'Ejercicio detectado: Conversor de unidades', level: 1 });
    expect(window.location.hash).toMatch(/^#\/tools\/units\?aiReview=/);
    fireEvent.click(screen.getByRole('button', { name: /Confirmar y calcular/ }));
    await expectRealTool('units', '185,2');
  });

  it('lectura dudosa de la letra manuscrita: naranja, con aviso, y se puede calcular tras confirmarla', async () => {
    // así responde Claude con la foto manuscrita «Holding con ?3000 lbs»
    const local = parseExerciseText(FUEL)!;
    const raw = {
      text: local.text,
      steps: [{ ...local.steps[0], fields: local.steps[0].fields.map((f) => (f.key === 'hw'
        ? { ...f, source: 'uncertain', evidence: '«73000 lbs»: el primer dígito podría ser 7 o 1; 7 es más probable' }
        : f)) }],
      warnings: ['Confirma el peso en espera: el primer dígito de 73000 lb es dudoso (7 o 1).'],
      unsupported: [],
    };
    const analysis = normalizeAIAnalysis(raw)!;
    expect(analysis.steps[0].fields.find((f) => f.key === 'hw')).toMatchObject({ value: '73000', source: 'uncertain' });
    // una lectura dudosa sin evidencia no se acepta
    expect(() => normalizeAIAnalysis({ ...raw, steps: [{ ...raw.steps[0], fields: [{ key: 'hw', value: '73000', unit: 'lb', source: 'uncertain', evidence: '', verified: false }] }] })).toThrow();
    const session = createAISession(analysis, undefined, { locale: 'es', originalText: FUEL });
    open(session.id);
    await screen.findByRole('heading', { level: 1 });
    expect(status('Peso en espera')).toBe('Lectura dudosa');
    expect(screen.getByText(/el primer dígito de 73000 lb es dudoso/)).toBeTruthy();
    expect(screen.getByText(/Hay lecturas dudosas de la letra manuscrita/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Confirmar y calcular/ }));
    await expectRealTool('fuel', '17607,26');
  });

  it('las correcciones del usuario se marcan, se conservan y recalculan', async () => {
    const session = createAISession(parseExerciseText(FUEL)!, undefined, { locale: 'es' });
    open(session.id);
    await screen.findByRole('heading', { level: 1 });
    fireEvent.change(screen.getByLabelText('Tiempo de espera'), { target: { value: '45' } });
    expect(status('Tiempo de espera')).toBe('Corregido');
    fireEvent.click(screen.getByRole('button', { name: /Confirmar y calcular/ }));
    const stored = getAISession(session.id)!;
    expect(stored.steps[0].fields.find((f) => f.key === 'hm')).toMatchObject({ value: '45', source: 'user', verified: true });
    expect(stored.results['step-1'].outputs.enduranceMin).toBeCloseTo(196.45, 2);
  });

  it('bloquea el cálculo si falta un dato imprescindible', async () => {
    const analysis = parseExerciseText('Interpolación: a=600 b=650 c=622 a1=89 b1=96')!;
    analysis.steps[0].fields = analysis.steps[0].fields.filter((f) => f.key !== 'b1');
    const session = createAISession(analysis);
    open(session.id, 'step-1', 'linear');
    await screen.findByRole('heading', { name: 'Ejercicio detectado: Interpolación', level: 1 });
    expect(status('B1')).toBe('Falta');
    expect((screen.getByRole('button', { name: /Confirmar y calcular/ }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getAllByText('Completa los datos marcados como «Falta» para poder calcular.').length).toBeGreaterThan(0);
  });

  it('EPR B737 R-5: la unidad del reglaje la fija su selector → 1,98', async () => {
    const session = createAISession(parseExerciseText('EPR de despegue B737: elev=50 qnh=30.15 qu=inHg oat=95 tu=F ac=off ai=off')!);
    open(session.id, 'step-1', 'takeoff-epr');
    await screen.findByRole('heading', { level: 1 });
    fireEvent.click(screen.getByRole('button', { name: /Confirmar y calcular/ }));
    await expectRealTool('takeoff-epr', '1,98');
    // el antihielo («ai=off») no se confunde con la sesión del asistente
    expect(window.location.hash).toContain('ai=off');
  });

  it('la ruta sale del paso, no de la URL: un módulo equivocado redirige al correcto', async () => {
    const session = createAISession(parseExerciseText('convierte 100 NM a km')!);
    open(session.id, 'step-1', 'linear');
    await screen.findByRole('heading', { name: 'Ejercicio detectado: Conversor de unidades', level: 1 });
    expect(window.location.hash).toMatch(/^#\/tools\/units\?aiReview=/);
    fireEvent.click(screen.getByRole('button', { name: /Confirmar y calcular/ }));
    await expectRealTool('units', '185,2');
  });

  it('borrar la entrada del historial borra la sesión', async () => {
    const session = createAISession(parseExerciseText('convierte 100 NM a km')!);
    act(() => void removeHistory(getHistory()[0].id));
    expect(getAISession(session.id)).toBeUndefined();
    open(session.id, 'step-1', 'units');
    expect(await screen.findByRole('heading', { name: /No se encontró este ejercicio/ })).toBeTruthy();
  });

  it('dos pasos: el segundo usa el resultado del primero y no se calcula antes', async () => {
    const interp = parseExerciseText('Interpolación: a=600 b=650 c=622 a1=89 b1=96')!;
    const analysis = {
      ...interp,
      steps: [
        interp.steps[0],
        { id: 'step-2', module: 'units' as const, dependsOn: ['step-1'], bindings: [{ key: 'v', stepId: 'step-1', output: 'x' }],
          fields: [
            { key: 'q', value: 'distance', unit: '', source: 'statement' as const, evidence: 'NM', verified: false },
            { key: 'u', value: 'nm', unit: '', source: 'statement' as const, evidence: 'NM', verified: false },
            { key: 'to', value: 'km', unit: '', source: 'statement' as const, evidence: 'km', verified: false },
          ] },
      ],
    };
    const session = createAISession(analysis);
    open(session.id, 'step-2', 'units');
    await screen.findByRole('heading', { name: 'Ejercicio detectado: Conversor de unidades', level: 1 });
    expect((screen.getByRole('button', { name: /Confirmar y calcular/ }) as HTMLButtonElement).disabled).toBe(true);
    cleanup();
    open(session.id, 'step-1', 'linear');
    await screen.findByRole('heading', { name: 'Ejercicio detectado: Interpolación', level: 1 });
    fireEvent.click(screen.getByRole('button', { name: /Confirmar y calcular/ }));
    await expectRealTool('linear', '92,08');
    expect(screen.getByText('Paso 1 de 2', { exact: false })).toBeTruthy();
    fireEvent.click(screen.getByRole('link', { name: /Siguiente: Conversor de unidades/ }));
    await screen.findByRole('heading', { name: 'Ejercicio detectado: Conversor de unidades', level: 1 });
    fireEvent.click(screen.getByRole('button', { name: /Confirmar y calcular/ }));
    await expectRealTool('units', '170,53');
    expect(getHistory()).toHaveLength(1);
  });
});
