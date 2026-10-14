import { Fragment } from 'react';
import { Card } from '@/components/ui/Card';
import { formatNumber } from '@/core/format';
import type { FlightPlanningTable } from '@/data/tables';

// Números tal cual la fuente (sin separador de miles, que es-ES solo aplica desde 5 cifras)
const ft = (v: number) => String(v);

export function FlightPlanningView({ table }: { table: FlightPlanningTable }) {
  const ex = table.windCorrection.example;
  return (
    <div className="grid grid-calc">
      <Card title="Datos de la tabla" flush>
        <div className="row" style={{ padding: '10px 22px 14px', gap: 6 }}>
          {table.profile.map((p) => (
            <span key={p} className="chip">
              {p}
            </span>
          ))}
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Dist. NM</th>
                <th>Rec. alt. ft</th>
                <th>TAS kt</th>
                <th>Air time min</th>
                <th>Fuel lb</th>
              </tr>
            </thead>
            <tbody>
              {table.rows.map((r) => {
                const gap = table.gaps.find((g) => g.afterNm === r.distanceNm);
                return (
                  <Fragment key={r.distanceNm}>
                    <tr>
                      <td>{r.distanceNm}</td>
                      <td>
                        {ft(r.recAltFt[0])}–{ft(r.recAltFt[1])}
                      </td>
                      <td>{r.tasKt}</td>
                      <td>{r.airTimeMin}</td>
                      <td>{ft(r.fuelLb)}</td>
                    </tr>
                    {gap && (
                      <tr className="gap-row">
                        <td colSpan={5}>
                          ═ Filas {gap.afterNm + 10}–{gap.beforeNm - 10} NM omitidas en la fuente ═
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="stack">
        <Card title="Corrección por viento">
          <div className="formula-box">
            {table.windCorrection.formulas.map((f) => (
              <span key={f}>{f}</span>
            ))}
          </div>
          <p className="field-hint" style={{ marginTop: 10, fontWeight: 600 }}>
            {table.windCorrection.rule}
          </p>
          <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>
            Viento de cara (HW): se suma. Viento de cola (TW): se resta.
          </p>
        </Card>
        <Card title={`Ejemplo de la fuente · ${ex.distanceNm} NM`}>
          <div className="kv">
            <div className="k">Tiempo en calma</div>
            <div className="v">{ex.timeMin} min</div>
            <div className="k">Combustible en calma</div>
            <div className="v">{ft(ex.fuelLb)} lb</div>
            <div className="k">Componente de viento</div>
            <div className="v">{ex.windKt} kt</div>
            <div className="k">Δ tiempo = {ex.timeMin} × {ex.windKt} ÷ {ex.tasKt}</div>
            <div className="v">{formatNumber((ex.timeMin * ex.windKt) / ex.tasKt, 1)} min</div>
            <div className="k">Δ combustible = {ft(ex.fuelLb)} × {ex.windKt} ÷ {ex.tasKt}</div>
            <div className="v">≈ {ex.deltaFuelLb} lb</div>
          </div>
        </Card>
        {table.gaps.map((g) => (
          <div key={g.afterNm} className="alert alert-warning" role="note">
            <span>{g.note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
