import { TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sameClimbForm, scenarioClimbInput, toClimbForm, useEnRouteClimb } from '@/components/climb/climbForm';
import { ClimbAnswers, ClimbForm, ClimbSteps } from '@/components/climb/ClimbViews';
import { ToolActions } from '@/components/ToolActions';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { Disclosure } from '@/components/ui/Disclosure';
import { InfoTip } from '@/components/ui/InfoTip';
import { PageHeader } from '@/components/ui/PageHeader';
import { HELP } from '@/content/help';
import { formatPlain } from '@/core/format';
import { B737_CLIMB_SCENARIOS } from '@/data/tables/enRouteClimbData';
import { useFormValues } from '@/hooks/useFormValues';
import { useDecimals } from '@/state/settings';

const SCENARIOS = B737_CLIMB_SCENARIOS.map((s) => ({ s, form: toClimbForm(scenarioClimbInput(s)) }));
const DEFAULTS = SCENARIOS.find(({ s }) => s.id === 'V-5')!.form;

export default function EnRouteClimb() {
  const decimals = useDecimals();
  const form = useFormValues(DEFAULTS);
  const v = form.values;
  const plan = useEnRouteClimb(v, decimals);
  const r = plan.result;
  const scenario = SCENARIOS.find(({ form: f }) => sameClimbForm(f, v))?.s;
  const p = (x: number) => formatPlain(x, decimals);

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <TrendingUp size={14} /> Boeing 737 · Ascenso en ruta 280/.70
          </>
        }
        title="Ascenso en ruta"
        subtitle="Combustible consumido y distancia recorrida en el ascenso hasta la altitud de crucero, con las tablas del B737 en ISA o ISA +10 °C."
        actions={
          <ToolActions
            toolId="en-route-climb"
            href={form.href}
            canSave={!!r}
            summary={`${scenario ? `${scenario.id} · ` : ''}${v.w} lb · FL ${Math.round(Number(v.alt) / 100)} · aeropuerto ${v.elev} ft · ${v.t === 'ISA10' ? 'ISA +10' : 'ISA'} · ${v.wind} kt ${v.wk}`}
            result={r ? `${p(r.fuelLb)} lb · ${p(r.distNm)} NM` : ''}
            onReset={form.reset}
            capture={() => {
              const prev = form.values;
              return () => form.load(prev);
            }}
          />
        }
      />

      <div className="grid grid-calc">
        <Card
          title="Condiciones"
          action={
            <span className="with-help">
              <select
                className="select select-compact"
                aria-label="Cargar condiciones V-1 a V-5"
                value={scenario?.id ?? ''}
                onChange={(e) => {
                  const found = SCENARIOS.find(({ s }) => s.id === e.target.value);
                  if (found) form.load(found.form);
                }}
              >
                <option value="" disabled>
                  Condiciones…
                </option>
                {SCENARIOS.map(({ s }) => (
                  <option key={s.id} value={s.id}>
                    {s.id}
                  </option>
                ))}
              </select>
              <InfoTip label="las condiciones V-1 a V-5">{HELP.climbScenario}</InfoTip>
            </span>
          }
        >
          <ClimbForm values={v} set={form.set} />
        </Card>
        <div className="stack">
          <ClimbAnswers
            result={r}
            decimals={decimals}
            placeholder={<div className="empty">{plan.error ? 'Revisa los datos.' : 'Completa peso, altitudes y viento con números.'}</div>}
          />
          {plan.error && <Alert kind="error">{plan.error}</Alert>}
        </div>
      </div>

      <div className="calc-section">
        <Disclosure title="Desarrollo paso a paso" meta={r ? `${r.table.figure} · ${p(r.timeMin)} min` : undefined} defaultOpen>
          {r ? <ClimbSteps result={r} input={plan.input} decimals={decimals} /> : <p className="calc-text">Aparece cuando hay respuestas.</p>}
        </Disclosure>
        <Disclosure title="Cómo se calcula">
          <div className="help-block">
            <ul>
              <li>
                <b>Tabla</b>: <Link to="/tables/ascenso-ruta-280-070-isa">ISA</Link> o{' '}
                <Link to="/tables/ascenso-ruta-280-070-isa-mas-10">ISA +10 °C</Link>. Fila de la altitud de crucero y columna del peso al soltar
                frenos: TIME/FUEL (min/lb) y DIST./TAS (NM/kt). Si no son valores exactos se interpola; entre 6000 y 22000 ft la tabla no publica
                filas.
              </li>
              <li>
                <b>Combustible consumido</b> = combustible de la tabla + ajuste por aeropuerto elevado (desde 2000 ft; negativo).
              </li>
              <li>
                <b>Distancia recorrida</b> = distancia de la tabla ∓ (tiempo ÷ 60 × viento): se resta con viento de cara y se suma con viento de
                cola.
              </li>
              <li>Cada paso se redondea a los decimales de Ajustes, como en una resolución a mano.</li>
            </ul>
          </div>
        </Disclosure>
      </div>
    </>
  );
}
