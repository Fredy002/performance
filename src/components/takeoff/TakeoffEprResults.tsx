import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { InfoTip } from '@/components/ui/InfoTip';
import { HELP } from '@/content/help';
import { formatPlain } from '@/core/format';
import { EPR_DECIMALS, type AltInterpolation, type EngineEpr, type PressureAltitudeStep, type TakeoffEprInput, type TakeoffEprResult } from '@/core/takeoffEpr';
import type { B737EprInput, B737EprResult } from '@/core/takeoffEprB737';
import { B737_EPR_OAT_C, B737_EPR_OAT_F, B737_TEMP_LIMIT_EPR, EPR_OAT_C, EPR_OAT_F } from '@/data/tables/takeoffEprData';

/** Respuestas: EPR de los motores 1 y 3 y del motor 2 (2 decimales, como la tabla). */
export function TakeoffEprAnswers({ result: r, placeholder, footer }: { result?: TakeoffEprResult; placeholder?: ReactNode; footer?: (key: string) => ReactNode }) {
  const answers = r
    ? [
        { key: 'a', label: 'EPR motores 1 y 3', value: r.eng13.final },
        { key: 'b', label: 'EPR motor 2', value: r.eng2.final },
      ]
    : [];
  return (
    <Card title={<span className="with-help">Respuestas <InfoTip label="EPR">{HELP.epr}</InfoTip></span>}>
      {r ? (
        <>
          <div className="answer-grid">
            {answers.map((a) => (
              <div className="answer" key={a.key}>
                <div className="answer-label">
                  {a.key}) {a.label}
                </div>
                <div className="answer-value">{formatPlain(a.value, EPR_DECIMALS)}</div>
                {footer?.(a.key)}
              </div>
            ))}
          </div>
          <p className="calc-note">
            Altitud de presión {formatPlain(r.pressure.pressureAltitudeFt, 0)} ft · OAT {formatPlain(r.oatF, 1)} °F. EPR redondeado
            a 2 decimales, como en la tabla.
          </p>
        </>
      ) : (
        (placeholder ?? <div className="empty">Completa elevación, reglaje y temperatura.</div>)
      )}
    </Card>
  );
}

const signed = (v: number, d: number) => `${v < 0 ? '−' : '+'} ${formatPlain(Math.abs(v), d)}`;

/** Paso común: altitud de presión con la tabla de reglaje altimétrico (FIGURE 54/82). */
function PressureAltitudeCard({ result: p, input, n }: { result: PressureAltitudeStep; input: { elevationFt: number; altimeter: number; altimeterUnit: 'inHg' | 'mb' }; n: number }) {
  const unit = input.altimeterUnit === 'inHg' ? 'in.Hg' : 'mb';
  const range = input.altimeterUnit === 'inHg' ? p.row.inHg : p.row.mb;
  return (
    <Card title={`${n}. Altitud de presión (reglaje altimétrico)`}>
      <div className="stack gap-12">
        <div className="calc-line">
          <span className="calc-label">QNH</span>
          <span>
            {formatPlain(input.altimeter, 2)} {unit} está entre {formatPlain(range[0], 2)} y {formatPlain(range[1], 2)} → corrección{' '}
            <b>{signed(p.correctionFt, 0)}</b> ft
          </span>
        </div>
        {p.boundary && (
          <div className="alert alert-warning" role="note">
            <span>
              {formatPlain(input.altimeter, 2)} es el límite entre dos filas (corrección {signed(p.correctionFt, 0)} o{' '}
              {signed(p.boundary.otherCorrectionFt, 0)} ft). La tabla no indica cuál usar: se toma la fila en la que es el límite superior.
            </span>
          </div>
        )}
        <div className="calc-line">
          <span className="calc-label">Altitud de presión</span>
          <span>
            {formatPlain(input.elevationFt, 0)} {signed(p.correctionFt, 0)} = <b>{formatPlain(p.pressureAltitudeFt, 0)}</b> ft
          </span>
        </div>
      </div>
    </Card>
  );
}

