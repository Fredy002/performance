// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';

vi.mock('@/services/ocr', () => ({ recognizeImage: vi.fn() }));

function renderAt(hash: string) {
  window.location.hash = hash;
  return render(<App />);
}

beforeEach(() => localStorage.clear());
afterEach(() => cleanup());

describe('Interpolación: gráfica oculta', () => {
  it('no muestra la tarjeta «Gráfica»; el resultado y el desarrollo siguen visibles', async () => {
    renderAt('#/tools/linear');
    await screen.findByRole('heading', { name: 'Interpolación', level: 1 });
    expect(screen.queryByRole('heading', { name: 'Gráfica' })).toBeNull();
    expect(document.querySelector('.chart-help')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Fórmula y desarrollo' })).toBeTruthy();
    expect(document.querySelector('output[aria-label^="Resultado X:"]')!.textContent).toBe('92,08');
  });
});
