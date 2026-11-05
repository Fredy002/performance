import { Grid3x3 } from 'lucide-react';
import { useMemo } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { InfoTip } from '@/components/ui/InfoTip';
import { NumberField, numberError } from '@/components/ui/NumberField';
import { HELP } from '@/content/help';
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

const TAG: Record<keyof typeof DEFAULTS, string> = {
  x1: 'X1', x: 'X', x2: 'X2', y1: 'Y1', y: 'Y', y2: 'Y2', q11: 'Q11', q21: 'Q21', q12: 'Q12', q22: 'Q22',
};

const DESCRIPTION: Record<keyof typeof DEFAULTS, string> = {
  x1: 'columna inferior',
  x: 'valor buscado en las columnas',
  x2: 'columna superior',
  y1: 'fila inferior',
  y: 'valor buscado en las filas',
  y2: 'fila superior',
  q11: 'valor de la tabla en X1 y Y1',
  q21: 'valor de la tabla en X2 y Y1',
  q12: 'valor de la tabla en X1 y Y2',
  q22: 'valor de la tabla en X2 y Y2',
};

export default function BilinearInterpolation() {
  const { decimals } = useSettings();
  const form = useFormValues(DEFAULTS);
  const n = form.numbers;
  const fmt = (v: number) => formatNumber(v, decimals);

  const incomplete = NUMERIC_KEYS.some((k) => Number.isNaN(n[k]));

  const outcome = useMemo((): { result?: BilinearResult; error?: string } => {
    if (incomplete) return {};
    // mensajes en los términos de esta tabla (X1/X2, Y1/Y2), no los de la lineal
    if (n.x1 === n.x2) return { error: 'X1 y X2 no pueden ser iguales: escribe las dos columnas de la tabla que rodean X.' };
    if (n.y1 === n.y2) return { error: 'Y1 y Y2 no pueden ser iguales: escribe las dos filas de la tabla que rodean Y.' };
    try {
      return { result: bilinearInterpolate(n) };
    } catch (e) {
      return { error: e instanceof InterpolationError ? e.message : 'Error de cálculo' };
    }
  }, [n, incomplete]);

  const r = outcome.result;
  const wrong = NUMERIC_KEYS.filter((k) => numberError(form.values[k], n[k], HELP.invalidNumber)).map((k) => TAG[k]);
  // UX-01: cada celda con sigla visible y nombre accesible descriptivo
  const field = (k: keyof typeof DEFAULTS) => (
    <NumberField
      tag={TAG[k]}
      srLabel={`${TAG[k]}, ${DESCRIPTION[k]}`}
      value={form.values[k]}
      onChange={(v) => form.set(k, v)}
      invalid={!!numberError(form.values[k], n[k], HELP.invalidNumber)}
    />
  );
  const output = (label: string, v: number | undefined, strong = false) => (
    <div className="field-control">
      <span className="field-tag result" aria-hidden="true">{label}</span>
      <output className={`result-output${strong ? '' : ' is-secondary'}`} aria-label={`${label}: ${v === undefined ? 'sin calcular' : fmt(v)}`}>
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
            capture={() => {
              const prev = form.values;
              return () => form.load(prev);
            }}
          />
        }
      />

      <div className="grid grid-calc">
        <Card title="Tabla de doble entrada">
          <div className="table-wrap" tabIndex={0} role="region" aria-label="Tabla de doble entrada, desplazable">
            <table className="matrix">
              <thead>
                <tr>
                  <th scope="col">
                    <span className="matrix-axis">
                      Y \ X <InfoTip label="X e Y">{HELP.bilinearAxes}</InfoTip>
                    </span>
                  </th>
                  <th scope="col">Inferior</th>
                  <th scope="col">Buscado</th>
                  <th scope="col">Superior</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row"><span className="sr-only">Columnas X</span></th>
                  <td>{field('x1')}</td>
                  <td>{field('x')}</td>
                  <td>{field('x2')}</td>
                </tr>
                <tr>
                  <td>{field('y1')}</td>
                  <td>{field('q11')}</td>
                  <td>{output('R1', r?.r1)}</td>
                  <td>{field('q21')}</td>
                </tr>
                <tr>
                  <td>{field('y')}</td>
                  <td />
                  <td>{output('X', r?.value, true)}</td>
                  <td />
                </tr>
                <tr>
                  <td>{field('y2')}</td>
                  <td>{field('q12')}</td>
                  <td>{output('R2', r?.r2)}</td>
                  <td>{field('q22')}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="calc-caption with-help">
            Q11–Q22: valores de la tabla en cada cruce. <InfoTip label="Q11 a Q22">{HELP.bilinearCells}</InfoTip>
          </p>
          <p className="calc-caption">
            Ejemplo: distancia de despegue (m) con temperatura 10–20 °C en columnas y altitud de presión 2000–4000 ft en filas.
          </p>
        </Card>

        <div className="stack">
          {outcome.error && <Alert kind="error">{outcome.error}</Alert>}
          {wrong.length > 0 && (
            <Alert kind="error">
              Revisa {wrong.join(', ')}: {HELP.invalidNumber.charAt(0).toLowerCase() + HELP.invalidNumber.slice(1)}
            </Alert>
          )}
          {incomplete && !outcome.error && wrong.length === 0 && (
            <Alert kind="info">Completa las diez casillas de la tabla. Usa «Ejemplo» si quieres ver cómo funciona.</Alert>
          )}
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
