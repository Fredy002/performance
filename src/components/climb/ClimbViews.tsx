import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { Choice } from '@/components/ui/Choice';
import { InfoTip } from '@/components/ui/InfoTip';
import { Unit } from '@/components/ui/Unit';
import { NumberField, numberError } from '@/components/ui/NumberField';
import type { ClimbInput, ClimbRead, ClimbResult } from '@/core/enRouteClimb';
import { formatPlain, parseNumber } from '@/core/format';
import type { ClimbFormKey, ClimbFormValues } from './climbForm';
import { useI18n } from '@/i18n';

/** Datos de la FIGURE 56: peso, altitud de crucero, elevación, temperatura y viento. */
export function ClimbForm({ values: v, set }: { values: ClimbFormValues; set: (k: ClimbFormKey, x: string) => void }) {
  const { t } = useI18n();
  const err = (k: ClimbFormKey) => numberError(v[k], parseNumber(v[k]), t('help.invalidNumber'));
  return (
    <div className="grid grid-2 climb-form">
      <NumberField label={t('climbForm.weight')} unit="lb" value={v.w} onChange={(x) => set('w', x)} help={t('help.brakeReleaseWeight')} error={err('w')} hint={t('climbForm.exampleWeight')} />
      <NumberField label={t('climbForm.cruiseAltitude')} unit="ft" value={v.alt} onChange={(x) => set('alt', x)} help={t('help.cruiseAlt')} error={err('alt')} hint={t('climbForm.altitudeHint')} />
      <NumberField label={t('climbForm.airportElevation')} unit="ft" value={v.elev} onChange={(x) => set('elev', x)} help={t('help.airportElevation')} error={err('elev')} />
      <Choice label={t('climbForm.temperature')} help={t('help.climbTemp')} value={v.t} onChange={(x) => set('t', x)} options={[['ISA', 'ISA'], ['ISA10', 'ISA +10 °C']]} />
      <NumberField label={t('climbForm.wind')} unit="kt" value={v.wind} onChange={(x) => set('wind', x)} help={t('help.climbWind')} error={err('wind')} />
      <Choice label={t('climbForm.windType')} value={v.wk} onChange={(x) => set('wk', x)} options={[['HW', t('fuel.headwindSum')], ['TW', t('fuel.tailwindSubtract')]]} />
    </div>
  );
}

/** Respuestas: combustible consumido y distancia recorrida en el ascenso. */
export function ClimbAnswers({ result: r, decimals, placeholder, footer }: { result?: ClimbResult; decimals: number; placeholder?: ReactNode; footer?: (key: string) => ReactNode }) {
  const { locale, t } = useI18n();
  const p = (x: number) => formatPlain(x, decimals, locale === 'en' ? 'en-US' : 'es-ES');
  return (
    <Card title={t('calc.answers')}>
      {r ? (
        <>
          <div className="answer-grid">
            <div className="answer">
              <div className="answer-label">
                a) {t('climbForm.resultFuel')} <InfoTip label={t('climbForm.resultFuel')}>{t('help.climbFuel')}</InfoTip>
              </div>
              <div className="answer-value">
                {p(r.fuelLb)}
                <small>
                  <Unit symbol="lb" />
                </small>
              </div>
              {footer?.('fuel')}
            </div>
            <div className="answer">
              <div className="answer-label">
                b) {t('climbForm.resultDistance')} <InfoTip label={t('climbForm.resultDistance')}>{t('help.climbDistance')}</InfoTip>
              </div>
              <div className="answer-value">
                {p(r.distNm)}
                <small>
                  <Unit symbol="NM" />
                </small>
              </div>
              {footer?.('distance')}
            </div>
          </div>
          <p className="calc-note">
            {t('climb.answersMeta', { time: p(r.timeMin), tas: p(r.tasKt), figure: r.table.figure, condition: r.table.temp === 'ISA' ? 'ISA' : 'ISA +10 °C' })}
          </p>
        </>
      ) : (
        (placeholder ?? <div className="empty">{t('climb.complete')}</div>)
      )}
    </Card>
  );
}

