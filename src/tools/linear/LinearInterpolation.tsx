import { ArrowRight, Spline } from 'lucide-react';
import { useMemo } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { InfoTip } from '@/components/ui/InfoTip';
import { NumberField, numberError } from '@/components/ui/NumberField';
import { HELP } from '@/content/help';
import { PageHeader } from '@/components/ui/PageHeader';
import { ResultHero } from '@/components/ui/ResultHero';
import { InterpolationChart } from '@/components/InterpolationChart';
import { ToolActions } from '@/components/ToolActions';
import { formatNumber } from '@/core/format';
import { InterpolationError, linearInterpolate, type LinearResult } from '@/core/interpolation';
import { useFormValues } from '@/hooks/useFormValues';
import { useSettings } from '@/state/settings';

const DEFAULTS = { a: '600', b: '650', c: '622', a1: '89', b1: '96', xn: '', yn: '' };

const PRESETS: { name: string; values: typeof DEFAULTS }[] = [
  { name: 'Ejemplo de referencia', values: DEFAULTS },
  {
    name: 'Distancia de despegue vs. peso',
    values: { a: '2000', b: '2200', c: '2130', a1: '410', b1: '495', xn: 'Peso (kg)', yn: 'Distancia (m)' },
  },
  {
    name: 'Régimen de ascenso vs. altitud',
    values: { a: '4000', b: '6000', c: '5300', a1: '720', b1: '610', xn: 'Altitud (ft)', yn: 'Ascenso (ft/min)' },
  },
];

