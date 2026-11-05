import { Wind } from 'lucide-react';
import { useId } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { InfoTip } from '@/components/ui/InfoTip';
import { NumberField, numberError } from '@/components/ui/NumberField';
import { HELP } from '@/content/help';
import { PageHeader } from '@/components/ui/PageHeader';
import { ResultHero } from '@/components/ui/ResultHero';
import { ToolActions } from '@/components/ToolActions';
import { formatNumber, parseNumber } from '@/core/format';
import { runwayToHeading, windComponents, type WindComponents as WC } from '@/core/wind';
import { useFormValues } from '@/hooks/useFormValues';
import { useDecimals } from '@/state/settings';

const DEFAULTS = { rwy: '27', dir: '300', spd: '18', limit: '15' };

function WindDiagram({ heading, w, dir }: { heading: number; w: WC; dir: number }) {
  const size = 260;
  const c = size / 2;
  const R = 100;
  const toXY = (deg: number, r: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [c + r * Math.cos(rad), c + r * Math.sin(rad)];
  };
  const [wx, wy] = toXY(dir, R + 6);
  const [ix, iy] = toXY(dir, 40);
  const markerId = useId().replace(/:/g, '');
  return (
    <svg className="chart chart-compass" viewBox={`0 0 ${size} ${size}`} role="img"
      aria-label={`Pista ${formatNumber(heading, 0)}°, viento desde ${formatNumber(dir, 0)}°`}>
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--result)" />
        </marker>
      </defs>
      <circle cx={c} cy={c} r={R} fill="none" stroke="var(--chart-grid)" strokeWidth={1.5} />
      {Array.from({ length: 36 }, (_, i) => {
        const [x1, y1] = toXY(i * 10, R);
        const [x2, y2] = toXY(i * 10, i % 9 === 0 ? R - 12 : R - 6);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--border-strong)" />;
      })}
      {['N', 'E', 'S', 'W'].map((l, i) => {
        const [x, y] = toXY(i * 90, R - 22);
        return <text key={l} x={x} y={y + 4} textAnchor="middle" className="chart-compass-label">{l}</text>;
      })}
      <g transform={`rotate(${heading} ${c} ${c})`}>
        <rect x={c - 11} y={c - 70} width={22} height={140} rx={3} fill="var(--text)" />
        <line x1={c} y1={c - 60} x2={c} y2={c + 60} stroke="var(--bg-elevated)" strokeDasharray="8 7" strokeWidth={2} />
      </g>
      <line x1={wx} y1={wy} x2={ix} y2={iy} stroke="var(--result)" strokeWidth={3} markerEnd={`url(#${markerId})`} />
      <text x={c} y={size - 4} textAnchor="middle">
        {w.headwind >= 0 ? 'Cara' : 'Cola'} {formatNumber(Math.abs(w.headwind), 0)} kt · Cruzado {formatNumber(Math.abs(w.crosswind), 0)} kt
      </text>
    </svg>
  );
}