/** Desarrollo paso a paso, como en la resolución manual. */
export function TakeoffEprSteps({ result: r, input, decimals }: { result: TakeoffEprResult; input: TakeoffEprInput; decimals: number }) {
  // el EPR intermedio se muestra con al menos 4 decimales para seguir la interpolación (2,2375)
  const e = (v: number) => formatPlain(v, Math.max(decimals, 4));
  const pa = r.pressure.pressureAltitudeFt;
  const colLabel = (c: number) => (c === 0 ? '−67 a −9 °F (−55 a −23 °C)' : `${EPR_OAT_F[c]} °F (${EPR_OAT_C[c]} °C)`);

  const altLine = (it: AltInterpolation, key: string, col: number) =>
    it.exact ? (
      <div className="calc-line" key={key}>
        <span className="calc-label">Tabla</span>
        <span>
          Fila {it.lo.altFt >= 3856 ? '3856 ft y más' : `${formatPlain(it.lo.altFt, 0)} ft`} · columna {colLabel(col)} → <b>{e(it.value)}</b>
        </span>
      </div>
    ) : (
      <div className="calc-line" key={key}>
        <span className="calc-label">{colLabel(col).split(' (')[0]}</span>
        <span>
          {formatPlain(it.a1, 2)} + ({formatPlain(it.b1, 2)} − {formatPlain(it.a1, 2)})({formatPlain(pa, 0)} − {formatPlain(it.lo.altFt, 0)}) / (
          {formatPlain(it.hi.altFt, 0)} − {formatPlain(it.lo.altFt, 0)}) = <b>{e(it.value)}</b>
        </span>
      </div>
    );

  const engineCard = (title: string, eng: EngineEpr, n: number) => (
    <Card title={`${n}. ${title}`}>
      <div className="stack gap-12">
        {!eng.byColumn[0].exact && (
          <p className="calc-text">
            {formatPlain(pa, 0)} ft está entre las filas de {formatPlain(eng.byColumn[0].lo.altFt, 0)} y{' '}
            {formatPlain(eng.byColumn[0].hi.altFt, 0)} ft: se interpola.
          </p>
        )}
        {eng.byColumn.map((it, i) => altLine(it, `${title}-${i}`, r.columns[i]))}
        {eng.byColumn.length === 2 && (
          <div className="calc-line">
            <span className="calc-label">Entre columnas</span>
            <span>
              {e(eng.byColumn[0].value)} + ({e(eng.byColumn[1].value)} − {e(eng.byColumn[0].value)}) × {formatPlain(r.oatRatio ?? 0, 4)} ={' '}
              <b>{e(eng.table)}</b>
            </span>
          </div>
        )}
        {eng.corrections.length === 0 ? (
          <p className="calc-text">Sin correcciones por sangrado.</p>
        ) : (
          eng.corrections.map((c) => (
            <div className="calc-line" key={c.label}>
              <span className="calc-label">Corrección</span>
              <span>
                {c.label}: <b>{signed(c.value, 2)}</b>
              </span>
            </div>
          ))
        )}
        <div className="calc-line">
          <span className="calc-label">EPR</span>
          <span>
            {e(eng.table)}
            {eng.corrections.map((c) => ` ${signed(c.value, 2)}`).join('')}
            {eng.corrections.length > 0 && <> = {e(eng.corrected)}</>} → <b>{formatPlain(eng.final, EPR_DECIMALS)}</b>
          </span>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="grid grid-2">
      <PressureAltitudeCard result={r.pressure} input={input} n={1} />
      <Card title="2. Temperatura (columna de la tabla)">
        <div className="stack gap-12">
          {input.temperatureUnit === 'C' && (
            <div className="calc-line">
              <span className="calc-label">°C → °F</span>
              <span>
                {formatPlain(input.temperature, 2)} × 9/5 + 32 = <b>{formatPlain(r.oatF, 2)}</b> °F
              </span>
            </div>
          )}
          <p className="calc-text">
            {r.coldRange
              ? `${formatPlain(r.oatF, 1)} °F está en el primer intervalo de la tabla (−67 a −9 °F): su valor es constante.`
              : r.columns.length === 1
                ? `${formatPlain(r.oatF, 1)} °F coincide con la columna ${colLabel(r.columns[0])}: solo se interpola por altitud.`
                : `${formatPlain(r.oatF, 1)} °F está entre las columnas de ${EPR_OAT_F[r.columns[0]]} y ${EPR_OAT_F[r.columns[1]]} °F: se interpola por altitud en cada una y después entre ellas.`}
          </p>
          <p className="calc-text">El peso bruto y los flaps no intervienen en el EPR (sí en V1, VR y V2).</p>
        </div>
      </Card>
      {engineCard('Motores 1 y 3', r.eng13, 3)}
      {engineCard('Motor 2', r.eng2, 4)}
    </div>
  );
}

