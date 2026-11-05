import { Card } from '@/components/ui/Card';
import { formatPlain } from '@/core/format';
import type { FuelPlanResult, LegResult } from '@/core/fuelPlanning';
import type { WindKind } from '@/data/tables/types';
import type { FuelPlanInput } from '@/core/fuelPlanning';
import { EMPTY_ROUTE, type RouteAirports } from '@/data/airports';
import { useI18n } from '@/i18n';

type Fmt = (v: number) => string;

/** Lectura de la tabla (exacta o interpolada) y corrección por viento de un tramo. */
function LegSteps({ leg, windKt, kind, timeTag, fuelTag, p, f, t }: { leg: LegResult; windKt: number; kind: WindKind; timeTag: string; fuelTag: string; p: Fmt; f: Fmt; t: (key: import('@/i18n').MessageKey, values?: Record<string, string | number>) => string }) {
  const { lookup } = leg;
  const [r1, r2] = lookup.rows;
  const op = kind === 'HW' ? '+' : '−';
  const interpLine = (label: string, a1: number, b1: number, x: number) => (
    <div className="calc-line" key={label}>
      <span className="calc-label">{label}</span>
      <span>
        {f(a1)} + ({f(b1)} − {f(a1)})({f(lookup.distanceNm)} − {f(r1.distanceNm)}) / ({f(r2.distanceNm)} − {f(r1.distanceNm)}) = <b>{p(x)}</b>
      </span>
    </div>
  );
  return (
    <div className="stack gap-12">
      {lookup.interpolated ? (
        <>
          <p className="calc-text">
            {t('fuel.stepLegInterpolated', { distance: f(lookup.distanceNm), lower: f(r1.distanceNm), upper: f(r2.distanceNm) })}
          </p>
          {lookup.gap && (
            <div className="alert alert-warning" role="note">
              <span>
                {t('fuel.stepGap', { lower: f(lookup.gap.afterNm), upper: f(lookup.gap.beforeNm) })}
              </span>
            </div>
          )}
          {interpLine('TAS', r1.tasKt, r2.tasKt, lookup.tasKt)}
          {interpLine(t('fuel.stepTimeLabel'), r1.airTimeMin, r2.airTimeMin, lookup.airTimeMin)}
          {interpLine(t('fuel.stepFuelLabel'), r1.fuelLb, r2.fuelLb, lookup.fuelLb)}
        </>
      ) : (
        <div className="calc-line">
          <span className="calc-label">{t('fuel.stepTable')}</span>
          <span>
            {t('fuel.stepExactRow', { distance: f(lookup.distanceNm), tas: p(lookup.tasKt), time: p(lookup.airTimeMin), fuel: p(lookup.fuelLb) })}
          </span>
        </div>
      )}
      <p className="calc-text">
        {t(kind === 'HW' ? 'fuel.stepWindHead' : 'fuel.stepWindTail')}.
      </p>
      <div className="calc-line">
        <span className="calc-label">{t('fuel.stepDeltaTime')}</span>
        <span>
          {p(lookup.airTimeMin)} × {p(windKt)} ÷ {p(lookup.tasKt)} = <b>{p(Math.abs(leg.deltaTimeMin))}</b>
        </span>
      </div>
      <div className="calc-line">
        <span className="calc-label">{timeTag}</span>
        <span>
          {p(lookup.airTimeMin)} {op} {p(Math.abs(leg.deltaTimeMin))} = <b>{p(leg.timeMin)}</b> min
        </span>
      </div>
      <div className="calc-line">
        <span className="calc-label">{t('fuel.stepDeltaFuel')}</span>
        <span>
          {p(lookup.fuelLb)} × {p(windKt)} ÷ {p(lookup.tasKt)} = <b>{p(Math.abs(leg.deltaFuelLb))}</b>
        </span>
      </div>
      <div className="calc-line">
        <span className="calc-label">{fuelTag}</span>
        <span>
          {p(lookup.fuelLb)} {op} {p(Math.abs(leg.deltaFuelLb))} = <b>{p(leg.fuelLb)}</b> lb
        </span>
      </div>
    </div>
  );
}

function HoldingSteps({ r, weightLb, p, f, t, numberLocale }: { r: FuelPlanResult['holding']; weightLb: number; p: Fmt; f: Fmt; numberLocale: string; t: (key: import('@/i18n').MessageKey, values?: Record<string, string | number>) => string }) {
  const h = r.lookup;
  const fl = (v: number) => `FL ${formatPlain(v, 0, numberLocale).padStart(3, '0')}`;
  return (
    <div className="stack gap-12">
      <div className="calc-line">
        <span className="calc-label">{t('fuel.stepTable')}</span>
        <span>
          {t('fuel.stepHoldingTable', {
            level: fl(h.flightLevel).replace('FL ', ''),
            weight: f(weightLb),
            interpolation: h.interpolated ? t('fuel.stepInterpolatedBetween', { levels: h.flightLevels.map(fl).join(t('fuel.and')), weights: h.weightsKlb.map((w) => f(w * 1000)).join(t('fuel.and')) }) : '',
            flow: p(h.ffPerEngineLbHr),
            epr: f(h.epr),
            ias: f(h.iasKt),
          })}
        </span>
      </div>
      <div className="calc-line">
        <span className="calc-label">{t('fuel.stepPerEngine')}</span>
        <span>
          {p(h.ffPerEngineLbHr)} × {p(r.minutes)} ÷ 60 = <b>{p(r.fuelPerEngineLb)}</b> lb
        </span>
      </div>
      <div className="calc-line">
        <span className="calc-label">H.F</span>
        <span>
          {p(r.fuelPerEngineLb)} × {t('fuel.stepEngines', { count: r.engines })} = <b>{p(r.fuelLb)}</b> lb
        </span>
      </div>
    </div>
  );
}