export default function WindComponents() {
  const decimals = useDecimals();
  const form = useFormValues(DEFAULTS);
  const heading = runwayToHeading(form.values.rwy);
  const dir = parseNumber(form.values.dir);
  const spd = parseNumber(form.values.spd);
  const limit = parseNumber(form.values.limit);
  const rwyInvalid = !!form.values.rwy.trim() && !Number.isFinite(heading);
  const valid = Number.isFinite(heading) && Number.isFinite(dir) && Number.isFinite(spd) && spd >= 0;
  const w = valid ? windComponents(heading, dir, spd) : undefined;
  const kt = (v: number) => formatNumber(Math.abs(v), decimals);

  return (
    <>
      <PageHeader
        eyebrow={<><Wind size={14} /> Atmósfera</>}
        title="Componentes de viento"
        subtitle="Descompone el viento reportado (METAR/ATIS) en componente de cara o cola y componente cruzada respecto a la pista."
        actions={
          <ToolActions
            toolId="wind"
            href={form.href}
            canSave={!!w}
            summary={`RWY ${form.values.rwy} · viento ${form.values.dir}/${form.values.spd} kt`}
            result={w ? `${w.headwind >= 0 ? 'HW' : 'TW'} ${kt(w.headwind)} · XW ${kt(w.crosswind)} kt` : ''}
            onReset={form.reset}
            capture={() => {
              const prev = form.values;
              return () => form.load(prev);
            }}
          />
        }
      />
      <div className="grid grid-calc">
        <div className="stack">
          <Card title="Datos">
            <div className="grid grid-2">
              <div className="field">
                <span className="field-label-row">
                  <label className="field-label" htmlFor="rwy">Pista</label>
                  <InfoTip label="la pista">{HELP.runway}</InfoTip>
                </span>
                <div className={`field-control${rwyInvalid ? ' invalid' : ''}`}>
                  <span className="field-tag" aria-hidden="true">RWY</span>
                  <input id="rwy" value={form.values.rwy} onChange={(e) => form.set('rwy', e.target.value)} placeholder="27L o 274" aria-invalid={rwyInvalid || undefined} aria-describedby="rwy-msg" />
                </div>
                <span id="rwy-msg" className={`field-hint${rwyInvalid ? ' field-error' : ''}`}>
                  {rwyInvalid ? 'Escribe un número de pista del 01 al 36 (con L, C o R si hace falta) o un rumbo de 0 a 360.' : 'Designador (27L) o rumbo magnético (274)'}
                </span>
              </div>
              <NumberField label="Dirección del viento" value={form.values.dir} onChange={(v) => form.set('dir', v)} unit="°" help={HELP.windDirection} error={numberError(form.values.dir, dir, HELP.invalidNumber)} hint="Ejemplo: 300" />
              <NumberField label="Velocidad del viento" value={form.values.spd} onChange={(v) => form.set('spd', v)} unit="kt" error={numberError(form.values.spd, spd, HELP.invalidNumber) ?? (spd < 0 ? 'La velocidad no puede ser negativa.' : undefined)} hint="Ejemplo: 18" />
              <NumberField label="Límite de viento cruzado" value={form.values.limit} onChange={(v) => form.set('limit', v)} unit="kt" help={HELP.crosswindLimit} error={numberError(form.values.limit, limit, HELP.invalidNumber)} hint="Opcional" />
            </div>
          </Card>
          {!valid && <Alert kind="info">Completa pista, dirección y velocidad del viento para ver las componentes.</Alert>}
          {w && Number.isFinite(limit) && Math.abs(w.crosswind) > limit && (
            <Alert kind="error">El viento cruzado ({kt(w.crosswind)} kt) supera el límite indicado ({formatNumber(limit, 0)} kt).</Alert>
          )}
          {w && w.headwind < 0 && <Alert kind="warning">Viento de cola de {kt(w.headwind)} kt: revisa las limitaciones y la corrección de distancias.</Alert>}
          {w && (
            <ResultHero
              label={w.headwind >= 0 ? 'Viento de cara' : 'Viento de cola'}
              value={kt(w.headwind)}
              unit="kt"
              meta={[
                { label: `Cruzado desde la ${w.crosswind >= 0 ? 'derecha' : 'izquierda'}`, value: `${kt(w.crosswind)} kt` },
                { label: 'Ángulo', value: `${formatNumber(Math.abs(w.angle), 0)}°` },
              ]}
            />
          )}
        </div>
        <Card title="Diagrama">
          {w ? <WindDiagram heading={heading} w={w} dir={dir} /> : <div className="empty"><Wind size={32} aria-hidden="true" />El diagrama aparece cuando escribes pista, dirección y velocidad del viento.</div>}
          <p className="calc-caption">
            HW = V·cos(α) · XW = V·sen(α), siendo α el ángulo entre el viento y la pista.
          </p>
        </Card>
      </div>
    </>
  );
}
