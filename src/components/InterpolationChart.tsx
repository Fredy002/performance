import { formatNumber } from '@/core/format';

interface Props {
  a: number;
  b: number;
  c: number;
  a1: number;
  b1: number;
  x: number;
  decimals: number;
  xLabel?: string;
  yLabel?: string;
}

const W = 520;
const H = 300;
const PAD = { l: 58, r: 22, t: 20, b: 44 };

function niceTicks(min: number, max: number, count = 5): number[] {
  const span = max - min || 1;
  const raw = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= count) ?? raw;
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + step * 1e-9; v += step) ticks.push(Number(v.toPrecision(12)));
  return ticks;
}

/** Gráfica de la recta de interpolación con el punto calculado y sus proyecciones. */
export function InterpolationChart({ a, b, c, a1, b1, x, decimals, xLabel = 'Entrada', yLabel = 'Resultado' }: Props) {
  const xs = [a, b, c];
  const ys = [a1, b1, x];
  const padRange = (lo: number, hi: number) => {
    const span = hi - lo || Math.abs(hi) || 1;
    return [lo - span * 0.12, hi + span * 0.12];
  };
  const [x0, x1] = padRange(Math.min(...xs), Math.max(...xs));
  const [y0, y1] = padRange(Math.min(...ys), Math.max(...ys));

  const sx = (v: number) => PAD.l + ((v - x0) / (x1 - x0)) * (W - PAD.l - PAD.r);
  const sy = (v: number) => H - PAD.b - ((v - y0) / (y1 - y0)) * (H - PAD.t - PAD.b);

  // recta extendida a todo el rango visible (punteada) y tramo tabulado (sólido)
  const slope = (b1 - a1) / (b - a);
  const lineAt = (v: number) => a1 + slope * (v - a);

  const fmt = (v: number) => formatNumber(v, decimals);

  return (
    <svg
      className="chart"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Recta entre (${fmt(a)}, ${fmt(a1)}) y (${fmt(b)}, ${fmt(b1)}); para ${fmt(c)} se obtiene ${fmt(x)}`}
    >
      <defs>
        <clipPath id="plot-area">
          <rect x={PAD.l} y={PAD.t} width={W - PAD.l - PAD.r} height={H - PAD.t - PAD.b} />
        </clipPath>
      </defs>

      {niceTicks(y0, y1).map((t) => (
        <g key={`y${t}`}>
          <line x1={PAD.l} x2={W - PAD.r} y1={sy(t)} y2={sy(t)} stroke="var(--chart-grid)" />
          <text x={PAD.l - 8} y={sy(t) + 4} textAnchor="end">
            {formatNumber(t, 2)}
          </text>
        </g>
      ))}
      {niceTicks(x0, x1).map((t) => (
        <text key={`x${t}`} x={sx(t)} y={H - PAD.b + 18} textAnchor="middle">
          {formatNumber(t, 2)}
        </text>
      ))}
      <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke="var(--border-strong)" />
      <text x={(PAD.l + W - PAD.r) / 2} y={H - 6} textAnchor="middle" style={{ fontWeight: 600 }}>
        {xLabel}
      </text>
      <text
        x={14}
        y={(PAD.t + H - PAD.b) / 2}
        textAnchor="middle"
        transform={`rotate(-90 14 ${(PAD.t + H - PAD.b) / 2})`}
        style={{ fontWeight: 600 }}
      >
        {yLabel}
      </text>

      <g clipPath="url(#plot-area)">
        <line
          x1={sx(x0)}
          y1={sy(lineAt(x0))}
          x2={sx(x1)}
          y2={sy(lineAt(x1))}
          stroke="var(--chart-line)"
          strokeOpacity={0.35}
          strokeDasharray="4 5"
          strokeWidth={2}
        />
        <line x1={sx(a)} y1={sy(a1)} x2={sx(b)} y2={sy(b1)} stroke="var(--chart-line)" strokeWidth={3} strokeLinecap="round" />

        {/* proyecciones de C → X */}
        <polyline
          points={`${sx(c)},${H - PAD.b} ${sx(c)},${sy(x)} ${PAD.l},${sy(x)}`}
          fill="none"
          stroke="var(--result)"
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
      </g>

      {[
        { px: a, py: a1, label: 'A' },
        { px: b, py: b1, label: 'B' },
      ].map((p) => (
        <g key={p.label}>
          <circle cx={sx(p.px)} cy={sy(p.py)} r={6} fill="var(--bg-elevated)" stroke="var(--chart-point)" strokeWidth={2.5} />
          <text x={sx(p.px)} y={sy(p.py) - 12} textAnchor="middle" style={{ fontWeight: 700, fill: 'var(--chart-point)' }}>
            {p.label}
          </text>
        </g>
      ))}

      <circle cx={sx(c)} cy={sy(x)} r={7} fill="var(--result)" stroke="var(--bg-elevated)" strokeWidth={2.5} />
      <text
        x={sx(c) + 12}
        y={sy(x) + (slope >= 0 ? 16 : -10)}
        style={{ fontWeight: 700, fill: 'var(--result)', fontSize: 13 }}
      >
        X = {fmt(x)}
      </text>
    </svg>
  );
}
