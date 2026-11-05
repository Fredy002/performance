import { Fragment } from 'react';
import { Card } from '@/components/ui/Card';
import { formatNumber } from '@/core/format';
import type { FlightPlanningTable } from '@/data/tables';
import { useDecimals } from '@/state/settings';
import { useI18n } from '@/i18n';

// Números tal cual la fuente (sin separador de miles, que es-ES solo aplica desde 5 cifras)
const ft = (v: number) => String(v);

export function FlightPlanningView({ table }: { table: FlightPlanningTable }) {
  const { t } = useI18n();
  const decimals = useDecimals();
  const ex = table.windCorrection.example;
  return (
    <div className="grid grid-calc">
      <Card title={t('table.tableData')} flush>
        <div className="row card-inset">
          {table.profile.map((p) => (
            <span key={p} className="chip">
              {p}
            </span>
          ))}
        </div>
        <div className="data-table-wrap" tabIndex={0} role="region" aria-label={t('table.scrollable')}>
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('table.flightDistance')}</th>
                <th>{t('table.recommendedAltitude')}</th>
                <th>{t('table.trueAirspeed')}</th>
                <th>{t('table.airTime')}</th>
                <th>{t('table.fuelPounds')}</th>
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
                          ═ {t('table.omittedRows', { from: gap.afterNm + 10, to: gap.beforeNm - 10 })} ═
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
        <Card title={t('table.windCorrection')}>
          <div className="formula-box">
            {table.windCorrection.formulas.map((f) => (
              <span key={f}>{f}</span>
            ))}
          </div>
          <p className="calc-rule">
            {table.windCorrection.rule}
          </p>
          <p className="calc-note">
            {t('table.headwindTailwind')}
          </p>
        </Card>
        <Card title={t('table.sourceExample', { distance: ex.distanceNm })}>
          <div className="kv">
            <div className="k">{t('table.timeCalmLabel')}</div>
            <div className="v">{ex.timeMin} min</div>
            <div className="k">{t('table.fuelCalmLabel')}</div>
            <div className="v">{ft(ex.fuelLb)} lb</div>
            <div className="k">{t('table.windComponent')}</div>
            <div className="v">{ex.windKt} kt</div>
            <div className="k">Δ tiempo = {ex.timeMin} × {ex.windKt} ÷ {ex.tasKt}</div>
            <div className="v">{formatNumber((ex.timeMin * ex.windKt) / ex.tasKt, decimals)} min</div>
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