/** Desarrollo como en la resolución manual: lectura, combustible y distancia. */
export function ClimbSteps({ result: r, input, decimals }: { result: ClimbResult; input: ClimbInput; decimals: number }) {
  const { locale, t } = useI18n();
  const p = (x: number) => formatPlain(x, decimals, locale === 'en' ? 'en-US' : 'es-ES');
  const exactCell = r.rows.length === 1 && r.weights.length === 1;
  const readLine = (label: string, q: ClimbRead, unit: string) => (
    <div className="calc-line" key={label}>
      <span className="calc-label">{label}</span>
      <span>
        {q.byRow.map((b, i) => (
          <span key={b.altFt}>
            {i > 0 && ' · '}
            {r.weights.length === 2 && (
              <>
                {r.rows.length === 2 && `${p(b.altFt)} ft: `}
                {p(b.lo)} + ({p(b.hi)} − {p(b.lo)})({p(input.weightLb)} − {p(r.weights[0])}) / ({p(r.weights[1])} − {p(r.weights[0])}) = {p(b.value)}
              </>
            )}
          </span>
        ))}
        {r.rows.length === 2 && (
          <>
            {r.weights.length === 2 && ' → '}
            {p(q.byRow[0].value)} + ({p(q.byRow[1].value)} − {p(q.byRow[0].value)})({p(input.cruiseAltFt)} − {p(q.byRow[0].altFt)}) / ({p(q.byRow[1].altFt)} − {p(q.byRow[0].altFt)})
          </>
        )}{' '}
        = <b>{p(q.value)}</b> {unit}
      </span>
    </div>
  );
  return (
    <div className="grid grid-2">
      <Card title={t('climb.stepRead', { figure: r.table.figure })}>
        <div className="stack gap-12">
          <p className="calc-text">
            {t(r.table.temp === 'ISA' ? 'climb.temperatureIsa' : 'climb.temperatureIsa10')}: {t('climb.tableDescription', { condition: r.table.temp === 'ISA' ? 'ISA' : 'ISA +10 °C' })}
          </p>
          {exactCell ? (
            <>
              <div className="calc-line">
                <span className="calc-label">{t('climb.cell')}</span>
                <span>
                  {t('climb.row')} {p(r.rows[0].altFt)} ft · {t('climb.column')} {p(r.weights[0])} lb → {t('climb.tableTimeFuel')} <b>{p(r.timeMin)}/{p(r.tableFuelLb)}</b> · {t('climb.tableDistTas')}{' '}
                  <b>
                    {p(r.tableDistNm)}/{p(r.tasKt)}
                  </b>
                </span>
              </div>
              <p className="calc-text">
                {t('climb.exactMeta', { time: p(r.timeMin), tas: p(r.tasKt), fuel: p(r.tableFuelLb), distance: p(r.tableDistNm) })}
              </p>
            </>
          ) : (
            <>
              <p className="calc-text">
                {r.weights.length === 2 && t('climb.betweenCols', { value: p(input.weightLb), lower: p(r.weights[0]), upper: p(r.weights[1]) })}{' '}
                {r.rows.length === 2 && t('climb.betweenRows', { value: p(input.cruiseAltFt), lower: p(r.rows[0].altFt), upper: p(r.rows[1].altFt) })}{' '}
                {t('climb.interpolateEach')}
              </p>
              {readLine(t('climb.time'), r.read.timeMin, 'min')}
              {readLine(t('climb.fuel'), r.read.fuelLb, 'lb')}
              {readLine(t('climb.distance'), r.read.distNm, 'NM')}
              {readLine('TAS', r.read.tasKt, 'kt')}
            </>
          )}
        </div>
      </Card>
      <Card title={t('climb.stepFuel')}>
        <div className="stack gap-12">
          <div className="calc-line">
            <span className="calc-label">{t('climb.adjustment')}</span>
            <span>
              {r.adjustment.belowTable ? (
                <>{t('climb.belowTable', { elevation: p(input.airportElevationFt) })} <b>0</b></>
              ) : r.adjustment.between ? (
                <>
                  {t('climb.adjustmentBetween', { elevation: p(input.airportElevationFt), lower: p(r.adjustment.between[0]), upper: p(r.adjustment.between[1]) })} <b>{p(r.adjustment.fuelLb)}</b> lb
                </>
              ) : (
                <>
                  {t('climb.airportAt', { elevation: p(input.airportElevationFt) })} <b>{p(r.adjustment.fuelLb)}</b> lb
                </>
              )}
            </span>
          </div>
          <div className="calc-line">
            <span className="calc-label">{t('climb.fuel')}</span>
            <span>
              {p(r.tableFuelLb)} {r.adjustment.fuelLb < 0 ? '−' : '+'} {p(Math.abs(r.adjustment.fuelLb))} = <b>{p(r.fuelLb)}</b> lb
            </span>
          </div>
          <p className="calc-text">{t('climb.adjustmentExplain')}</p>
        </div>
      </Card>
      <Card title={t('climb.stepDistance')}>
        <div className="stack gap-12">
          <div className="calc-line">
            <span className="calc-label">{t('fuel.wind')}</span>
            <span>
              d = ({p(r.timeMin)} min ÷ 60) × {p(input.windKt)} kt = <b>{p(r.windDistNm)}</b> NM
            </span>
          </div>
          <div className="calc-line">
            <span className="calc-label">{t('climb.distance')}</span>
            <span>
              {p(r.tableDistNm)} {input.windKind === 'HW' ? '−' : '+'} {p(r.windDistNm)} = <b>{p(r.distNm)}</b> NM
            </span>
          </div>
          <p className="calc-text">{t(input.windKind === 'HW' ? 'climb.windDirection' : 'climb.tailDirection')}.</p>
        </div>
      </Card>
    </div>
  );
}
