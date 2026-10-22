import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { formatPlain } from '@/core/format';
import { useDecimals } from '@/state/settings';
import { FIG67_ABBREVIATED_FLIGHT_PLANNING as F67, windCorrection, type ConditionsTable } from '@/data/tables';


export function ConditionsView({ table }: { table: ConditionsTable }) {
  const decimals = useDecimals();
  // sin separador de miles para que todas las filas se lean igual; decimales de Ajustes
  const lb = (v: number) => formatPlain(v, decimals);
  const min = (v: number) => formatPlain(v, decimals);
  return (
    <div className="stack">
      <Card title="Datos de la tabla" flush>
        <div className="data-table-wrap" style={{ marginTop: 14 }}>
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
                <td>DISTANCE (NM)</td>
                {table.conditions.map((c) => (
                  <td key={c.id}>{c.distanceNm}</td>
                ))}
              </tr>
              <tr>
                <td>AVG WIND COMP (KTS)</td>
                {table.conditions.map((c) => (
                  <td key={c.id} style={{ color: c.wind.kind === 'HW' ? 'var(--result)' : 'var(--success)' }}>
                    {c.wind.speedKt} {c.wind.kind}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Ejemplo resuelto" flush>
        <p className="muted" style={{ padding: '6px 22px 12px', fontSize: 14 }}>
          Resultado de aplicar el procedimiento a cada condición, con los valores de la{' '}
          <Link to={`/tables/${F67.id}`}>{F67.title.toLowerCase()}</Link>.
        </p>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cond.</th>
                <th>TAS</th>
                <th>Tiempo calma</th>
                <th>Δ tiempo</th>
                <th>Tiempo</th>
                <th>Comb. calma</th>
                <th>Δ comb.</th>
                <th>Combustible</th>
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
                    <td style={{ fontWeight: 700 }}>{min(w.timeMin)} min</td>
                    <td>{lb(r.fuelLb)} lb</td>
                    <td>{signed(w.deltaFuelLb, lb)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--result)' }}>{lb(w.fuelLb)} lb</td>
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
