// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';

vi.mock('@/services/ocr', () => ({ recognizeImage: vi.fn() }));

function renderAt(hash: string) {
  window.location.hash = hash;
  return render(<App />);
}

beforeEach(() => localStorage.clear());
afterEach(() => cleanup());

describe('Interpolación: cómo leer la gráfica', () => {
  it('explica los ejes, A y B, el recorrido hasta X y la extrapolación', async () => {
    renderAt('#/tools/linear');
    await screen.findByRole('heading', { name: 'Interpolación', level: 1 });
    const help = document.querySelector('.chart-help')!;
    expect(help.textContent).toMatch(/eje horizontal es el dato de entrada/);
    expect(help.textContent).toMatch(/Los círculos A y B son las dos filas de la tabla/);
    expect(help.textContent).toMatch(/desde tu dato C \(622\).*X = 92,08/);
    expect(help.textContent).toMatch(/extrapolación/);
  });

  it('usa los nombres de las variables si se escriben', async () => {
    renderAt('#/tools/linear');
    await screen.findByRole('heading', { name: 'Interpolación', level: 1 });
    fireEvent.change(screen.getByLabelText('Variable de entrada'), { target: { value: 'Peso (kg)' } });
    expect(document.querySelector('.chart-help')!.textContent).toMatch(/eje horizontal es «Peso \(kg\)»/);
  });

  it('sin datos válidos no muestra la explicación', async () => {
    renderAt('#/tools/linear');
    await screen.findByRole('heading', { name: 'Interpolación', level: 1 });
    fireEvent.change(screen.getByLabelText('C, tu dato'), { target: { value: '' } });
    expect(document.querySelector('.chart-help')).toBeNull();
  });
});
