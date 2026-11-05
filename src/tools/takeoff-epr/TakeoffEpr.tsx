import { Gauge } from 'lucide-react';
import { Link } from 'react-router-dom';
import { b727ScenarioCase, b737ScenarioCase, EPR_FORM_KEYS, formAircraft, toEprForm, useTakeoffEpr, type EprFormValues } from '@/components/takeoff/eprForm';
import { TakeoffEprForm } from '@/components/takeoff/TakeoffEprForm';
import { B737EprAnswers, B737EprSteps, TakeoffEprAnswers, TakeoffEprSteps } from '@/components/takeoff/TakeoffEprResults';
import { ToolActions } from '@/components/ToolActions';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { Disclosure } from '@/components/ui/Disclosure';
import { InfoTip } from '@/components/ui/InfoTip';
import { PageHeader } from '@/components/ui/PageHeader';
import { HELP } from '@/content/help';
import { formatPlain } from '@/core/format';
import { B727_TAKEOFF_SCENARIOS, B737_TAKEOFF_SCENARIOS } from '@/data/tables/takeoffEprData';
import { useFormValues } from '@/hooks/useFormValues';
import { useDecimals } from '@/state/settings';

const G5 = B727_TAKEOFF_SCENARIOS.find((s) => s.id === 'G-5')!;
// los enlaces y el historial previos (sin `av`) son del B727: ese sigue siendo el ejemplo por defecto
const DEFAULTS: EprFormValues = toEprForm(b727ScenarioCase(G5));

/** Escenarios de las tablas de condiciones: R-1…R-5 (B737, FIGURE 53) y G-1…G-5 (B727, FIGURE 81). */
const SCENARIOS = [
  ...B737_TAKEOFF_SCENARIOS.map((s) => ({
    id: s.id,
    aircraft: 'b737' as const,
    form: toEprForm(b737ScenarioCase(s)),
    note: `peso ${s.weightKlb} 000 lb · flaps ${s.flapsDeg}° · viento ${Math.abs(s.windKt)} kt ${s.windKt >= 0 ? 'HW' : 'TW'} · pendiente ${Math.abs(s.slopePct)} % ${s.slopePct >= 0 ? 'UP' : 'DN'} · CG ${s.cgStation}`,
  })),
  ...B727_TAKEOFF_SCENARIOS.map((s) => ({
    id: s.id,
    aircraft: 'b727' as const,
    form: toEprForm(b727ScenarioCase(s)),
    note: `peso ${s.grossWeightKlb} 000 lb · flaps ${s.flapsDeg}° · CG ${s.cgStation}`,
  })),
];

