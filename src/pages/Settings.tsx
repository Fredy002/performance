import { Monitor, Moon, Sun } from 'lucide-react';
import { Card } from '@/components/ui/Card';
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
      <PageHeader title="Ajustes" subtitle="Preferencias guardadas en este navegador." />
      <div className="grid grid-2">
        <Card title="Apariencia">
          <div className="segmented" role="group" aria-label="Tema">
            {THEMES.map((t) => (
              <button key={t.id} aria-pressed={theme === t.id} onClick={() => updateSettings({ theme: t.id })}>
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>
        </Card>
        <Card title="Precisión de resultados">
          <div className="row">
            <input
              type="range"
              min={0}
              max={6}
              value={decimals}
              onChange={(e) => updateSettings({ decimals: Number(e.target.value) })}
              aria-label="Número de decimales"
              style={{ flex: 1, accentColor: 'var(--accent)' }}
            />
            <span className="chip chip-accent">{decimals} decimales</span>
          </div>
          <p className="field-hint" style={{ marginTop: 10 }}>
            Vista previa: <span className="mono">{formatNumber(92.0812345, decimals)}</span>
          </p>
        </Card>
      </div>
    </>
  );
}
