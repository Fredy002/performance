import { ArrowLeftRight, Copy } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { NumberField, numberError } from '@/components/ui/NumberField';
import { PageHeader } from '@/components/ui/PageHeader';
import { convert, findQuantity, QUANTITIES } from '@/core/units';
import { formatNumber } from '@/core/format';
import { useFormValues } from '@/hooks/useFormValues';
import { useSettings } from '@/state/settings';
import { showToast } from '@/state/toast';
import { useI18n, type MessageKey } from '@/i18n';

const DEFAULTS = { q: 'altitude', v: '1000', u: 'ft' };

export default function UnitConverter() {
  const { decimals } = useSettings();
  const { locale, t } = useI18n();
  const numberLocale = locale === 'en' ? 'en-US' : 'es-ES';
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
      showToast(t('units.copySuccess', { value: text }));
    } catch {
      showToast(t('units.copyError'), { kind: 'error' });
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={<><ArrowLeftRight size={14} /> {t('units.eyebrow')}</>}
        title={t('units.title')}
        subtitle={t('units.subtitle')}
      />

      <div className="segmented quantity-picker" role="group" aria-label={t('units.quantity')}>
        {QUANTITIES.map((q) => (
          <button key={q.id} aria-pressed={q.id === quantity.id} onClick={() => selectQuantity(q.id)}>
            {t(`units.quantity.${q.id}` as MessageKey)}
          </button>
        ))}
      </div>

      <div className="grid grid-calc">
        <Card title={t('units.sourceValue')}>
          <div className="stack gap-16">
            <NumberField label={t('units.amount')} value={form.values.v} onChange={(v) => form.set('v', v)} unit={from.symbol} autoFocus error={numberError(form.values.v, value, t('help.invalidNumber'))} />
            <div className="field">
              <label className="field-label" htmlFor="unit-from">{t('units.unit')}</label>
              <select id="unit-from" className="select" value={from.id} onChange={(e) => form.set('u', e.target.value)}>
                {quantity.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {t(`units.label.${u.id}` as MessageKey)} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card title={t('units.equivalents')} flush>
          <div className="list after-header">
            {quantity.units
              .filter((u) => u.id !== from.id)
              .map((u) => {
                const out = Number.isFinite(value) ? convert(quantity.id, value, from.id, u.id) : NaN;
                const text = `${formatNumber(out, decimals, numberLocale)} ${u.symbol}`;
                return (
                  <div className="list-item" key={u.id}>
                    <div className="list-item-main">
                      <div className="list-item-sub">{t(`units.label.${u.id}` as MessageKey)}</div>
                      <div className="equiv-value">{text}</div>
                    </div>
                    <button className="btn btn-ghost btn-icon" aria-label={t('units.copy', { label: t(`units.label.${u.id}` as MessageKey) })} onClick={() => copy(text)} disabled={!Number.isFinite(out)}>
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
