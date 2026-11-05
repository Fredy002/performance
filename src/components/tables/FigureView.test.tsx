// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { FigureTable } from '@/data/tables';
import { tableToCsv } from '@/data/tables/csv';
import { figPlainText, tokenizeFigText } from '@/data/tables/figText';
import { FIG55_B737_TAKEOFF_PERFORMANCE } from '@/data/tables';
import { FigureView } from './FigureView';

const SAMPLE: FigureTable = {
  kind: 'figure',
  id: 'muestra',
  title: 'Muestra',
  category: 'Pruebas',
  summary: 'Lámina de ejemplo para pruebas.',
  source: { figure: 'FIGURE 99', originalTitle: 'Sample', document: 'Doc' },
  help: { purpose: 'p', glossary: [], steps: [], tips: [] },
  uncertain: ['El valor 1.07 es poco legible.'],
  sheets: [
    {
      caption: 'Takeoff Performance',
      blocks: [
        { type: 'heading', text: 'TAKEOFF V_{1} AND V^{2}', size: 'lg' },
        {
          type: 'table',
          headerRows: 1,
          heavy: true,
          rows: [
            [{ t: 'WEIGHT\n1000 LB', rs: 2 }, { t: 'FLAPS', cs: 2, h: true }],
            [{ t: '5' }, { t: '15', shaded: true }],
            { break: true, lines: 3 },
            [{ t: '120' }, { t: 'V_{R}' }, { t: '142, "A"', arrow: true }],
          ],
        },
        {
          type: 'columns',
          columns: [
            [{ type: 'text', text: 'Izquierda' }],
            [{ type: 'table', rows: [[{ t: 'X^{2}' }, { t: 'Y' }]] }],
          ],
        },
        { type: 'scale', title: 'ALT', leftUnit: 'FT', rightUnit: 'M', left: [{ label: '0', pos: 1 }], right: [{ label: '0', pos: 1 }], minorTicks: 4 },
      ],
    },
  ],
};

afterEach(cleanup);

describe('marcado FigText', () => {
  it('reconoce subíndices, superíndices y saltos de línea', () => {
    expect(tokenizeFigText('V_{1}\nx^{2}')).toEqual([
      { kind: 'text', text: 'V' },
      { kind: 'sub', children: [{ kind: 'text', text: '1' }] },
      { kind: 'br' },
      { kind: 'text', text: 'x' },
      { kind: 'sup', children: [{ kind: 'text', text: '2' }] },
    ]);
    expect(figPlainText('WEIGHT\n1000 LB V_{R} x^{2}')).toBe('WEIGHT 1000 LB VR x2');
    expect(figPlainText('a_{b')).toBe('a_{b');
  });
});

describe('FigureView', () => {
  it('separates the independent temperature and pressure EPR limits', () => {
    render(<FigureView table={FIG55_B737_TAKEOFF_PERFORMANCE} />);
    const temperature = screen.getByRole('table', { name: 'Límite de EPR por temperatura' });
    const pressure = screen.getByRole('table', { name: 'Límite de EPR por altitud de presión' });
    expect(temperature.querySelectorAll('tbody tr')).toHaveLength(20);
    expect(pressure.querySelectorAll('tbody tr')).toHaveLength(7);
    const lowAltitude = [...pressure.querySelectorAll('tbody tr')].find(row => row.textContent?.includes('-1000'))!;
    expect(lowAltitude.textContent).toContain('1.96');
    expect(temperature.textContent).not.toContain('5660');
  });

  it('conserva relaciones de celdas y contenido en tarjetas de la aplicación', () => {
    const { container } = render(<FigureView table={SAMPLE} />);
    const table = container.querySelector('.fig-table')!;
    expect(table.classList.contains('data-table')).toBe(true);
    expect(table.closest('.card')).toBeTruthy();
    expect(container.querySelector('.fig-frame')).toBeNull();
    const flaps = screen.getByText('FLAPS');
    expect(flaps.tagName).toBe('TH');
    expect(flaps.getAttribute('colspan')).toBe('2');
    const weight = table.querySelector('thead th[rowspan="2"]')!;
    expect(weight.textContent).toBe('WEIGHT 1000 LB');
    expect(table.querySelector('.fig-shaded')?.textContent).toBe('15');
    expect(screen.getByText('142, "A"')).toBeTruthy();

    const brk = table.querySelector('tr.fig-break td')!;
    expect(brk.getAttribute('colspan')).toBe('3');
    expect(brk.textContent).toContain('omite las filas intermedias');

    const heading = container.querySelector('.fig-heading')!;
    expect(heading.querySelector('sub')?.textContent).toBe('1');
    expect(heading.querySelector('sup')?.textContent).toBe('2');
    expect(container.innerHTML).not.toContain('_{');
    expect(container.querySelectorAll('.fig-columns')).toHaveLength(0);
    expect(screen.getByText('Izquierda')).toBeTruthy();
    expect(container.querySelectorAll('.card')).toHaveLength(3);
    expect(container.querySelectorAll('.fig-scale .fig-tick.is-minor')).toHaveLength(5);
  });

  it('muestra el pie sin número de figura y las observaciones', () => {
    const { container } = render(<FigureView table={SAMPLE} />);
    expect(container.querySelector('figcaption')?.textContent).toBe('Takeoff Performance');
    expect(container.textContent).not.toMatch(/figure/i);
    expect(screen.getByText('Observaciones sobre la fuente')).toBeTruthy();
    expect(screen.getByText('El valor 1.07 es poco legible.')).toBeTruthy();
  });
});

describe('CSV de una lámina', () => {
  it('una línea por fila, sin marcas de corte y con tablas separadas por línea vacía', () => {
    expect(tableToCsv(SAMPLE)).toBe(['WEIGHT 1000 LB,FLAPS', '5,15', '120,VR,"142, ""A"""', '', 'X2,Y'].join('\n'));
  });
});
