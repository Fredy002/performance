import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { InfoTip } from '@/components/ui/InfoTip';
import { formatPlain } from '@/core/format';
import { EPR_DECIMALS, type AltInterpolation, type EngineEpr, type PressureAltitudeStep, type TakeoffEprInput, type TakeoffEprResult } from '@/core/takeoffEpr';
import type { B737EprInput, B737EprResult } from '@/core/takeoffEprB737';
import { B737_EPR_OAT_C, B737_EPR_OAT_F, B737_TEMP_LIMIT_EPR, EPR_OAT_C, EPR_OAT_F } from '@/data/tables/takeoffEprData';
import { useI18n } from '@/i18n';

/** Respuestas: EPR de los motores 1 y 3 y del motor 2 (2 decimales, como la tabla). */
export function TakeoffEprAnswers({ result: r, placeholder, footer }: { result?: TakeoffEprResult; placeholder?: ReactNode; footer?: (key: string) => ReactNode }) {
  const { locale, t } = useI18n();
  const numberLocale = locale === 'en' ? 'en-US' : 'es-ES';
  const answers = r
    ? [
        { key: 'a', label: t('takeoff.answerEng13'), value: r.eng13.final },
        { key: 'b', label: t('takeoff.answerEng2'), value: r.eng2.final },
      ]
    : [];
  return (
    <Card title={<span className="with-help">{t('calc.answers')} <InfoTip label="EPR">{t('help.epr')}</InfoTip></span>}>
      {r ? (
        <>
          <div className="answer-grid">
            {answers.map((a) => (
              <div className="answer" key={a.key}>
                <div className="answer-label">
                  {a.key}) {a.label}
                </div>
                <div className="answer-value">{formatPlain(a.value, EPR_DECIMALS, numberLocale)}</div>
                {footer?.(a.key)}
              </div>
            ))}
          </div>
          <p className="calc-note">
            {t('takeoff.pressureOatNote', { altitude: formatPlain(r.pressure.pressureAltitudeFt, 0, numberLocale), temperature: formatPlain(r.oatF, 1, numberLocale) })}
          </p>
        </>
      ) : (
        (placeholder ?? <div className="empty">{t('takeoff.complete')}</div>)
      )}
    </Card>
  );
}

const signed = (v: number, d: number, locale = 'es-ES') => `${v < 0 ? '−' : '+'} ${formatPlain(Math.abs(v), d, locale)}`;

/** Paso común: altitud de presión con la tabla de reglaje altimétrico (FIGURE 54/82). */
function PressureAltitudeCard({ result: p, input, n }: { result: PressureAltitudeStep; input: { elevationFt: number; altimeter: number; altimeterUnit: 'inHg' | 'mb' }; n: number }) {
  const { locale, t } = useI18n();
  const numberLocale = locale === 'en' ? 'en-US' : 'es-ES';
  const f = (v: number, d: number) => formatPlain(v, d, numberLocale);
  const unit = input.altimeterUnit === 'inHg' ? 'in.Hg' : 'mb';
  const range = input.altimeterUnit === 'inHg' ? p.row.inHg : p.row.mb;
  return (
    <Card title={t('takeoff.pressureCard', { number: n })}>
      <div className="stack gap-12">
        <div className="calc-line">
          <span className="calc-label">QNH</span>
          <span>
            {t('takeoff.inBetween', { value: f(input.altimeter, 2), unit, lower: f(range[0], 2), upper: f(range[1], 2) })}{' '}
            <b>{signed(p.correctionFt, 0, numberLocale)}</b> ft
          </span>
        </div>
        {p.boundary && (
          <div className="alert alert-warning" role="note">
            <span>
              {t('takeoff.qnhBoundary', { value: f(input.altimeter, 2), correction: signed(p.correctionFt, 0, numberLocale), other: signed(p.boundary.otherCorrectionFt, 0, numberLocale) })}
            </span>
          </div>
        )}
        <div className="calc-line">
          <span className="calc-label">{t('takeoff.pressureAltitudeCalc')}</span>
          <span>
            {f(input.elevationFt, 0)} {signed(p.correctionFt, 0, numberLocale)} = <b>{f(p.pressureAltitudeFt, 0)}</b> ft
          </span>
        </div>
      </div>
    </Card>
  );
}

