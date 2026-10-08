import type { ReactNode } from 'react';

interface Props {
  label: ReactNode;
  value: ReactNode;
  unit?: string;
  meta?: { label: string; value: ReactNode }[];
}

export function ResultHero({ label, value, unit, meta }: Props) {
  return (
    <div className="result-hero" aria-live="polite">
      <div className="result-hero-label">{label}</div>
      <div className="result-hero-value">
        {value}
        {unit && <small>{unit}</small>}
      </div>
      {meta && meta.length > 0 && (
        <div className="result-hero-meta">
          {meta.map((m) => (
            <span key={m.label}>
              {m.label}: <b>{m.value}</b>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
