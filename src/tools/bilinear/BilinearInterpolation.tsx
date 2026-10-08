import { Grid3x3 } from 'lucide-react';
import { useMemo } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { NumberField } from '@/components/ui/NumberField';
import { PageHeader } from '@/components/ui/PageHeader';
import { ResultHero } from '@/components/ui/ResultHero';
import { ToolActions } from '@/components/ToolActions';
import { formatNumber } from '@/core/format';
import { bilinearInterpolate, InterpolationError, type BilinearResult } from '@/core/interpolation';
import { useFormValues } from '@/hooks/useFormValues';
import { useSettings } from '@/state/settings';

const DEFAULTS = {
  x1: '10', x: '14', x2: '20',
  y1: '2000', y: '3000', y2: '4000',
  q11: '1200', q21: '1290', q12: '1380', q22: '1490',
};

const NUMERIC_KEYS = Object.keys(DEFAULTS) as (keyof typeof DEFAULTS)[];

export default function BilinearInterpolation() {
  const { decimals } = useSettings();
  const form = useFormValues(DEFAULTS);
  const n = form.numbers;
  const fmt = (v: number) => formatNumber(v, decimals);

  const incomplete = NUMERIC_KEYS.some((k) => Number.isNaN(n[k]));

  const outcome = useMemo((): { result?: BilinearResult; error?: string } => {
    if (incomplete) return {};
    try {
      return { result: bilinearInterpolate(n) };
    } catch (e) {
      return { error: e instanceof InterpolationError ? e.message : 'Error de cálculo' };
    }
  }, [n, incomplete]);

  const r = outcome.result;
  const field = (k: keyof typeof DEFAULTS, tag?: string) => (
    <NumberField
      tag={tag}
      value={form.values[k]}
      onChange={(v) => form.set(k, v)}
      invalid={Number.isNaN(n[k]) && form.values[k] !== ''}
    />
  );
  const output = (label: string, v: number | undefined, strong = false) => (
    <div className="field-control" aria-label={label}>
      <span className="field-tag result">{label}</span>
      <output className="result-output" style={strong ? undefined : { fontSize: 15, fontWeight: 600 }}>
        {v === undefined ? '—' : fmt(v)}
      </output>
    </div>
  );

  return (
    <>
      <PageHeader
        eyebrow={<><Grid3x3 size={14} /> Interpolación</>}
        title="Interpolación doble"
        subtitle="Para tablas de dos entradas (p. ej. temperatura en columnas y altitud de presión en filas). Se interpola primero en cada fila (R1, R2) y después entre filas."
        actions={
          <ToolActions
            toolId="bilinear"
            href={form.href}
            canSave={!!r}
            summary={`X=${fmt(n.x)} [${fmt(n.x1)}–${fmt(n.x2)}], Y=${fmt(n.y)} [${fmt(n.y1)}–${fmt(n.y2)}]`}
            result={r ? fmt(r.value) : ''}
            onReset={form.reset}
            onClear={form.clear}
          />
        }
      />

      <div className="grid grid-calc">
        <Card title="Tabla de doble entrada">
          <div className="table-wrap">
            <table className="matrix">
              <thead>
                <tr>
                  <th>Y \ X</th>
                  <th>Inferior</th>
                  <th>Buscado</th>
                  <th>Superior</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th />
                  <td>{field('x1', 'X1')}</td>
                  <td>{field('x', 'X')}</td>
                  <td>{field('x2', 'X2')}</td>
                </tr>
                <tr>
                  <td>{field('y1', 'Y1')}</td>
                  <td>{field('q11')}</td>
                  <td>{output('R1', r?.r1)}</td>
                  <td>{field('q21')}</td>
                </tr>
                <tr>
                  <td>{field('y', 'Y')}</td>
                  <td />
                  <td>{output('X', r?.value, true)}</td>
                  <td />
                </tr>
                <tr>
                  <td>{field('y2', 'Y2')}</td>
                  <td>{field('q12')}</td>
                  <td>{output('R2', r?.r2)}</td>
                  <td>{field('q22')}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="field-hint" style={{ marginTop: 12 }}>
            Ejemplo: distancia de despegue (m) con temperatura 10–20 °C en columnas y altitud de presión 2000–4000 ft en filas.
          </p>
        </Card>

        <div className="stack">
          {outcome.error && <Alert kind="error">{outcome.error}</Alert>}
          {incomplete && !outcome.error && <Alert kind="info">Completa todos los valores de la tabla.</Alert>}
          {r?.extrapolated && (
            <Alert kind="warning">
              <b>Extrapolación:</b> algún valor buscado queda fuera del rango tabulado.
            </Alert>
          )}
          {r && (
            <ResultHero
              label="Valor interpolado"
              value={fmt(r.value)}
              meta={[
                { label: 'R1 (fila Y1)', value: fmt(r.r1) },
                { label: 'R2 (fila Y2)', value: fmt(r.r2) },
              ]}
            />
          )}
          <Card title="Desarrollo">
            <ol className="steps">
              <li>
                <div>
                  <div>Interpolar en la fila Y1 sobre X</div>
                  <span className="mono muted">
                    R1 = Q11 + (Q21 − Q11)(X − X1)/(X2 − X1){r && ` = ${fmt(r.r1)}`}
                  </span>
                </div>
              </li>
              <li>
                <div>
                  <div>Interpolar en la fila Y2 sobre X</div>
                  <span className="mono muted">
                    R2 = Q12 + (Q22 − Q12)(X − X1)/(X2 − X1){r && ` = ${fmt(r.r2)}`}
                  </span>
                </div>
              </li>
              <li>
                <div>
                  <div>Interpolar entre R1 y R2 sobre Y</div>
                  <span className="mono muted">
                    Valor = R1 + (R2 − R1)(Y − Y1)/(Y2 − Y1){r && ` = ${fmt(r.value)}`}
                  </span>
                </div>
              </li>
            </ol>
          </Card>
        </div>
      </div>
    </>
  );
}
