import { Mountain } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { NumberField } from '@/components/ui/NumberField';
import { PageHeader } from '@/components/ui/PageHeader';
import { ResultHero } from '@/components/ui/ResultHero';
import { ToolActions } from '@/components/ToolActions';
import { atmosphereReport, TROPOPAUSE_FT } from '@/core/atmosphere';
import { formatNumber } from '@/core/format';
import { useFormValues } from '@/hooks/useFormValues';

const DEFAULTS = { elev: '5000', qnh: '1013', oat: '30' };

export default function DensityAltitude() {
  const form = useFormValues(DEFAULTS);
  const { elev, qnh, oat } = form.numbers;
  const valid = [elev, qnh, oat].every(Number.isFinite) && qnh > 0;
  const r = valid ? atmosphereReport(elev, qnh, oat) : undefined;
  const ft = (v: number) => formatNumber(Math.round(v), 0);

  return (
    <>
      <PageHeader
        eyebrow={<><Mountain size={14} /> Atmósfera</>}
        title="Altitud de densidad"
        subtitle="Calcula la altitud de presión, la desviación respecto a la ISA y la altitud de densidad: la altitud a la que «se siente» el avión."
        actions={
          <ToolActions
            toolId="density-altitude"
            href={form.href}
            canSave={!!r}
            summary={`Elev ${ft(elev)} ft · QNH ${formatNumber(qnh, 1)} hPa · OAT ${formatNumber(oat, 1)} °C`}
            result={r ? `DA ${ft(r.densityAltitude)} ft` : ''}
            onReset={form.reset}
          />
        }
      />

      <div className="grid grid-calc">
        <div className="stack">
          <Card title="Condiciones">
            <div className="stack" style={{ gap: 16 }}>
              <NumberField label="Elevación del aeródromo" value={form.values.elev} onChange={(v) => form.set('elev', v)} unit="ft" />
              <NumberField label="QNH" value={form.values.qnh} onChange={(v) => form.set('qnh', v)} unit="hPa" hint="Estándar: 1013,25 hPa (29,92 inHg)" />
              <NumberField label="Temperatura exterior (OAT)" value={form.values.oat} onChange={(v) => form.set('oat', v)} unit="°C" />
            </div>
          </Card>
          {!valid && <Alert kind="info">Introduce elevación, QNH y temperatura.</Alert>}
          {r && r.pressureAltitude > TROPOPAUSE_FT && (
            <Alert kind="warning">El modelo usado es válido sólo en la troposfera (hasta 36 089 ft).</Alert>
          )}
        </div>

        {r && (
          <div className="stack">
            <ResultHero
              label="Altitud de densidad"
              value={ft(r.densityAltitude)}
              unit="ft"
              meta={[
                { label: 'Regla rápida (120 ft/°C)', value: `${ft(r.densityAltitudeApprox)} ft` },
                { label: 'σ', value: formatNumber(r.densityRatio, 4) },
              ]}
            />
            {r.densityAltitude - r.pressureAltitude > 2000 && (
              <Alert kind="warning">
                Altitud de densidad elevada: espera mayor carrera de despegue, menor régimen de ascenso y menor potencia disponible.
              </Alert>
            )}
            <Card title="Detalle">
              <div className="kv">
                <div className="k">Altitud de presión</div>
                <div className="v">{ft(r.pressureAltitude)} ft</div>
                <div className="k">Temperatura ISA a esa altitud</div>
                <div className="v">{formatNumber(r.isaTemp, 1)} °C</div>
                <div className="k">Desviación ISA</div>
                <div className="v">
                  ISA {r.isaDeviation >= 0 ? '+' : '−'}
                  {formatNumber(Math.abs(r.isaDeviation), 1)} °C
                </div>
                <div className="k">Presión estática</div>
                <div className="v">{formatNumber(r.staticPressure, 1)} hPa</div>
                <div className="k">Densidad relativa (σ)</div>
                <div className="v">{formatNumber(r.densityRatio * 100, 1)} %</div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
