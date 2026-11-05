// @vitest-environment jsdom
// Pruebas de la auditoría UX (docs/ux-ui/01-auditoria-y-plan.md): cada bloque cita su problema UX-NN.
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { addHistory, clearHistory } from './state/history';
import { updateSettings } from './state/settings';
import { dismissToast } from './state/toast';

vi.mock('./services/ocr', () => ({ recognizeImage: vi.fn() }));

function renderAt(hash: string) {
  window.location.hash = hash;
  return render(<App />);
}

beforeEach(() => {
  localStorage.clear();
  clearHistory();
  updateSettings({ onboardingDismissed: false, decimals: 2 });
});
afterEach(() => {
  act(() => dismissToast());
  cleanup();
});

describe('ayuda contextual (UX-04)', () => {
  it('el InfoTip se abre con foco o toque, describe el campo y se cierra con Escape', async () => {
    renderAt('#/tools/density-altitude');
    await screen.findByRole('heading', { name: 'Altitud de densidad' });
    const trigger = screen.getByRole('button', { name: 'Qué es QNH' });
    const tip = document.getElementById(trigger.getAttribute('aria-describedby')!)!;
    expect(tip.getAttribute('role')).toBe('tooltip');
    expect(tip.textContent).toMatch(/METAR o del ATIS/);
    fireEvent.focus(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    // toque sin foco previo (táctil): abre y vuelve a cerrar
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('las respuestas de combustible explican sus siglas', async () => {
    renderAt('#/tools/fuel');
    await screen.findByRole('heading', { name: 'Planificación de combustible' });
    for (const name of ['Tiempo de viaje (T.T)', 'Combustible de viaje (T.F)', 'Combustible a bordo (FOB)', 'Autonomía']) {
      expect(screen.getByRole('button', { name: `Qué es ${name}` })).toBeTruthy();
    }
    expect(screen.getByText('Leído del enunciado')).toBeTruthy(); // leyenda de chips (UX-12)
    const level = screen.getByRole('button', { name: 'Qué es Nivel de espera' });
    expect(document.getElementById(level.getAttribute('aria-describedby')!)!.textContent).toMatch(/1\s500\sft \(FL\s015\)/);
  });
});

describe('validación por campo (UX-03)', () => {
  it('un valor no numérico se explica bajo el campo y en el aviso', async () => {
    renderAt('#/tools/linear');
    await screen.findByRole('heading', { name: 'Interpolación', level: 1 });
    const a = screen.getByLabelText('A, fila inferior de la tabla');
    fireEvent.change(a, { target: { value: 'abc' } });
    expect(a.getAttribute('aria-invalid')).toBe('true');
    expect(document.getElementById(a.getAttribute('aria-describedby')!)!.textContent).toBe(
      'Escribe solo números; usa coma o punto para los decimales.',
    );
    expect(screen.getByRole('alert').textContent).toMatch(/Revisa A:/);
  });

  it('un campo vacío se nombra en la orientación', async () => {
    renderAt('#/tools/linear');
    await screen.findByRole('heading', { name: 'Interpolación', level: 1 });
    fireEvent.change(screen.getByLabelText('B1, valor de la tabla para B'), { target: { value: '' } });
    expect(screen.getByText(/Completa B1 para obtener X/)).toBeTruthy();
    expect(screen.getByText('Guardar se activa cuando hay un resultado.')).toBeTruthy(); // UX-06
  });

  it('interpolación doble: cada casilla tiene nombre propio (UX-01)', async () => {
    renderAt('#/tools/bilinear');
    await screen.findByRole('heading', { name: 'Interpolación doble' });
    expect((screen.getByLabelText('Q21, valor de la tabla en X2 y Y1') as HTMLInputElement).value).toBe('1290');
    fireEvent.change(screen.getByLabelText('X2, columna superior'), { target: { value: '10' } });
    expect(screen.getByRole('alert').textContent).toMatch(/X1 y X2 no pueden ser iguales/);
  });
});

describe('deshacer (UX-07)', () => {
  it('«Ejemplo» se puede deshacer', async () => {
    renderAt('#/tools/linear');
    await screen.findByRole('heading', { name: 'Interpolación', level: 1 });
    const c = screen.getByLabelText('C, tu dato') as HTMLInputElement;
    fireEvent.change(c, { target: { value: '640' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ejemplo' }));
    expect(c.value).toBe('622');
    fireEvent.click(screen.getByRole('button', { name: 'Deshacer' }));
    expect(c.value).toBe('640');
  });

  it('eliminar del historial muestra «Deshacer» y lo restaura', async () => {
    addHistory({ toolId: 'linear', href: '/tools/linear', summary: 'prueba', result: '92,08' });
    renderAt('#/history');
    await screen.findByRole('heading', { name: 'Historial', level: 1 });
    fireEvent.click(screen.getByRole('button', { name: /Eliminar del historial: Interpolación, 92,08/ }));
    expect(screen.getByText('Aún no hay cálculos guardados')).toBeTruthy();
    const status = screen.getAllByRole('status').find((s) => s.classList.contains('toast-region'))!;
    expect(status.textContent).toMatch(/Cálculo eliminado/);
    fireEvent.click(within(status).getByRole('button', { name: 'Deshacer' }));
    expect(screen.getByText('92,08')).toBeTruthy();
  });

  it('un error al copiar se muestra como error, no como éxito (UX-08)', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denegado')) } });
    renderAt('#/tools/wind');
    await screen.findByRole('heading', { name: 'Componentes de viento' });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Compartir' })));
    expect(document.querySelector('.toast')!.className).toContain('toast-error');
  });
});

describe('orientación y navegación', () => {
  it('«Cómo empezar» aparece la primera vez y se puede ocultar (UX-05)', async () => {
    renderAt('#/');
    await screen.findByRole('heading', { name: 'Cómo empezar' });
    fireEvent.click(screen.getByRole('button', { name: 'Entendido, ocultar' }));
    expect(screen.queryByRole('heading', { name: 'Cómo empezar' })).toBeNull();
    expect(JSON.parse(localStorage.getItem('aeroperf.settings')!).onboardingDismissed).toBe(true);
  });

  it('el primer enlace salta al contenido (UX-13)', async () => {
    renderAt('#/');
    await screen.findByRole('heading', { name: '¿Qué quieres resolver?' });
    const skip = screen.getByRole('link', { name: 'Saltar al contenido' });
    fireEvent.click(skip);
    expect(document.activeElement?.id).toBe('contenido');
  });

  it('el menú móvil se cierra con Escape y con su botón (UX-09)', async () => {
    renderAt('#/');
    await screen.findByRole('heading', { name: '¿Qué quieres resolver?' });
    const more = within(screen.getByRole('navigation', { name: 'Accesos rápidos' })).getByRole('button', { name: 'Más' });
    fireEvent.click(more);
    expect(more.getAttribute('aria-expanded')).toBe('true');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(document.querySelector('.shell')!.className).not.toContain('mobile-open');
    fireEvent.click(more);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar menú' }));
    expect(document.querySelector('.shell')!.className).not.toContain('mobile-open');
  });

  it('las migas de una herramienta empiezan en Inicio (UX-11)', async () => {
    renderAt('#/tools/wind');
    await screen.findByRole('heading', { name: 'Componentes de viento' });
    const crumbs = screen.getByRole('navigation', { name: 'Ruta' });
    expect(within(crumbs).getByRole('link', { name: 'Inicio' }).getAttribute('href')).toBe('#/');
    expect(crumbs.textContent).toContain('Atmósfera');
  });

  it('las acciones muestran su texto, también sin hover (UX-02)', async () => {
    renderAt('#/tools/linear');
    await screen.findByRole('heading', { name: 'Interpolación', level: 1 });
    for (const name of ['Vaciar', 'Ejemplo', 'Compartir', 'Guardar']) {
      const btn = screen.getByRole('button', { name });
      expect(btn.textContent?.trim()).toBe(name);
      expect(btn.querySelector('.desktop-only')).toBeNull();
    }
  });
});

describe('vuelo internacional desde el enunciado', () => {
  it('SEGU (Guayaquil) – SPJC: 30 min de espera y 10 % de T.T y T.F en autonomía y FOB', async () => {
    renderAt('#/tools/fuel');
    await screen.findByRole('heading', { name: 'Planificación de combustible', level: 1 });
    fireEvent.change(screen.getByLabelText('Enunciado del ejercicio'), {
      target: {
        value: `Un B737 tiene programado realizar una operación:
Origen - destino: SEGU(Guayaquil) - SPJC distancia 730 nm F350 (40 HW)
Destino - alterno: SPJC - SPSO distancia 120 nm F190 (25tw)
Holding con 73000 lbs
Combustible para el taxi: 400 lbs`,
      },
    });
    const answers = [...document.querySelectorAll('.answer-value')].map((e) => e.firstChild?.textContent);
    // cada paso redondeado a 2 decimales, como a mano: 11207,81 + 1120,78 + 2536,67 + 2342 + 400 = 17607,26
    expect(answers).toEqual(['116,01', '11207,81', '17607,26', '181,45']);
    // la espera de 30 min es un supuesto del ámbito internacional
    expect(screen.getByRole('group', { name: 'Datos detectados' }).textContent).toContain('30 min*');
    expect(document.querySelector('.page-eyebrow')!.textContent).toMatch(/Vuelo internacional/);
    expect(document.querySelector('.calc-note')!.textContent).toMatch(/10 % de T\.F \(1120,78 lb\) y de T\.T \(11,6 min\)/);
  });
});

describe('EPR de despegue (B727 y B737)', () => {
  const answers = () => [...document.querySelectorAll('.answer-value')].map((e) => e.textContent);

  it('abre con las condiciones G-5 y replica la resolución: 2,24 y 2,22', async () => {
    renderAt('#/tools/takeoff-epr');
    await screen.findByRole('heading', { name: 'EPR de despegue', level: 1 });
    expect(answers()).toEqual(['2,24', '2,22']);
    expect(screen.getByText(/2,21 \+ \(2,26 − 2,21\)\(2550 − 2000\) \/ \(3000 − 2000\) =/)).toBeTruthy();
    expect(screen.getByText(/2,253 − 0,03 = 2,223/)).toBeTruthy();
  });

  it('cambiar a G-2 recalcula con milibares, °C y la 6.ª etapa', async () => {
    renderAt('#/tools/takeoff-epr');
    await screen.findByRole('heading', { name: 'EPR de despegue', level: 1 });
    fireEvent.change(screen.getByLabelText('Cargar condiciones R-1 a R-5 (B737) o G-1 a G-5 (B727)'), { target: { value: 'G-2' } });
    expect(answers()).toEqual(['2,14', '2,11']);
    expect(screen.getByText(/1016 mb está entre 1015 y 1019/)).toBeTruthy();
    // un sangrado se cambia con su botón ON/OFF
    fireEvent.click(within(screen.getByRole('group', { name: 'Sangrado 6.ª etapa' })).getByRole('button', { name: 'OFF' }));
    expect(answers()).toEqual(['2,14', '2,16']);
  });

  it('la prueba G-5 aparece en Pruebas y coincide con la resolución', async () => {
    renderAt('#/pruebas/b727-epr-despegue-g5');
    await screen.findByRole('heading', { name: 'EPR de despegue B727 · condiciones G-5', level: 1 });
    expect(answers()).toEqual(['2,24', '2,22']);
    expect(screen.getByText('7/7 pasos coinciden')).toBeTruthy();
  });
});

describe('EPR de despegue B737', () => {
  const answers = () => [...document.querySelectorAll('.answer-value')].map((e) => e.textContent);

  it('R-5 replica la resolución: límite por temperatura 1,98, por presión 2,0025 → 1,98', async () => {
    renderAt('#/tools/takeoff-epr');
    await screen.findByRole('heading', { name: 'EPR de despegue', level: 1 });
    fireEvent.change(screen.getByLabelText('Cargar condiciones R-1 a R-5 (B737) o G-1 a G-5 (B727)'), { target: { value: 'R-5' } });
    expect(answers()).toEqual(['1,98', 'Temperatura']);
    expect(screen.getByText(/2,01 \+ \(1,96 − 2,01\)\(-150 − 0\) \/ \(-1000 − 0\) =/)).toBeTruthy();
    expect(screen.getByText(/OFF: 1,95 \+ 0,03 =/)).toBeTruthy();
    // el B737 no tiene 6.ª etapa y nombra sus sangrados sin motores
    expect(screen.queryByRole('group', { name: 'Sangrado 6.ª etapa' })).toBeNull();
    fireEvent.click(within(screen.getByRole('group', { name: 'Aire acondicionado' })).getByRole('button', { name: 'ON' }));
    expect(answers()).toEqual(['1,95', 'Temperatura']);
  });

  it('la prueba R-5 aparece en Pruebas y coincide con la resolución', async () => {
    renderAt('#/pruebas/b737-epr-despegue-r5');
    await screen.findByRole('heading', { name: 'EPR de despegue B737 · condiciones R-5', level: 1 });
    expect(answers()[0]).toBe('1,98');
    expect(screen.getByText('6/6 pasos coinciden')).toBeTruthy();
  });
});

describe('Ascenso en ruta (B737)', () => {
  const answers = () => [...document.querySelectorAll('.answer-value')].map((e) => e.firstChild?.textContent);

  it('abre con V-5 y replica las dos resoluciones: 2000 lb y 61,33 NM', async () => {
    renderAt('#/tools/en-route-climb');
    await screen.findByRole('heading', { name: 'Ascenso en ruta', level: 1 });
    expect(answers()).toEqual(['2000', '61,33']);
    expect(screen.getByText(/2100 − 100 =/)).toBeTruthy();
    expect(screen.getByText(/d = \(13 min ÷ 60\) × 40 kt =/)).toBeTruthy();
    expect(screen.getByText(/70 − 8,67 =/)).toBeTruthy();
    fireEvent.click(within(screen.getByRole('group', { name: 'Tipo de viento' })).getByRole('button', { name: 'Cola (TW)' }));
    expect(answers()).toEqual(['2000', '78,67']);
  });

  it('las dos pruebas V-5 coinciden con las resoluciones', async () => {
    renderAt('#/pruebas/b737-ascenso-combustible-v5');
    await screen.findByRole('heading', { name: 'Combustible en ascenso en ruta · condiciones V-5', level: 1 });
    expect(screen.getByText('4/4 pasos coinciden')).toBeTruthy();
    cleanup();
    renderAt('#/pruebas/b737-ascenso-distancia-v5');
    await screen.findByRole('heading', { name: 'Distancia en ascenso en ruta · condiciones V-5', level: 1 });
    expect(screen.getByText('4/4 pasos coinciden')).toBeTruthy();
    expect(screen.getByText('Resolución: 61,33')).toBeTruthy();
  });
});

describe('ayuda de unidades', () => {
  it('cada unidad de un campo explica su significado (°F → grados Fahrenheit)', async () => {
    renderAt('#/tools/takeoff-epr');
    await screen.findByRole('heading', { name: 'EPR de despegue', level: 1 });
    const f = screen.getByRole('button', { name: 'Qué es °F' });
    expect(document.getElementById(f.getAttribute('aria-describedby')!)!.textContent).toMatch(/Grados Fahrenheit/);
    fireEvent.click(f);
    expect(f.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('button', { name: 'Qué es ft' })).toBeTruthy();
  });

  it('las opciones que son unidades muestran su significado al pasar el ratón y en la ayuda del grupo', async () => {
    renderAt('#/tools/takeoff-epr');
    await screen.findByRole('heading', { name: 'EPR de despegue', level: 1 });
    const group = screen.getByRole('group', { name: 'Unidad del reglaje' });
    expect(within(group).getByRole('button', { name: 'mb' }).getAttribute('title')).toMatch(/Milibares/);
    const tip = screen.getByRole('button', { name: 'Qué es Unidad del reglaje' });
    expect(document.getElementById(tip.getAttribute('aria-describedby')!)!.textContent).toMatch(/Pulgadas de mercurio.*Milibares/s);
  });

  it('las respuestas también explican sus unidades', async () => {
    renderAt('#/tools/en-route-climb');
    await screen.findByRole('heading', { name: 'Ascenso en ruta', level: 1 });
    expect(screen.getAllByRole('button', { name: 'Qué es NM' }).length).toBeGreaterThan(0);
  });
});