export default function TakeoffEpr() {
  const decimals = useDecimals();
  const form = useFormValues(DEFAULTS);
  const v = form.values;
  const aircraft = formAircraft(v);
  const plan = useTakeoffEpr(v);
  // escenario que coincide con los datos actuales (sin contar la 6.ª etapa, que el B737 no usa)
  const scenario = SCENARIOS.find((s) => s.aircraft === aircraft && EPR_FORM_KEYS.every((k) => (aircraft === 'b737' && k === 'b6') || s.form[k] === v[k]));
  const resultText =
    plan.aircraft === 'b737'
      ? plan.result && `EPR ${formatPlain(plan.result.final, 2)}`
      : plan.result && `EPR 1 y 3: ${formatPlain(plan.result.eng13.final, 2)} · motor 2: ${formatPlain(plan.result.eng2.final, 2)}`;
  const placeholder = <div className="empty">{plan.error ? 'Revisa los datos.' : 'Completa elevación, reglaje y temperatura con números.'}</div>;
  const name = aircraft === 'b737' ? 'Boeing 737' : 'Boeing 727';

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <Gauge size={14} /> {name} · Despegue
          </>
        }
        title="EPR de despegue"
        subtitle="EPR máximo de despegue a partir de la elevación, el reglaje altimétrico, la temperatura y los sangrados, con las tablas del B737 o del B727."
        actions={
          <ToolActions
            toolId="takeoff-epr"
            href={form.href}
            canSave={!!plan.result}
            summary={`${name}${scenario ? ` ${scenario.id}` : ''} · Elev ${v.elev} ft · ${v.qnh} ${v.qu === 'mb' ? 'mb' : 'in.Hg'} · ${v.oat} °${v.tu}`}
            result={resultText || ''}
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
                aria-label="Cargar condiciones R-1 a R-5 (B737) o G-1 a G-5 (B727)"
                value={scenario?.id ?? ''}
                onChange={(e) => {
                  const s = SCENARIOS.find((x) => x.id === e.target.value);
                  if (s) form.load(s.form);
                }}
              >
                <option value="" disabled>
                  Condiciones…
                </option>
                <optgroup label="Boeing 737 (FIGURE 53)">
                  {SCENARIOS.filter((s) => s.aircraft === 'b737').map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Boeing 727 (FIGURE 81)">
                  {SCENARIOS.filter((s) => s.aircraft === 'b727').map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id}
                    </option>
                  ))}
                </optgroup>
              </select>
              <InfoTip label="las condiciones de los ejercicios">{HELP.takeoffScenario}</InfoTip>
            </span>
          }
        >
          <TakeoffEprForm values={v} set={form.set} />
          {scenario && (
            <p className="calc-note">
              Condiciones {scenario.id}: {scenario.note}. No intervienen en el EPR.
            </p>
          )}
        </Card>
        <div className="stack">
          {plan.aircraft === 'b737' ? (
            <B737EprAnswers result={plan.result} placeholder={placeholder} />
          ) : (
            <TakeoffEprAnswers result={plan.result} placeholder={placeholder} />
          )}
          {plan.error && <Alert kind="error">{plan.error}</Alert>}
        </div>
      </div>

      <div className="calc-section">
        <Disclosure
          title="Desarrollo paso a paso"
          meta={plan.result ? `Altitud de presión ${formatPlain(plan.result.pressure.pressureAltitudeFt, 0)} ft` : undefined}
          defaultOpen
        >
          {!plan.result ? (
            <p className="calc-text">Aparece cuando hay respuestas.</p>
          ) : plan.aircraft === 'b737' ? (
            <B737EprSteps result={plan.result} input={plan.input} decimals={decimals} />
          ) : (
            <TakeoffEprSteps result={plan.result} input={plan.input} decimals={decimals} />
          )}
        </Disclosure>
        <Disclosure title="Cómo se calcula">
          <div className="help-block">
            <ul>
              <li>
                <b>Altitud de presión</b> = elevación + corrección del reglaje (tabla de{' '}
                <Link to="/tables/reglaje-altimetrico-altitud-presion">reglaje altimétrico a altitud de presión</Link>).
              </li>
              <li>
                <b>Boeing 737</b> (<Link to="/tables/performance-despegue-b737">performance de despegue del B737</Link>): ① límite por
                temperatura en la fila TEMP LIMIT EPR (aire acondicionado OFF: +0,03); ② límite por presión en los recuadros PRESS,
                interpolando entre ellos; ③ se usa el menor. El antihielo de motor no corrige.
              </li>
              <li>
                <b>Boeing 727</b> (<Link to="/tables/performance-despegue-b727">performance de despegue del B727</Link>): tabla MAX TAKEOFF EPR
                por altitud de presión y OAT, interpolando A1 + (B1 − A1)(C − A) / (B − A); desde 3856 ft se usa la última fila. Correcciones:
                aire acondicionado de 1 y 3 OFF +0,04; antihielo del motor 2 ON −0,03; 6.ª etapa ON con 10 °C (50 °F) o más −0,05 al motor 2.
              </li>
              <li>El resultado se redondea a 2 decimales, como los valores de las tablas.</li>
            </ul>
          </div>
        </Disclosure>
      </div>
    </>
  );
}