export default function LinearInterpolation() {
  const { decimals } = useSettings();
  const form = useFormValues(DEFAULTS);
  const { a, b, c, a1, b1 } = form.numbers;
  const fmt = (v: number) => formatNumber(v, decimals);

  const incomplete = [a, b, c, a1, b1].some((v) => Number.isNaN(v));
  // UX-03: distingue «vacío» de «mal escrito» y nombra el campo a corregir
  const err = (k: 'a' | 'b' | 'c' | 'a1' | 'b1') => numberError(form.values[k], form.numbers[k], HELP.invalidNumber);
  const wrong = (['a', 'c', 'b', 'a1', 'b1'] as const).filter((k) => err(k)).map((k) => k.toUpperCase());
  const empty = (['a', 'c', 'b', 'a1', 'b1'] as const).filter((k) => form.values[k].trim() === '').map((k) => k.toUpperCase());

  const outcome = useMemo((): { result?: LinearResult; error?: string } => {
    if (incomplete) return {};
    try {
      return { result: linearInterpolate({ a, b, c, a1, b1 }) };
    } catch (e) {
      return { error: e instanceof InterpolationError ? e.message : 'Error de cálculo' };
    }
  }, [a, b, c, a1, b1, incomplete]);

  const r = outcome.result;
  const xName = form.values.xn || 'Entrada';
  const yName = form.values.yn || 'Resultado';

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <Spline size={14} /> Interpolación
          </>
        }
        title="Interpolación lineal"
        subtitle="Introduce los dos valores tabulados que rodean tu dato (A y B) y sus resultados (A1 y B1). La calculadora obtiene X para el valor C."
        actions={
          <ToolActions
            toolId="linear"
            href={form.href}
            canSave={!!r}
            summary={`${xName} ${fmt(c)} entre ${fmt(a)}→${fmt(a1)} y ${fmt(b)}→${fmt(b1)}`}
            result={r ? `${fmt(r.x)}${form.values.yn ? ` · ${form.values.yn}` : ''}` : ''}
            onReset={form.reset}
            onClear={form.clear}
            capture={() => {
              const prev = form.values;
              return () => form.load(prev);
            }}
          />
        }
      />

      <div className="grid grid-calc">
        <div className="stack">
          <Card
            title="Datos de la tabla"
            action={
              <select
                className="select select-compact"
                aria-label="Cargar ejemplo"
                value=""
                onChange={(e) => {
                  const p = PRESETS[Number(e.target.value)];
                  if (p) form.load(p.values);
                }}
              >
                <option value="" disabled>
                  Cargar ejemplo…
                </option>
                {PRESETS.map((p, i) => (
                  <option key={p.name} value={i}>
                    {p.name}
                  </option>
                ))}
              </select>
            }
          >
            <div className="interp-table">
              <span className="interp-head with-help">
                {xName}
                <InfoTip label="A, B y C">{HELP.linearInput}</InfoTip>
              </span>
              <span />
              <span className="interp-head with-help">
                {yName}
                <InfoTip label="A1, B1 y X">{HELP.linearResult}</InfoTip>
              </span>

              <NumberField tag="A" srLabel="A, fila inferior de la tabla" value={form.values.a} onChange={(v) => form.set('a', v)} error={err('a')} />
              <span className="interp-arrow" aria-hidden="true"><ArrowRight size={20} /></span>
              <NumberField tag="A1" srLabel="A1, valor de la tabla para A" value={form.values.a1} onChange={(v) => form.set('a1', v)} error={err('a1')} />

              <NumberField tag="C" srLabel="C, tu dato" value={form.values.c} onChange={(v) => form.set('c', v)} error={err('c')} />
              <span className="interp-arrow" aria-hidden="true"><ArrowRight size={20} /></span>
              <div className="field">
                <div className="field-control">
                  <span className="field-tag result" aria-hidden="true">X</span>
                  <output className="result-output" aria-label={`Resultado X: ${r ? fmt(r.x) : 'sin calcular'}`}>{r ? fmt(r.x) : '—'}</output>
                </div>
              </div>

              <NumberField tag="B" srLabel="B, fila superior de la tabla" value={form.values.b} onChange={(v) => form.set('b', v)} error={err('b')} />
              <span className="interp-arrow" aria-hidden="true"><ArrowRight size={20} /></span>
              <NumberField tag="B1" srLabel="B1, valor de la tabla para B" value={form.values.b1} onChange={(v) => form.set('b1', v)} error={err('b1')} />
            </div>

            <details className="calc-details">
              <summary>
                Nombrar variables (opcional)
              </summary>
              <div className="grid grid-2">
                <div className="field">
                  <label className="field-label" htmlFor="xn">Variable de entrada</label>
                  <div className="field-control">
                    <input id="xn" placeholder="p. ej. Peso (kg)" value={form.values.xn} onChange={(e) => form.set('xn', e.target.value)} />
                  </div>
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="yn">Variable de resultado</label>
                  <div className="field-control">
                    <input id="yn" placeholder="p. ej. Distancia (m)" value={form.values.yn} onChange={(e) => form.set('yn', e.target.value)} />
                  </div>
                </div>
              </div>
            </details>
          </Card>

          {outcome.error && <Alert kind="error">{outcome.error}</Alert>}
          {wrong.length > 0 && (
            <Alert kind="error">
              Revisa {wrong.join(', ')}: {HELP.invalidNumber.charAt(0).toLowerCase() + HELP.invalidNumber.slice(1)}
            </Alert>
          )}
          {incomplete && !outcome.error && wrong.length === 0 && (
            <Alert kind="info">Completa {empty.join(', ')} para obtener X. Usa «Ejemplo» si quieres ver cómo funciona.</Alert>
          )}
          {r?.extrapolated && (
            <Alert kind="warning">
              <b>Extrapolación:</b> C está fuera del intervalo [A, B]. Los manuales de vuelo (AFM/POH) normalmente
              no permiten extrapolar fuera de los datos publicados.
            </Alert>
          )}

          {r && (
            <ResultHero
              label={`X · ${yName}`}
              value={fmt(r.x)}
              meta={[
                { label: 'Posición en el intervalo', value: `${formatNumber(r.ratio * 100, 1)} %` },
                { label: 'Pendiente', value: formatNumber(r.slope, 4) },
              ]}
            />
          )}
        </div>

        <div className="stack">
          <Card title="Gráfica">
            {r ? (
              <InterpolationChart a={a} b={b} c={c} a1={a1} b1={b1} x={r.x} decimals={decimals} xLabel={xName} yLabel={yName} />
            ) : (
              <div className="empty">
                <Spline size={32} aria-hidden="true" />
                <span>La gráfica aparece cuando los cinco valores son números válidos.</span>
              </div>
            )}
          </Card>

          <Card title="Fórmula y desarrollo">
            <div className="formula" aria-label="X = A1 + (B1 − A1)(C − A) / (B − A)">
              <span>X = A1 +</span>
              <span className="frac">
                <span>(B1 − A1)(C − A)</span>
                <span>(B − A)</span>
              </span>
            </div>
            {r && (
              <ol className="steps">
                <li>
                  <span className="mono">
                    X = {fmt(a1)} + ({fmt(b1)} − {fmt(a1)})({fmt(c)} − {fmt(a)}) / ({fmt(b)} − {fmt(a)})
                  </span>
                </li>
                <li>
                  <span className="mono">
                    X = {fmt(a1)} + ({fmt(b1 - a1)} × {fmt(c - a)}) / {fmt(b - a)}
                  </span>
                </li>
                <li>
                  <span className="mono">
                    X = {fmt(a1)} + {fmt((b1 - a1) * (c - a))} / {fmt(b - a)} = {fmt(a1)} + {fmt(r.x - a1)}
                  </span>
                </li>
                <li>
                  <span className="mono step-result">
                    X = {fmt(r.x)}
                  </span>
                </li>
              </ol>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