/* ======================================================================
   Boeing 737: límite por temperatura, límite por presión y el menor
   ====================================================================== */

/** Respuesta del B737: un único EPR de despegue. */
export function B737EprAnswers({ result: r, placeholder, footer }: { result?: B737EprResult; placeholder?: ReactNode; footer?: (key: string) => ReactNode }) {
  return (
    <Card title={<span className="with-help">Respuestas <InfoTip label="EPR">{HELP.epr}</InfoTip></span>}>
      {r ? (
        <>
          <div className="answer-grid">
            <div className="answer">
              <div className="answer-label">a) EPR de despegue</div>
              <div className="answer-value">{formatPlain(r.final, EPR_DECIMALS)}</div>
              {footer?.('a')}
            </div>
            <div className="answer">
              <div className="answer-label">Límite que manda</div>
              <div className="answer-value answer-value-text">{r.governing === 'temp' ? 'Temperatura' : 'Presión'}</div>
            </div>
          </div>
          <p className="calc-note">
            Altitud de presión {formatPlain(r.pressure.pressureAltitudeFt, 0)} ft · OAT {formatPlain(r.oatF, 1)} °F. Se usa el menor de los dos
            límites; EPR con 2 decimales, como en la tabla.
          </p>
        </>
      ) : (
        (placeholder ?? <div className="empty">Completa elevación, reglaje y temperatura.</div>)
      )}
    </Card>
  );
}