/** Desarrollo completo: tramo, alterno, espera y resumen, con los decimales de Ajustes. */
export function FuelPlanSteps({
  result: r,
  input,
  airports = EMPTY_ROUTE,
  decimals,
  heading = true,
}: {
  result: FuelPlanResult;
  input: FuelPlanInput;
  airports?: RouteAirports;
  decimals: number;
  /** Título «Desarrollo» encima (no hace falta dentro de una sección plegable) */
  heading?: boolean;
}) {
  const { locale, t } = useI18n();
  const numberLocale = locale === 'en' ? 'en-US' : 'es-ES';
  const p: Fmt = (v) => formatPlain(v, decimals, numberLocale);
  const f: Fmt = (v) => formatPlain(v, 2, numberLocale);
  // «SPJC → SPQT · » si hay códigos escritos
  const leg = (a: string, b: string) => (a || b ? `${a || '····'} → ${b || '····'} · ` : '');
  return (
    <>
      {heading && <h2 className="section-title">{t('calc.steps')}</h2>}
      <div className="grid grid-2">
        <Card title={t('fuel.stepTripLeg', { leg: leg(airports.origin, airports.destination), distance: f(input.trip.distanceNm) })}>
          <LegSteps leg={r.trip} windKt={input.trip.windKt} kind={input.trip.windKind} timeTag="T.T" fuelTag="T.F" p={p} f={f} t={t} />
        </Card>
        <Card title={t('fuel.stepAlternateLeg', { leg: leg(airports.destination, airports.alternate), distance: f(input.alternate.distanceNm) })}>
          <LegSteps leg={r.alternate} windKt={input.alternate.windKt} kind={input.alternate.windKind} timeTag="A.T" fuelTag="A.F" p={p} f={f} t={t} />
        </Card>
        <Card title={t('fuel.stepHolding')}>
          <HoldingSteps r={r.holding} weightLb={input.holding.weightLb} p={p} f={f} t={t} numberLocale={numberLocale} />
        </Card>
        <Card title={t('fuel.stepSummary')}>
          {r.contingency.pct > 0 && (
            <div className="stack gap-12 calc-section-sm">
              <p className="calc-text">
                {t('fuel.stepInternational', { percent: formatPlain(r.contingency.pct * 100, 0, numberLocale) })}
              </p>
              <div className="calc-line">
                <span className="calc-label">{formatPlain(r.contingency.pct * 100, 0, numberLocale)} % T.T</span>
                <span>
                  {p(r.trip.timeMin)} × {f(r.contingency.pct)} = <b>{p(r.contingency.timeMin)}</b> min
                </span>
              </div>
              <div className="calc-line">
                <span className="calc-label">{formatPlain(r.contingency.pct * 100, 0, numberLocale)} % T.F</span>
                <span>
                  {p(r.trip.fuelLb)} × {f(r.contingency.pct)} = <b>{p(r.contingency.fuelLb)}</b> lb
                </span>
              </div>
            </div>
          )}
          <div className="grid grid-2 gap-24">
            <div className="kv">
              <div className="k">T.T</div>
              <div className="v">{p(r.trip.timeMin)}</div>
              {r.contingency.pct > 0 && (
                <>
                  <div className="k">{formatPlain(r.contingency.pct * 100, 0, numberLocale)} % T.T</div>
                  <div className="v">{p(r.contingency.timeMin)}</div>
                </>
              )}
              <div className="k">{t('fuel.stepAlternateTime')}</div>
              <div className="v">{p(r.alternate.timeMin)}</div>
              <div className="k">{t('fuel.stepHoldingTime')}</div>
              <div className="v">{p(r.holding.minutes)}</div>
              <div className="k kv-total">{t('fuel.stepEnduranceMinutes')}</div>
              <div className="v kv-total">{p(r.enduranceMin)}</div>
            </div>
            <div className="kv">
              <div className="k">T.F</div>
              <div className="v">{p(r.trip.fuelLb)}</div>
              {r.contingency.pct > 0 && (
                <>
                  <div className="k">{formatPlain(r.contingency.pct * 100, 0, numberLocale)} % T.F</div>
                  <div className="v">{p(r.contingency.fuelLb)}</div>
                </>
              )}
              <div className="k">{t('fuel.stepAlternateFuel')}</div>
              <div className="v">{p(r.alternate.fuelLb)}</div>
              <div className="k">H.F</div>
              <div className="v">{p(r.holding.fuelLb)}</div>
              <div className="k">{t('fuel.stepTaxi')}</div>
              <div className="v">{p(r.taxiFuelLb)}</div>
              <div className="k kv-total">FOB (lb)</div>
              <div className="v kv-total">{p(r.fobLb)}</div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