/** Desarrollo paso a paso, como en la resolución manual. */
export function TakeoffEprSteps({ result: r, input, decimals }: { result: TakeoffEprResult; input: TakeoffEprInput; decimals: number }) {
  const { locale, t } = useI18n();
  const numberLocale = locale === 'en' ? 'en-US' : 'es-ES';
  const f = (v: number, d: number) => formatPlain(v, d, numberLocale);
  // el EPR intermedio se muestra con al menos 4 decimales para seguir la interpolación (2,2375)
  const e = (v: number) => f(v, Math.max(decimals, 4));
  const pa = r.pressure.pressureAltitudeFt;
  const correctionLabel = (label: string) =>
    label.startsWith('Aire acondicionado') ? t('takeoff.correction.airConditioning') :
      label.startsWith('Antihielo') ? t('takeoff.correction.antiIce') : t('takeoff.correction.sixthStage');
  const colLabel = (c: number) => (c === 0 ? '−67 to −9 °F (−55 to −23 °C)' : `${f(EPR_OAT_F[c], 0)} °F (${f(EPR_OAT_C[c], 0)} °C)`);

  const altLine = (it: AltInterpolation, key: string, col: number) =>
    it.exact ? (
      <div className="calc-line" key={key}>
        <span className="calc-label">{t('calc.table')}</span>
        <span>
          {t('takeoff.row')} {it.lo.altFt >= 3856 ? t('takeoff.interpolationRows') : `${f(it.lo.altFt, 0)} ft`} · {t('takeoff.column')} {colLabel(col)} → <b>{e(it.value)}</b>
        </span>
      </div>
    ) : (
      <div className="calc-line" key={key}>
        <span className="calc-label">{colLabel(col).split(' (')[0]}</span>
        <span>
          {f(it.a1, 2)} + ({f(it.b1, 2)} − {f(it.a1, 2)})({f(pa, 0)} − {f(it.lo.altFt, 0)}) / (
          {f(it.hi.altFt, 0)} − {f(it.lo.altFt, 0)}) = <b>{e(it.value)}</b>
        </span>
      </div>
    );

  const engineCard = (title: string, eng: EngineEpr, n: number) => (
    <Card title={`${n}. ${title}`}>
      <div className="stack gap-12">
        {!eng.byColumn[0].exact && (
          <p className="calc-text">
            {t('takeoff.betweenRows', { altitude: f(pa, 0), lower: f(eng.byColumn[0].lo.altFt, 0), upper: f(eng.byColumn[0].hi.altFt, 0) })}
          </p>
        )}
        {eng.byColumn.map((it, i) => altLine(it, `${title}-${i}`, r.columns[i]))}
        {eng.byColumn.length === 2 && (
          <div className="calc-line">
            <span className="calc-label">{t('takeoff.betweenColumns')}</span>
            <span>
              {e(eng.byColumn[0].value)} + ({e(eng.byColumn[1].value)} − {e(eng.byColumn[0].value)}) × {f(r.oatRatio ?? 0, 4)} ={' '}
              <b>{e(eng.table)}</b>
            </span>
          </div>
        )}
        {eng.corrections.length === 0 ? (
          <p className="calc-text">{t('takeoff.noBleedCorrections')}</p>
        ) : (
          eng.corrections.map((c) => (
            <div className="calc-line" key={c.label}>
              <span className="calc-label">{t('calc.correction')}</span>
              <span>
                {correctionLabel(c.label)}: <b>{signed(c.value, 2, numberLocale)}</b>
              </span>
            </div>
          ))
        )}
        <div className="calc-line">
          <span className="calc-label">EPR</span>
          <span>
            {e(eng.table)}
            {eng.corrections.map((c) => ` ${signed(c.value, 2, numberLocale)}`).join('')}
            {eng.corrections.length > 0 && <> = {e(eng.corrected)}</>} → <b>{f(eng.final, EPR_DECIMALS)}</b>
          </span>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="grid grid-2">
      <PressureAltitudeCard result={r.pressure} input={input} n={1} />
      <Card title={t('takeoff.temperatureColumn')}>
        <div className="stack gap-12">
          {input.temperatureUnit === 'C' && (
            <div className="calc-line">
              <span className="calc-label">°C → °F</span>
              <span>
                {f(input.temperature, 2)} × 9/5 + 32 = <b>{f(r.oatF, 2)}</b> °F
              </span>
            </div>
          )}
          <p className="calc-text">
            {r.coldRange
              ? t('takeoff.coldRange', { temperature: f(r.oatF, 1) })
              : r.columns.length === 1
                ? t('takeoff.exactColumn', { temperature: f(r.oatF, 1), column: colLabel(r.columns[0]) })
                : t('takeoff.betweenTempColumns', { temperature: f(r.oatF, 1), lower: f(EPR_OAT_F[r.columns[0]], 0), upper: f(EPR_OAT_F[r.columns[1]], 0) })}
          </p>
          <p className="calc-text">{t('takeoff.weightFlapsNote')}</p>
        </div>
      </Card>
      {engineCard(t('calc.engine13'), r.eng13, 3)}
      {engineCard(t('calc.engine2'), r.eng2, 4)}
    </div>
  );
}

