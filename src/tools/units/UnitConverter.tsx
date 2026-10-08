import { ArrowLeftRight, Copy } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { NumberField } from '@/components/ui/NumberField';
import { PageHeader } from '@/components/ui/PageHeader';
import { convert, findQuantity, QUANTITIES } from '@/core/units';
import { formatNumber } from '@/core/format';
import { useFormValues } from '@/hooks/useFormValues';
import { useSettings } from '@/state/settings';
import { showToast } from '@/state/toast';

const DEFAULTS = { q: 'altitude', v: '1000', u: 'ft' };

export default function UnitConverter() {
  const { decimals } = useSettings();
  const form = useFormValues(DEFAULTS);
  const quantity = findQuantity(form.values.q) ?? QUANTITIES[0];
  const from = quantity.units.find((u) => u.id === form.values.u) ?? quantity.units[0];
  const value = form.numbers.v;

  const selectQuantity = (id: string) => {
    const q = findQuantity(id) ?? QUANTITIES[0];
    form.load({ q: q.id, u: q.units[0].id });
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Copiado: ${text}`);
    } catch {
      showToast('No se pudo copiar');
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={<><ArrowLeftRight size={14} /> Utilidades</>}
        title="Conversor de unidades"
        subtitle="Conversiones habituales en operaciones aéreas. El resultado se actualiza al escribir."
      />

      <div className="segmented" role="group" aria-label="Magnitud" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
        {QUANTITIES.map((q) => (
          <button key={q.id} aria-pressed={q.id === quantity.id} onClick={() => selectQuantity(q.id)}>
            {q.label}
          </button>
        ))}
      </div>

      <div className="grid grid-calc">
        <Card title="Valor de origen">
          <div className="stack" style={{ gap: 16 }}>
            <NumberField label="Cantidad" value={form.values.v} onChange={(v) => form.set('v', v)} unit={from.symbol} autoFocus />
            <div className="field">
              <label className="field-label" htmlFor="unit-from">Unidad</label>
              <select id="unit-from" className="select" value={from.id} onChange={(e) => form.set('u', e.target.value)}>
                {quantity.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card title="Equivalencias" flush>
          <div className="list" style={{ marginTop: 12 }}>
            {quantity.units
              .filter((u) => u.id !== from.id)
              .map((u) => {
                const out = Number.isFinite(value) ? convert(quantity.id, value, from.id, u.id) : NaN;
                const text = `${formatNumber(out, Math.max(decimals, 2))} ${u.symbol}`;
                return (
                  <div className="list-item" key={u.id}>
                    <div className="list-item-main">
                      <div className="list-item-sub">{u.label}</div>
                      <div className="mono" style={{ fontSize: 22, fontWeight: 700 }}>{text}</div>
                    </div>
                    <button className="btn btn-ghost btn-icon" aria-label={`Copiar ${u.label}`} onClick={() => copy(text)} disabled={!Number.isFinite(out)}>
                      <Copy size={16} />
                    </button>
                  </div>
                );
              })}
          </div>
        </Card>
      </div>
    </>
  );
}
