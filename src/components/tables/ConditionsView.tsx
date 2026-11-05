import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { formatPlain } from '@/core/format';
import { useDecimals } from '@/state/settings';
import { FIG67_ABBREVIATED_FLIGHT_PLANNING as F67, windCorrection, type ConditionsTable } from '@/data/tables';
import { getTableDisplay } from '@/data/tables/localization';
import { useI18n } from '@/i18n';

export function ConditionsView({ table }: { table: ConditionsTable }) {
  const { t, locale } = useI18n();
  const decimals = useDecimals();
  // sin separador de miles para que todas las filas se lean igual; decimales de Ajustes
  const lb = (v: number) => formatPlain(v, decimals);
  const min = (v: number) => formatPlain(v, decimals);
  return (
    <div className="stack">
      <Card title={t('table.tableData')} flush>
        <div className="data-table-wrap after-header" tabIndex={0} role="region" aria-label={t('table.scrollable')}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Operating conditions</th>
                {table.conditions.map((c) => (
                  <th key={c.id}>{c.id}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t('table.distance')}</td>
                {table.conditions.map((c) => (
                  <td key={c.id}>{c.distanceNm}</td>
                ))}
              </tr>
              <tr>
                <td>{t('table.averageWind')}</td>
                {table.conditions.map((c) => (
                  <td key={c.id} className={c.wind.kind === 'HW' ? 'text-result' : 'text-success'}>
                    {c.wind.speedKt} {c.wind.kind}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card title={t('table.solvedExample')} flush>
        <p className="card-inset muted">
          {t('table.solvedExample.intro')}{' '}
          <Link to={`/tables/${F67.id}`}>{getTableDisplay(F67, locale).title.toLowerCase()}</Link>.
        </p>
        <div className="data-table-wrap" tabIndex={0} role="region" aria-label={t('table.scrollable')}>
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('table.condition')}</th>
                <th>TAS</th>
                <th>{t('table.timeCalm')}</th>
                <th>{t('table.deltaTime')}</th>
                <th>{t('table.time')}</th>
                <th>{t('table.fuelCalm')}</th>
                <th>{t('table.deltaFuel')}</th>
                <th>{t('table.fuel')}</th>
              </tr>
            </thead>
            <tbody>
              {table.conditions.map((c) => {
                const r = F67.rows.find((x) => x.distanceNm === c.distanceNm);
                if (!r) return null;
                const w = windCorrection(r.airTimeMin, r.fuelLb, c.wind.speedKt, r.tasKt, c.wind.kind);
                const signed = (v: number, f: (n: number) => string) => `${v >= 0 ? '+' : '−'}${f(Math.abs(v))}`;
                return (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{r.tasKt} kt</td>
                    <td>{r.airTimeMin} min</td>
                    <td>{signed(w.deltaTimeMin, min)}</td>
                    <td className="cell-em">{min(w.timeMin)} min</td>
                    <td>{lb(r.fuelLb)} lb</td>
                    <td>{signed(w.deltaFuelLb, lb)}</td>
                    <td className="text-result">{lb(w.fuelLb)} lb</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