/* ======================================================================
   Boeing 737: límite por temperatura, límite por presión y el menor
   ====================================================================== */

/** Respuesta del B737: un único EPR de despegue. */
export function B737EprAnswers({ result: r, placeholder, footer }: { result?: B737EprResult; placeholder?: ReactNode; footer?: (key: string) => ReactNode }) {
  const { locale, t } = useI18n();
  const numberLocale = locale === 'en' ? 'en-US' : 'es-ES';
  return (
    <Card title={<span className="with-help">{t('calc.answers')} <InfoTip label="EPR">{t('help.epr')}</InfoTip></span>}>
      {r ? (
        <>
          <div className="answer-grid">
            <div className="answer">
              <div className="answer-label">a) {t('takeoff.title')}</div>
              <div className="answer-value">{formatPlain(r.final, EPR_DECIMALS, numberLocale)}</div>
              {footer?.('a')}
            </div>
            <div className="answer">
              <div className="answer-label">{t('takeoff.governingLimit')}</div>
              <div className="answer-value answer-value-text">{r.governing === 'temp' ? t('takeoff.temperatureLimit') : t('takeoff.pressureLimit')}</div>
            </div>
          </div>
          <p className="calc-note">
            {t('takeoff.pressureOatNote', { altitude: formatPlain(r.pressure.pressureAltitudeFt, 0, numberLocale), temperature: formatPlain(r.oatF, 1, numberLocale) })}{' '}
            {t('takeoff.eprRoundingNote')}
          </p>
        </>
      ) : (
        (placeholder ?? <div className="empty">{t('takeoff.complete')}</div>)
      )}
    </Card>
  );
}

