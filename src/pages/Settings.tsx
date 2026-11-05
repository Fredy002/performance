import { Monitor, Moon, Sun } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { InfoTip } from '@/components/ui/InfoTip';
import { HELP } from '@/content/help';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatNumber } from '@/core/format';
import { updateSettings, useSettings, type ThemePref } from '@/state/settings';

const THEMES: { id: ThemePref; label: string; icon: typeof Sun }[] = [
  { id: 'system', label: 'Sistema', icon: Monitor },
  { id: 'light', label: 'Claro', icon: Sun },
  { id: 'dark', label: 'Oscuro', icon: Moon },
];

export default function SettingsPage() {
  const { theme, decimals } = useSettings();
  return (
    <>
      <PageHeader title="Ajustes" subtitle="Preferencias guardadas en este navegador. Se aplican al instante." />
      <div className="grid grid-2">
        <Card title="Apariencia">
          <p className="field-hint settings-label">«Sistema» sigue el modo claro u oscuro de tu dispositivo.</p>
          <div className="segmented" role="group" aria-label="Tema">
            {THEMES.map((t) => (
              <button key={t.id} aria-pressed={theme === t.id} onClick={() => updateSettings({ theme: t.id })}>
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>
        </Card>
        <Card title="Precisión de resultados">
          <span className="field-label-row settings-label">
            <label className="field-label" htmlFor="decimals">
              Decimales en los resultados
            </label>
            <InfoTip label="los decimales">{HELP.decimals}</InfoTip>
          </span>
          <div className="row">
            <input
              id="decimals"
              type="range"
              min={0}
              max={6}
              value={decimals}
              onChange={(e) => updateSettings({ decimals: Number(e.target.value) })}
              aria-valuetext={`${decimals} decimales`}
              className="settings-range"
            />
            <span className="chip chip-accent">{decimals} decimales</span>
          </div>
          <p className="field-hint settings-hint">
            Vista previa: <span className="mono">{formatNumber(92.0812345, decimals)}</span>
          </p>
          <p className="field-hint settings-hint">
            Se aplica a los resultados de las calculadoras, la planificación de combustible, las pruebas y los ejemplos
            resueltos. En combustible cada paso se redondea antes de usarlo en el siguiente, como a mano, así que los
            totales coinciden con la suma de los valores mostrados. Los datos de las tablas se muestran tal cual la fuente y las altitudes en pies enteros.
          </p>
        </Card>
      </div>
    </>
  );
}
