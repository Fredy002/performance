// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { updateSettings } from './state/settings';
import { recognizeImage } from './services/ocr';
import type { ParsedStatement } from './exercises/parseStatement';

// La red no se usa en jsdom: se simula la lectura estructurada de Claude.
vi.mock('./services/ocr', () => ({ recognizeImage: vi.fn() }));
const mockOcr = vi.mocked(recognizeImage);
URL.createObjectURL = vi.fn(() => 'blob:captura');
URL.revokeObjectURL = vi.fn();

function renderAt(hash: string) {
  window.location.hash = hash;
  return render(<App />);
}

// las salidas se nombran «X: 92,08», «R1: 1236»…
const output = (label: string) => document.querySelector(`output[aria-label^="${label}:"]`)!;

beforeEach(() => {
  localStorage.clear();
  mockOcr.mockReset();
});
afterEach(() => {
  cleanup();
  updateSettings({ decimals: 2 });
});

describe('calculadoras (regresión)', () => {
  it('interpolación lineal: ejemplo de referencia = 92,08', async () => {
    renderAt('#/tools/linear');
    await screen.findByRole('heading', { name: 'Interpolación', level: 1 });
    expect(output('Resultado X').textContent).toBe('92,08');
  });

  it('interpolación lineal: recalcula al editar y avisa de extrapolación', async () => {
    renderAt('#/tools/linear');
    await screen.findByRole('heading', { name: 'Interpolación', level: 1 });
    fireEvent.change(screen.getByLabelText('C, tu dato'), { target: { value: '625' } });
    expect(output('Resultado X').textContent).toBe('92,5');
    fireEvent.change(screen.getByLabelText('C, tu dato'), { target: { value: '700' } });
    expect(screen.getByText(/Extrapolación:/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText('B, fila superior de la tabla'), { target: { value: '600' } });
    expect(screen.getByRole('alert').textContent).toMatch(/A y B no pueden ser iguales/);
  });

  it('interpolación lineal: acepta coma decimal y valores desde la URL', async () => {
    renderAt('#/tools/linear?a=0&b=10&c=2,5&a1=0&b1=100');
    await screen.findByRole('heading', { name: 'Interpolación', level: 1 });
    expect(output('Resultado X').textContent).toBe('25');
  });

  it('interpolación doble: ejemplo = 1330', async () => {
    renderAt('#/tools/bilinear');
    await screen.findByRole('heading', { name: 'Interpolación doble' });
    expect(output('X').textContent).toBe('1330');
    expect(output('R1').textContent).toBe('1236');
    expect(output('R2').textContent).toBe('1424');
  });

  it('altitud de densidad y viento muestran resultados', async () => {
    renderAt('#/tools/density-altitude');
    await screen.findByRole('heading', { name: 'Altitud de densidad' });
    expect(screen.getByText('Altitud de presión')).toBeTruthy();
    cleanup();
    renderAt('#/tools/wind');
    await screen.findByRole('heading', { name: 'Componentes de viento' });
    expect(screen.getByText('Viento de cara')).toBeTruthy();
  });

  it('guardar un cálculo lo añade al historial', async () => {
    renderAt('#/tools/linear');
    await screen.findByRole('heading', { name: 'Interpolación', level: 1 });
    fireEvent.click(screen.getByRole('button', { name: /Guardar/ }));
    expect(JSON.parse(localStorage.getItem('aeroperf.history')!)[0]).toMatchObject({ toolId: 'linear', result: '92,08' });
  });
});

describe('tablas de performance de aeronaves', () => {
  it('la biblioteca muestra una tarjeta por tema, sin repetir variantes', async () => {
    const { container } = renderAt('#/tables');
    await screen.findByRole('heading', { name: 'Tablas de performance de aeronaves' });
    for (const name of ['Planificación de vuelo abreviada', 'Performance de espera del Boeing 737', 'Despegue del Boeing 737', 'Reglaje altimétrico a altitud de presión', 'Ascenso en ruta del Boeing 737', 'Despegue del Boeing 727']) {
      expect(screen.getByRole('heading', { name })).toBeTruthy();
    }
    expect(container.textContent).not.toMatch(/figur/i);
    expect(container.querySelectorAll('.tool-card')).toHaveLength(6);
    expect(screen.queryByRole('heading', { name: 'Ascenso en ruta 280/.70 ISA +10 °C' })).toBeNull();
  });

  it('ascenso reúne ISA, ISA +10 °C y condiciones en el mismo conjunto', async () => {
    renderAt('#/tables/ascenso-ruta-280-070-isa');
    await screen.findByRole('heading', { name: 'Ascenso en ruta 280/.70 ISA', level: 1 });
    const nav = screen.getByRole('navigation', { name: 'Versiones de la tabla' });
    expect(within(nav).getAllByRole('link')).toHaveLength(3);
    expect(within(nav).getByRole('link', { name: 'ISA' }).getAttribute('aria-current')).toBe('page');
    fireEvent.click(within(nav).getByRole('link', { name: 'ISA +10 °C' }));
    await screen.findByRole('heading', { name: 'Ascenso en ruta 280/.70 ISA +10 °C', level: 1 });
    fireEvent.click(screen.getByRole('link', { name: 'Condiciones' }));
    await screen.findByRole('heading', { name: 'Condiciones de ascenso en ruta del Boeing 737', level: 1 });
  });

  it('crucero Mach 0,74: muestra condiciones y el ejemplo resuelto', async () => {
    const { container } = renderAt('#/tables/planificacion-crucero-m074');
    await screen.findByRole('heading', { name: 'Planificación de vuelo en crucero Mach 0,74' });
    expect(container.textContent).not.toMatch(/figur/i);
    const solved = screen.getByText('Ejemplo resuelto').closest('section')!;
    const z1 = within(solved).getByText('Z-1').closest('tr')!;
    expect(z1.textContent).toContain('51,86 min');
    expect(z1.textContent).toContain('5233,22 lb');
    const z2 = within(solved).getByText('Z-2').closest('tr')!;
    expect(z2.textContent).toContain('+9,98');
    expect(z2.textContent).toContain('10266,51 lb');
    expect(screen.getByText('¿Para qué sirve?')).toBeTruthy();
  });

  it('planificación abreviada: filas, tramo omitido y corrección por viento', async () => {
    renderAt('#/tables/planificacion-abreviada');
    await screen.findByRole('heading', { name: 'Planificación de vuelo abreviada' });
    const rows = screen.getAllByRole('row');
    // cabecera + 25 filas + fila de tramo omitido
    expect(rows.filter((r) => r.closest('table')?.querySelector('th')?.textContent === 'Dist. NM')).toHaveLength(27);
    expect(screen.getByText(/Filas 70–250 NM omitidas/)).toBeTruthy();
    expect(screen.getByText('Δ TIME = TIME × WIND COMPONENT ÷ TAS')).toBeTruthy();
  });

  it('espera B-737: matriz 8×11 y selector de parámetro', async () => {
    const { container } = renderAt('#/tables/espera-b737');
    await screen.findByRole('heading', { name: 'Performance de espera del Boeing 737' });
    expect(container.textContent).not.toMatch(/figur/i);
    const table = screen.getByText('FL \\ Peso').closest('table')!;
    expect(within(table).getAllByRole('row')).toHaveLength(9);
    const fl200 = within(table).getByText('FL 200').closest('tr')!;
    fireEvent.click(screen.getByRole('button', { name: 'FF / motor (lb/h)' }));
    expect(fl200.querySelectorAll('td')[1].textContent).toBe('2716');
    fireEvent.click(screen.getByRole('button', { name: 'EPR' }));
    expect(fl200.querySelectorAll('td')[1].textContent).toBe('1.56');
  });

  it('una tabla inexistente muestra la página 404', async () => {
    renderAt('#/tables/nope');
    expect(await screen.findByText('Página no encontrada')).toBeTruthy();
  });
});

const answerValues = () => [...document.querySelectorAll('.answer-value')].map((e) => e.firstChild?.textContent);

describe('pruebas', () => {
  it('Pruebas no aparece en el menú lateral, pero su página sigue disponible', async () => {
    renderAt('#/');
    await screen.findByRole('heading', { name: '¿Qué quieres resolver?' });
    expect(within(screen.getByRole('complementary', { name: 'Menú principal' })).queryByRole('link', { name: 'Pruebas' })).toBeNull();
    cleanup();
    renderAt('#/pruebas');
    expect(await screen.findByRole('heading', { name: 'Pruebas', level: 1 })).toBeTruthy();
  });

  it('lista solo los pendientes y enlaza los ya verificados a su herramienta', async () => {
    renderAt('#/pruebas');
    await screen.findByRole('heading', { name: 'Pruebas', level: 1 });
    expect(screen.getByRole('heading', { name: 'Planificación de combustible SPUR – SPJC' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Planificación de combustible SPJC – SPQT' })).toBeNull();
    const done = screen.getByText('Planificación de combustible SPJC – SPQT').closest('a')!;
    expect(done.getAttribute('href')).toMatch(/^#\/tools\/fuel\?dep=SPJC&dst=SPQT&alt=SPST&td=622&/);
  });

  it('SPUR – SPJC: interpola el alterno entre 60 y 260 NM y coincide con la resolución', async () => {
    renderAt('#/pruebas/b737-combustible-spur-spjc');
    await screen.findByRole('heading', { name: 'Planificación de combustible SPUR – SPJC' });
    expect(screen.getByText('Pendiente de verificación')).toBeTruthy();
    expect(answerValues()).toEqual(['96,41', '9287,53', '16972,16', '172,95']);
    expect(screen.getByText('19/19 pasos coinciden')).toBeTruthy();
    expect(screen.queryByText('No coincide')).toBeNull();
    expect(screen.getByText(/279 \+ \(447 − 279\)\(145 − 60\) \/ \(260 − 60\)/)).toBeTruthy();
    expect(screen.getByText(/Entre 60 y 260 NM la tabla no publica filas intermedias/)).toBeTruthy();
    expect(screen.getByText(/interpolado entre FL 015 \/ 95000 y 90000 lb/)).toBeTruthy();
  });

  it('al cambiar los datos recalcula y desactiva la validación', async () => {
    renderAt('#/pruebas/b737-combustible-spur-spjc');
    await screen.findByRole('heading', { name: 'Planificación de combustible SPUR – SPJC' });
    const dist = screen.getAllByLabelText('Distancia')[0];
    fireEvent.change(dist, { target: { value: '650' } });
    expect(screen.getByText(/la validación solo se aplica a los datos originales/)).toBeTruthy();
    fireEvent.change(dist, { target: { value: '1200' } });
    expect(screen.getByRole('alert').textContent).toMatch(/fuera de la tabla/);
    fireEvent.click(screen.getAllByRole('button', { name: /Restaurar enunciado/ })[0]);
    expect(screen.getByText('19/19 pasos coinciden')).toBeTruthy();
  });

  it('un ejercicio verificado redirige a la planificación de combustible', async () => {
    renderAt('#/pruebas/b737-combustible-spjc-spqt');
    await screen.findByRole('heading', { name: 'Planificación de combustible', level: 1 });
    expect(window.location.hash).toMatch(/^#\/tools\/fuel\?dep=SPJC&dst=SPQT&alt=SPST&td=622/);
  });
});

describe('planificación de combustible', () => {
  it('está activa en Performance de aeronaves y carga el ejercicio verificado como ejemplo', async () => {
    renderAt('#/tools/fuel');
    await screen.findByRole('heading', { name: 'Planificación de combustible', level: 1 });
    expect(answerValues()).toEqual(['80,38', '7825,39', '17059,18', '173,4']);
    expect(screen.getByText(/Ejercicio resuelto · SPJC – SPQT/)).toBeTruthy();
    expect(screen.getByText('Verificado')).toBeTruthy();
    expect(screen.getByText('19/19 pasos coinciden')).toBeTruthy();
  });

  it('con otros datos calcula y explica el método', async () => {
    renderAt('#/tools/fuel');
    await screen.findByRole('heading', { name: 'Planificación de combustible', level: 1 });
    fireEvent.change(screen.getAllByLabelText('Distancia')[0], { target: { value: '400' } });
    expect(screen.queryByText(/Ejercicio resuelto/)).toBeNull();
    expect(screen.getByText('Cómo se calcula')).toBeTruthy();
    // 400 NM, 55 kt de cola: 6250 − 6250 × 55 ÷ 433
    expect(answerValues()[1]).toBe('5456,12');
    fireEvent.click(screen.getByRole('button', { name: /Guardar/ }));
    expect(JSON.parse(localStorage.getItem('aeroperf.history')!)[0]).toMatchObject({ toolId: 'fuel' });
  });
});

describe('aeropuertos (códigos OACI)', () => {
  const airportInput = (label: string) => screen.getByLabelText(label) as HTMLInputElement;

  it('la herramienta muestra la ruta del ejemplo como datos editables', async () => {
    renderAt('#/tools/fuel');
    await screen.findByRole('heading', { name: 'Planificación de combustible', level: 1 });
    expect([airportInput('Origen').value, airportInput('Destino').value, airportInput('Alterno').value]).toEqual(['SPJC', 'SPQT', 'SPST']);
    expect(screen.getByText(/^Lima – Callao · Jorge Chávez$/, { selector: '.field-hint' })).toBeTruthy();
    expect(screen.getByText('Origen – destino (SPJC – SPQT)')).toBeTruthy();
    expect(screen.getByText('Destino – alterno (SPQT – SPST)')).toBeTruthy();
    expect(screen.getByText(/1\. Origen – destino · SPJC → SPQT · 622 NM/)).toBeTruthy();
  });

  it('cambiar los aeropuertos actualiza la ruta pero no el cálculo', async () => {
    renderAt('#/tools/fuel');
    await screen.findByRole('heading', { name: 'Planificación de combustible', level: 1 });
    const before = answerValues();
    fireEvent.change(airportInput('Destino'), { target: { value: 'spcl' } });
    expect(airportInput('Destino').value).toBe('SPCL');
    expect(screen.getByText(/^Pucallpa · /, { selector: '.field-hint' })).toBeTruthy();
    expect(screen.getByText('Origen – destino (SPJC – SPCL)')).toBeTruthy();
    expect(screen.getByText('Destino – alterno (SPCL – SPST)')).toBeTruthy();
    expect(answerValues()).toEqual(before);
    // con otros aeropuertos ya no es el ejercicio resuelto
    expect(screen.queryByText(/Ejercicio resuelto ·/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Guardar/ }));
    expect(JSON.parse(localStorage.getItem('aeroperf.history')!)[0].summary).toMatch(/^SPJC–SPCL 622 NM .* alterno SPCL–SPST 270 NM/);
  });

  it('un aeropuerto fuera del Perú convierte el vuelo en internacional; avisa si la ruta es incoherente', async () => {
    renderAt('#/tools/fuel');
    await screen.findByRole('heading', { name: 'Planificación de combustible', level: 1 });
    const hm = () => (screen.getByLabelText('Tiempo de espera') as HTMLInputElement).value;
    const fob = () => answerValues()[2];
    const nacionalFob = fob();
    expect(hm()).toBe('45');
    fireEvent.change(airportInput('Alterno'), { target: { value: 'SKBO' } });
    expect(screen.queryByRole('note')).toBeNull();
    expect(screen.getByText(/SKBO no es un aeropuerto del Perú/).closest('.alert')!.textContent).toMatch(/Vuelo internacional/);
    expect(screen.getByText(/^Bogotá \(Colombia\)/, { selector: '.field-hint' })).toBeTruthy();
    expect(hm()).toBe('30');
    expect(document.querySelector('.page-eyebrow')!.textContent).toMatch(/Vuelo internacional/);
    expect(fob()).not.toBe(nacionalFob);
    // de vuelta a nacional: la espera vuelve a 45 min y el FOB al valor original
    fireEvent.change(airportInput('Alterno'), { target: { value: 'SPST' } });
    expect(hm()).toBe('45');
    expect(fob()).toBe(nacionalFob);
    fireEvent.change(airportInput('Alterno'), { target: { value: 'SPQT' } });
    expect(screen.getByRole('note').textContent).toMatch(/El alterno debe ser un aeropuerto distinto del destino/);
    fireEvent.change(airportInput('Alterno'), { target: { value: 'SPXY' } });
    expect(screen.queryByRole('note')).toBeNull();
    expect(screen.getByText('No está en la lista de referencia')).toBeTruthy();
  });

  it('la prueba usa los aeropuertos de su enunciado', async () => {
    renderAt('#/pruebas/b737-combustible-spur-spjc');
    await screen.findByRole('heading', { name: 'Planificación de combustible SPUR – SPJC' });
    expect([airportInput('Origen').value, airportInput('Destino').value, airportInput('Alterno').value]).toEqual(['SPUR', 'SPJC', 'SPSO']);
    expect(screen.getByText(/Aeropuertos: SPUR \(Piura\) · SPJC \(Lima – Callao\) · SPSO \(Pisco\)/)).toBeTruthy();
    expect(screen.getByText(/2\. Destino – alterno · SPJC → SPSO · 145 NM/)).toBeTruthy();
  });
});

describe('ajuste de decimales', () => {
  it('se aplica a la planificación de combustible y a las pruebas', async () => {
    updateSettings({ decimals: 3 });
    renderAt('#/tools/fuel');
    await screen.findByRole('heading', { name: 'Planificación de combustible', level: 1 });
    expect(answerValues()).toEqual(['80,384', '7825,386', '17059,178', '173,404']);
    cleanup();
    updateSettings({ decimals: 0 });
    renderAt('#/pruebas/b737-combustible-spur-spjc');
    await screen.findByRole('heading', { name: 'Planificación de combustible SPUR – SPJC' });
    // con 0 decimales cada paso se redondea a entero, como a mano: 9288 + 3340 + 3946 + 400 = 16974; 96 + 31 + 45 = 172
    expect(answerValues()).toEqual(['96', '9288', '16974', '172']);
    // la validación muestra al menos los decimales de la resolución
    expect(screen.getAllByText('16972,16 lb', { selector: 'td' })).toHaveLength(2);
  });

  it('se aplica a viento y altitud de densidad', async () => {
    updateSettings({ decimals: 0 });
    renderAt('#/tools/wind');
    await screen.findByRole('heading', { name: 'Componentes de viento' });
    expect(document.querySelector('.result-hero-value')!.firstChild!.textContent).toBe('16');
    cleanup();
    updateSettings({ decimals: 3 });
    renderAt('#/tools/density-altitude');
    await screen.findByRole('heading', { name: 'Altitud de densidad' });
    expect(screen.getByText('Presión estática').nextElementSibling!.textContent).toBe('842,857 hPa');
    expect(screen.getByText('Densidad relativa (σ)').nextElementSibling!.textContent).toBe('79,068 %');
  });
});

describe('resolver desde una captura', () => {
  // This text deliberately does not match the regular-expression format.
  // Image data must come from Claude instead of reparsing this text.
  const CLAUDE_TEXT = 'Lectura del ejercicio manuscrito realizada por Claude.';
  const CLAUDE_PARSED: ParsedStatement = {
    aircraft: 'B737',
    trip: { from: 'SPHI', to: 'SPJC', distanceNm: 380, flightLevel: 350, windKt: 40, windKind: 'TW' },
    alternate: { from: 'SPJC', to: 'SPSO', distanceNm: 145, flightLevel: 190, windKt: 25, windKind: 'HW' },
    holding: { weightLb: 97000 },
    taxiFuelLb: 350,
  };
  const claudeResult = () => ({ text: CLAUDE_TEXT, parsed: CLAUDE_PARSED, warnings: [] });
  const image = new File(['png'], 'captura.png', { type: 'image/png' });
  const value = (label: string) => (screen.getByLabelText(label, { exact: true }) as HTMLInputElement).value;
  const statement = () => screen.getByLabelText('Enunciado del ejercicio') as HTMLTextAreaElement;
  const openFuel = async (hash = '#/tools/fuel') => {
    renderAt(hash);
    await screen.findByRole('heading', { name: 'Planificación de combustible', level: 1 });
  };

  it('abre con un ejemplo resuelto en el cuadro de enunciado', async () => {
    await openFuel();
    expect(statement().value).toMatch(/^Un B737 tiene programado/);
    expect(screen.getByText('Resuelto')).toBeTruthy();
    expect(answerValues()).toEqual(['80,38', '7825,39', '17059,18', '173,4']);
  });

  it('usa los datos de Claude aunque el texto de la foto no sea parseable', async () => {
    mockOcr.mockResolvedValueOnce(claudeResult());
    await openFuel();
    fireEvent.change(screen.getByLabelText('Subir imagen del enunciado'), { target: { files: [image] } });
    await waitFor(() => expect(value('Origen')).toBe('SPHI'));
    expect(statement().value).toBe(CLAUDE_TEXT);
    expect(mockOcr).toHaveBeenCalledWith(image, expect.any(Function));
    expect(screen.getByText('Resuelto')).toBeTruthy();
    expect([value('Origen'), value('Destino'), value('Alterno')]).toEqual(['SPHI', 'SPJC', 'SPSO']);
    expect(screen.getAllByLabelText('Distancia').map((e) => (e as HTMLInputElement).value)).toEqual(['380', '145']);
    expect(value('Peso en espera')).toBe('97000');
    expect(value('Combustible de taxi')).toBe('350');
    // Interpolate 380 NM between 350 and 400 NM with a 40 kt tailwind.
    expect(answerValues().slice(0, 2)).toEqual(['54,12', '5457,36']);
    // Mark the omitted holding level and duration as assumptions.
    expect(screen.getByLabelText('Datos detectados').textContent).toContain('FL 015*');
  });

  it('si faltan datos no muestra respuestas y dice qué falta', async () => {
    mockOcr.mockResolvedValueOnce({
      text: 'Lectura parcial de la foto.',
      parsed: {
        aircraft: 'B737',
        trip: { from: 'SPJC', to: 'SPQT', distanceNm: 622, windKt: 55, windKind: 'TW' },
        alternate: {},
        holding: { weightLb: 85000 },
      },
      warnings: ['No se distingue el combustible de taxi.'],
    });
    await openFuel();
    fireEvent.change(screen.getByLabelText('Tomar foto del enunciado'), { target: { files: [image] } });
    await screen.findByText('No se distingue el combustible de taxi.');
    expect(screen.getByText('Faltan datos')).toBeTruthy();
    expect(answerValues()).toEqual([]);
    expect(screen.getByText(/distancia destino – alterno, viento destino – alterno, combustible de taxi/)).toBeTruthy();
    // Recalculate automatically after the missing text is supplied.
    fireEvent.change(statement(), {
      target: { value: 'Origen - destino: SPJC - SPQT 622 nm F350 (55 TW)\nDestino - alterno: SPQT - SPST 270 nm F180 (30 HW)\nHolding con 85000 lbs\nTaxi: 400 lbs' },
    });
    expect(answerValues()).toEqual(['80,38', '7825,39', '17059,18', '173,4']);
    expect(screen.getByText(/Ejercicio resuelto · SPJC – SPQT/)).toBeTruthy();
  });

  it('editar el texto después de una foto sustituye los datos de Claude', async () => {
    mockOcr.mockResolvedValueOnce(claudeResult());
    await openFuel();
    fireEvent.change(screen.getByLabelText('Subir imagen del enunciado'), { target: { files: [image] } });
    await waitFor(() => expect(value('Origen')).toBe('SPHI'));
    fireEvent.change(statement(), {
      target: { value: 'Origen - destino: SPUR - SPJC 750 NM (50 TW)\nDestino - alterno: SPJC - SPSO 145 NM (30 HW)\nHolding con 92500 lbs\nTaxi: 400 lbs' },
    });
    await waitFor(() => expect(value('Origen')).toBe('SPUR'));
    expect(answerValues()).toEqual(['96,41', '9287,53', '16972,16', '172,95']);
    expect(mockOcr).toHaveBeenCalledTimes(1);
  });

  it('no envía otra foto mientras Claude está analizando la primera', async () => {
    let finish!: (result: Awaited<ReturnType<typeof recognizeImage>>) => void;
    mockOcr.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    await openFuel();
    fireEvent.change(screen.getByLabelText('Subir imagen del enunciado'), { target: { files: [image] } });
    fireEvent.paste(window, { clipboardData: { items: [{ type: 'image/png', getAsFile: () => image }] } });
    fireEvent.drop(statement(), { dataTransfer: { files: [image] } });
    expect(mockOcr).toHaveBeenCalledTimes(1);
    expect(answerValues()).toEqual([]);
    expect((screen.getByRole('button', { name: 'Guardar' }) as HTMLButtonElement).disabled).toBe(true);
    await act(async () => finish(claudeResult()));
    await waitFor(() => expect(value('Origen')).toBe('SPHI'));
  });

  it.each([false, true])('una respuesta pendiente no sobrescribe un ejemplo restaurado (texto editado: %s)', async (edited) => {
    let finish!: (result: Awaited<ReturnType<typeof recognizeImage>>) => void;
    mockOcr.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    await openFuel();
    if (edited) fireEvent.change(statement(), { target: { value: 'Un ejercicio pendiente de completar.' } });
    fireEvent.change(screen.getByLabelText('Subir imagen del enunciado'), { target: { files: [image] } });
    fireEvent.click(screen.getByRole('button', { name: 'Ejemplo' }));
    await act(async () => finish(claudeResult()));
    expect(statement().value).toContain('SPJC – SPQT');
    expect(value('Origen')).toBe('SPJC');
    expect(answerValues()).toEqual(['80,38', '7825,39', '17059,18', '173,4']);
  });

  it('«Completar a mano» carga lo detectado para terminarlo en los datos', async () => {
    await openFuel();
    fireEvent.change(statement(), { target: { value: 'Origen - destino: SPJC - SPQT 622 nm (55 TW)\nDestino - alterno: SPQT - SPST 270 nm (30 HW)\nHolding con 85000 lbs' } });
    expect(answerValues()).toEqual([]);
    fireEvent.click(screen.getByRole('button', { name: /Completar a mano/ }));
    expect((screen.getByText('Datos').closest('details') as HTMLDetailsElement).open).toBe(true);
    fireEvent.change(screen.getByLabelText('Combustible de taxi'), { target: { value: '400' } });
    expect(answerValues()[2]).toBe('17059,18');
    expect(screen.getByText('Datos editados a mano')).toBeTruthy();
  });

  it('se puede borrar y escribir otro enunciado sin imagen', async () => {
    await openFuel();
    fireEvent.click(screen.getByRole('button', { name: 'Borrar el enunciado' }));
    expect(statement().value).toBe('');
    expect(screen.getByText(/Escribe, pega o fotografía el enunciado/)).toBeTruthy();
    fireEvent.change(statement(), {
      target: { value: 'Origen - destino: SPUR - SPJC distancia 750 nm F350 (50 TW)\nDestino - alterno: SPJC - SPSO distancia 145 nm F190 (30 HW)\nHolding con 92500 lbs\nCombustible para el taxi: 400 lbs' },
    });
    expect(answerValues()).toEqual(['96,41', '9287,53', '16972,16', '172,95']);
    expect(mockOcr).not.toHaveBeenCalled();
  });

  it('los ejemplos cargan su enunciado', async () => {
    await openFuel();
    fireEvent.click(screen.getByRole('button', { name: 'Borrar el enunciado' }));
    fireEvent.change(screen.getByLabelText('Cargar un ejemplo'), { target: { value: 'b737-combustible-spjc-spqt' } });
    expect(statement().value).toContain('SPJC – SPQT');
    expect(answerValues()[0]).toBe('80,38');
  });

  it('un enlace con datos (historial) los muestra sin enunciado', async () => {
    await openFuel('#/tools/fuel?td=400&tw=20&tk=HW&ad=150&aw=10&ak=TW&hw=100000&hfl=200&hm=45&taxi=400');
    expect(statement().value).toBe('');
    expect(answerValues()).toHaveLength(4);
    expect((screen.getByText('Datos').closest('details') as HTMLDetailsElement).open).toBe(true);
  });

  it('si Claude falla muestra el error y permite volver a intentarlo', async () => {
    mockOcr.mockRejectedValueOnce(new Error('Claude no pudo analizar la imagen. Inténtalo de nuevo.')).mockResolvedValueOnce(claudeResult());
    await openFuel();
    fireEvent.change(screen.getByLabelText('Subir imagen del enunciado'), { target: { files: [image] } });
    expect((await screen.findByRole('alert')).textContent).toContain('Claude no pudo analizar la imagen.');
    expect(answerValues()).toEqual([]);
    expect((screen.getByRole('button', { name: 'Imagen' }) as HTMLButtonElement).disabled).toBe(false);
    fireEvent.change(screen.getByLabelText('Subir imagen del enunciado'), { target: { files: [image] } });
    await waitFor(() => expect(value('Origen')).toBe('SPHI'));
    expect(mockOcr).toHaveBeenCalledTimes(2);
  });
});

describe('navegación simplificada', () => {
  it('el menú lateral muestra solo Calcular y Consultar, sin las opciones ocultas', async () => {
    renderAt('#/');
    await screen.findByRole('heading', { name: '¿Qué quieres resolver?' });
    const titles = [...document.querySelectorAll('.sidebar .nav-section-title')].map((e) => e.textContent);
    expect(titles).toEqual(['Calcular', 'Consultar']);
    const labels = [...document.querySelectorAll('.sidebar .nav-label')].map((e) => e.textContent);
    expect(labels).toContain('Interpolación');
    for (const hidden of ['Interpolación doble', 'Altitud de densidad', 'Componentes de viento', 'Pruebas', 'Despegue', 'Aterrizaje', 'Peso y centrado']) {
      expect(labels).not.toContain(hidden);
    }
    expect(document.querySelector('.sidebar .nav-link.disabled')).toBeNull();
    expect(document.querySelector('.sidebar .nav-section-title + .nav-link')!.textContent).toBe('Plan de combustible');
    // ocultas solo del menú: siguen abriéndose por su ruta
    cleanup();
    renderAt('#/tools/wind');
    expect(await screen.findByRole('heading', { name: 'Componentes de viento', level: 1 })).toBeTruthy();
  });

  it('barra inferior del móvil con los accesos principales', async () => {
    renderAt('#/');
    await screen.findByRole('heading', { name: '¿Qué quieres resolver?' });
    const nav = screen.getByRole('navigation', { name: 'Accesos rápidos' });
    expect(within(nav).getAllByRole('link').map((a) => a.getAttribute('href'))).toEqual(['#/', '#/tools/fuel', '#/tools/linear', '#/tables']);
    fireEvent.click(within(nav).getByRole('button', { name: 'Más' }));
    expect(document.querySelector('.shell')!.className).toContain('mobile-open');
  });

  it('el inicio ofrece tres accesos directos', async () => {
    renderAt('#/');
    await screen.findByRole('heading', { name: '¿Qué quieres resolver?' });
    const tiles = [...document.querySelectorAll('.action-tile')];
    expect(tiles.map((t) => t.getAttribute('href'))).toEqual(['#/tools/fuel', '#/tools/linear', '#/tables']);
    const upcoming = screen.getByRole('heading', { name: 'Próximamente', level: 2 }).nextElementSibling!;
    expect([...upcoming.querySelectorAll('.list-item-title')].map((e) => e.textContent)).toEqual(['Despegue', 'Aterrizaje', 'Peso y centrado']);
    expect(upcoming.querySelectorAll('a')).toHaveLength(0);
  });
});