/** Desarrollo del B737 con los pasos ①②③ impresos en la tabla. */
export function B737EprSteps({ result: r, input, decimals }: { result: B737EprResult; input: B737EprInput; decimals: number }) {
  const { locale, t } = useI18n();
  const numberLocale = locale === 'en' ? 'en-US' : 'es-ES';
  const f = (v: number, d: number) => formatPlain(v, d, numberLocale);
  const e = (v: number) => f(v, Math.max(decimals, 4));
  const pa = r.pressure.pressureAltitudeFt;
  const colLabel = (c: number) => `${f(B737_EPR_OAT_F[c], 0)} °F (${f(B737_EPR_OAT_C[c], 0)} °C)`;
  // como en la resolución a mano: A es el recuadro más cercano al nivel del mar (S.L. antes que −1000; 2000 antes que 3000)
  const [A, B] = Math.abs(r.press.lo.altFt) <= Math.abs(r.press.hi.altFt) ? [r.press.lo, r.press.hi] : [r.press.hi, r.press.lo];
  const altName = (b: { altFt: number }) => (b.altFt === 0 ? 'S.L.' : b.altFt >= 5660 ? t('takeoff.b737HighestRow') : `${f(b.altFt, 0)} ft`);
  return (
    <div className="grid grid-2">
      <PressureAltitudeCard result={r.pressure} input={input} n={1} />
      <Card title={<span className="with-help">{t('takeoff.temperatureOnly')} <InfoTip label="TEMP LIMIT EPR">{t('help.tempLimitEpr')}</InfoTip></span>}>
        <div className="stack gap-12">
          {input.temperatureUnit === 'C' && (
            <div className="calc-line">
              <span className="calc-label">°C → °F</span>
              <span>
                {f(input.temperature, 2)} × 9/5 + 32 = <b>{f(r.oatF, 2)}</b> °F
              </span>
            </div>
          )}
          {r.temp.columns.length === 1 ? (
            <div className="calc-line">
              <span className="calc-label">{t('calc.table')}</span>
              <span>
                {t('takeoff.column')} {colLabel(r.temp.columns[0])} → <b>{e(r.temp.table)}</b>
              </span>
            </div>
          ) : (
            <div className="calc-line">
              <span className="calc-label">{t('takeoff.betweenColumns')}</span>
              <span>
                {f(B737_TEMP_LIMIT_EPR[r.temp.columns[0]], 2)} + ({f(B737_TEMP_LIMIT_EPR[r.temp.columns[1]], 2)} −{' '}
                {f(B737_TEMP_LIMIT_EPR[r.temp.columns[0]], 2)})({f(r.oatF, 2)} − {f(B737_EPR_OAT_F[r.temp.columns[0]], 0)}) / (
                {f(B737_EPR_OAT_F[r.temp.columns[1]], 0)} − {f(B737_EPR_OAT_F[r.temp.columns[0]], 0)}) = <b>{e(r.temp.table)}</b>
              </span>
            </div>
          )}
          <div className="calc-line">
            <span className="calc-label">{t('takeoffForm.airConditioning')}</span>
            <span>
              {input.airConditioning ? (
                <>{t('takeoff.onNoCorrection')}</>
              ) : (
                <>
                  {t('takeoff.offCorrection', { value: e(r.temp.table) })} <b>{e(r.temp.limit)}</b>
                </>
              )}
            </span>
          </div>
          <p className="calc-text">{t('takeoff.antiIceCorrection', { state: input.engineAntiIce ? 'ON' : 'OFF' })}</p>
        </div>
      </Card>
      <Card title={<span className="with-help">{t('takeoff.pressureOnly')} <InfoTip label="PRESS LIMIT EPR">{t('help.pressLimitEpr')}</InfoTip></span>}>
        <div className="stack gap-12">
          {r.press.exact ? (
            <div className="calc-line">
              <span className="calc-label">{t('calc.table')}</span>
              <span>
                {t('takeoff.tableBox', { altitude: altName(r.press.lo) })} → <b>{e(r.press.limit)}</b>
              </span>
            </div>
          ) : (
            <>
              <p className="calc-text">
                {t('takeoff.betweenRows', { altitude: f(pa, 0), lower: `${altName(A)} (${f(A.epr, 2)})`, upper: `${altName(B)} (${f(B.epr, 2)})` })}
              </p>
              <div className="calc-line">
                <span className="calc-label">{t('takeoff.interpolate')}</span>
                <span>
                  {f(A.epr, 2)} + ({f(B.epr, 2)} − {f(A.epr, 2)})({f(pa, 0)} − {f(A.altFt, 0)}) / (
                  {f(B.altFt, 0)} − {f(A.altFt, 0)}) = <b>{e(r.press.limit)}</b>
                </span>
              </div>
            </>
          )}
        </div>
      </Card>
      <Card title={t('takeoff.useLowerLimit')}>
        <div className="stack gap-12">
          <div className="calc-line">
            <span className="calc-label">{t('takeoff.lower')}</span>
            <span>
              {t('takeoff.temperatureWord')} {e(r.temp.limit)} · {t('takeoff.pressureWord')} {e(r.press.limit)} → <b>{e(r.epr)}</b>
            </span>
          </div>
          <div className="calc-line">
            <span className="calc-label">EPR</span>
            <span>
              {e(r.epr)} → <b>{f(r.final, EPR_DECIMALS)}</b>
            </span>
          </div>
          <p className="calc-text">{t('takeoff.governing', { limit: r.governing === 'temp' ? t('takeoff.temperatureWord') : t('takeoff.pressureWord') })}</p>
        </div>
      </Card>
    </div>
  );
}
