// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from './App';

function renderAt(hash: string) {
  window.location.hash = hash;
  return render(<App />);
}

const output = (label: string) => document.querySelector(`.field-control[aria-label="${label}"] output`)!;

beforeEach(() => localStorage.clear());
afterEach(() => cleanup());

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

describe('tablas de performance', () => {
  it('la biblioteca lista las tres figuras', async () => {
    renderAt('#/tables');
    await screen.findByRole('heading', { name: 'Tablas de performance' });
    for (const name of ['Condiciones de operación · crucero M .74', 'Planificación de vuelo abreviada', 'Performance en espera']) {
      expect(screen.getByRole('heading', { name })).toBeTruthy();
    }
  });

  it('figura 66: muestra condiciones y el ejemplo resuelto', async () => {
    renderAt('#/tables/fig66');
    await screen.findByRole('heading', { name: /Condiciones de operación/ });
    const solved = screen.getByText('Ejemplo resuelto con la figura 67').closest('section')!;
    const z1 = within(solved).getByText('Z-1').closest('tr')!;
    expect(z1.textContent).toContain('51,9 min');
    expect(z1.textContent).toContain('5233 lb');
    const z2 = within(solved).getByText('Z-2').closest('tr')!;
    expect(z2.textContent).toContain('+10,0');
    expect(z2.textContent).toContain('10267 lb');;
    expect(screen.getByText('¿Para qué sirve?')).toBeTruthy();
  });

  it('figura 67: filas, tramo omitido y corrección por viento', async () => {
    renderAt('#/tables/fig67');
    await screen.findByRole('heading', { name: 'Planificación de vuelo abreviada' });
    const rows = screen.getAllByRole('row');
    // cabecera + 25 filas + fila de tramo omitido
    expect(rows.filter((r) => r.closest('table')?.querySelector('th')?.textContent === 'Dist. NM')).toHaveLength(27);
    expect(screen.getByText(/Filas 70–250 NM omitidas/)).toBeTruthy();
    expect(screen.getByText('Δ TIME = TIME × WIND COMPONENT ÷ TAS')).toBeTruthy();
  });

  it('figura 69: matriz 8×11 y selector de parámetro', async () => {
    renderAt('#/tables/fig69');
    await screen.findByRole('heading', { name: 'Performance en espera' });
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