/** Desarrollo del B737 con los pasos ①②③ impresos en la tabla. */
export function B737EprSteps({ result: r, input, decimals }: { result: B737EprResult; input: B737EprInput; decimals: number }) {
  const e = (v: number) => formatPlain(v, Math.max(decimals, 4));
  const pa = r.pressure.pressureAltitudeFt;
  const colLabel = (c: number) => `${B737_EPR_OAT_F[c]} °F (${B737_EPR_OAT_C[c]} °C)`;
  // como en la resolución a mano: A es el recuadro más cercano al nivel del mar (S.L. antes que −1000; 2000 antes que 3000)
  const [A, B] = Math.abs(r.press.lo.altFt) <= Math.abs(r.press.hi.altFt) ? [r.press.lo, r.press.hi] : [r.press.hi, r.press.lo];
  const altName = (b: { altFt: number }) => (b.altFt === 0 ? 'S.L.' : b.altFt >= 5660 ? '5660 ft y más' : `${formatPlain(b.altFt, 0)} ft`);
  return (
    <div className="grid grid-2">
      <PressureAltitudeCard result={r.pressure} input={input} n={1} />
      <Card title={<span className="with-help">2. Límite por temperatura (TEMP LIMIT EPR) <InfoTip label="TEMP LIMIT EPR">{HELP.tempLimitEpr}</InfoTip></span>}>
        <div className="stack gap-12">
          {input.temperatureUnit === 'C' && (
            <div className="calc-line">
              <span className="calc-label">°C → °F</span>
              <span>
                {formatPlain(input.temperature, 2)} × 9/5 + 32 = <b>{formatPlain(r.oatF, 2)}</b> °F
              </span>
            </div>
          )}
          {r.temp.columns.length === 1 ? (
            <div className="calc-line">
              <span className="calc-label">Tabla</span>
              <span>
                Columna {colLabel(r.temp.columns[0])} → <b>{e(r.temp.table)}</b>
              </span>
            </div>
          ) : (
            <div className="calc-line">
              <span className="calc-label">Entre columnas</span>
              <span>
                {formatPlain(B737_TEMP_LIMIT_EPR[r.temp.columns[0]], 2)} + ({formatPlain(B737_TEMP_LIMIT_EPR[r.temp.columns[1]], 2)} −{' '}
                {formatPlain(B737_TEMP_LIMIT_EPR[r.temp.columns[0]], 2)})({formatPlain(r.oatF, 2)} − {B737_EPR_OAT_F[r.temp.columns[0]]}) / (
                {B737_EPR_OAT_F[r.temp.columns[1]]} − {B737_EPR_OAT_F[r.temp.columns[0]]}) = <b>{e(r.temp.table)}</b>
              </span>
            </div>
          )}
          <div className="calc-line">
            <span className="calc-label">Aire acond.</span>
            <span>
              {input.airConditioning ? (
                <>ON: sin corrección</>
              ) : (
                <>
                  OFF: {e(r.temp.table)} + 0,03 = <b>{e(r.temp.limit)}</b>
                </>
              )}
            </span>
          </div>
          <p className="calc-text">Antihielo de motores {input.engineAntiIce ? 'ON' : 'OFF'}: corrección cero en el B737.</p>
        </div>
      </Card>
      <Card title={<span className="with-help">3. Límite por presión (PRESS LIMIT EPR) <InfoTip label="PRESS LIMIT EPR">{HELP.pressLimitEpr}</InfoTip></span>}>
        <div className="stack gap-12">
          {r.press.exact ? (
            <div className="calc-line">
              <span className="calc-label">Tabla</span>
              <span>
                Recuadro {altName(r.press.lo)} → <b>{e(r.press.limit)}</b>
              </span>
            </div>
          ) : (
            <>
              <p className="calc-text">
                {formatPlain(pa, 0)} ft está entre los recuadros de {altName(A)} ({formatPlain(A.epr, 2)}) y {altName(B)} ({formatPlain(B.epr, 2)}): se interpola.
              </p>
              <div className="calc-line">
                <span className="calc-label">Interpolar</span>
                <span>
                  {formatPlain(A.epr, 2)} + ({formatPlain(B.epr, 2)} − {formatPlain(A.epr, 2)})({formatPlain(pa, 0)} − {formatPlain(A.altFt, 0)}) / (
                  {formatPlain(B.altFt, 0)} − {formatPlain(A.altFt, 0)}) = <b>{e(r.press.limit)}</b>
                </span>
              </div>
            </>
          )}
        </div>
      </Card>
      <Card title="4. Se usa el menor de los dos límites">
        <div className="stack gap-12">
          <div className="calc-line">
            <span className="calc-label">Menor</span>
            <span>
              temperatura {e(r.temp.limit)} · presión {e(r.press.limit)} → <b>{e(r.epr)}</b>
            </span>
          </div>
          <div className="calc-line">
            <span className="calc-label">EPR</span>
            <span>
              {e(r.epr)} → <b>{formatPlain(r.final, EPR_DECIMALS)}</b>
            </span>
          </div>
          <p className="calc-text">Manda el límite por {r.governing === 'temp' ? 'temperatura' : 'presión'}.</p>
        </div>
      </Card>
    </div>
  );
}
