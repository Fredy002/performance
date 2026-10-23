// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import { updateSettings } from './state/settings';

function renderAt(hash: string) {
  window.location.hash = hash;
  return render(<App />);
}

const output = (label: string) => document.querySelector(`.field-control[aria-label="${label}"] output`)!;

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  updateSettings({ decimals: 2 });
});

describe('calculadoras (regresión)', () => {
  it('interpolación lineal: ejemplo de referencia = 92,08', async () => {
    renderAt('#/tools/linear');
    await screen.findByRole('heading', { name: 'Interpolación lineal' });
    expect(output('Resultado X').textContent).toBe('92,08');
  });

  it('interpolación lineal: recalcula al editar y avisa de extrapolación', async () => {
    renderAt('#/tools/linear');
    await screen.findByRole('heading', { name: 'Interpolación lineal' });
    fireEvent.change(screen.getByLabelText('C'), { target: { value: '625' } });
    expect(output('Resultado X').textContent).toBe('92,5');
    fireEvent.change(screen.getByLabelText('C'), { target: { value: '700' } });
    expect(screen.getByText(/Extrapolación:/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText('B'), { target: { value: '600' } });
    expect(screen.getByRole('alert').textContent).toMatch(/A y B no pueden ser iguales/);
  });

  it('interpolación lineal: acepta coma decimal y valores desde la URL', async () => {
    renderAt('#/tools/linear?a=0&b=10&c=2,5&a1=0&b1=100');
    await screen.findByRole('heading', { name: 'Interpolación lineal' });
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
    await screen.findByRole('heading', { name: 'Interpolación lineal' });
    fireEvent.click(screen.getByRole('button', { name: /Guardar/ }));
    expect(JSON.parse(localStorage.getItem('aeroperf.history')!)[0]).toMatchObject({ toolId: 'linear', result: '92,08' });
  });
});

describe('tablas de performance de aeronaves', () => {
  it('la biblioteca lista las tres tablas por su título, sin números de figura', async () => {
    const { container } = renderAt('#/tables');
    await screen.findByRole('heading', { name: 'Tablas de performance de aeronaves' });
    for (const name of ['Planificación de vuelo en crucero Mach 0,74', 'Planificación de vuelo abreviada', 'Performance de espera del Boeing 737']) {
      expect(screen.getByRole('heading', { name })).toBeTruthy();
    }
    expect(container.textContent).not.toMatch(/figur/i);
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
  it('el menú lateral tiene la sección Pruebas', async () => {
    renderAt('#/');
    const link = await screen.findByRole('link', { name: 'Pruebas' });
    expect(link.getAttribute('href')).toBe('#/pruebas');
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

  it('avisa si un aeropuerto no es del Perú o la ruta es incoherente', async () => {
    renderAt('#/tools/fuel');
    await screen.findByRole('heading', { name: 'Planificación de combustible', level: 1 });
    fireEvent.change(airportInput('Alterno'), { target: { value: 'SKBO' } });
    expect(screen.getByRole('note').textContent).toMatch(/SKBO \(alterno\) no es un aeropuerto del Perú/);
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
    expect(answerValues()).toEqual(['96', '9288', '16972', '173']);
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
