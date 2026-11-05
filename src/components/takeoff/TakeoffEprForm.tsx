import { Choice } from '@/components/ui/Choice';
import { NumberField, numberError } from '@/components/ui/NumberField';
import { parseNumber } from '@/core/format';
import { formAircraft, type EprFormKey, type EprFormValues } from './eprForm';
import { useI18n } from '@/i18n';

const ON_OFF: [string, string][] = [
  ['on', 'ON'],
  ['off', 'OFF'],
];

/** Datos de entrada del EPR de despegue (FIGURE 53 / 81): avión, reglaje, temperatura y sangrados. */
export function TakeoffEprForm({ values: v, set }: { values: EprFormValues; set: (k: EprFormKey, x: string) => void }) {
  const { t } = useI18n();
  const err = (k: EprFormKey) => numberError(v[k], parseNumber(v[k]), t('help.invalidNumber'));
  const b737 = formAircraft(v) === 'b737';
  return (
    <div className="grid grid-2 epr-form">
      <Choice wide label={t('takeoffForm.aircraft')} help={t('help.aircraftEpr')} value={formAircraft(v)} onChange={(x) => set('av', x)} options={[['b737', 'Boeing 737'], ['b727', 'Boeing 727']]} />
      <NumberField label={t('takeoffForm.fieldElevation')} unit="ft" value={v.elev} onChange={(x) => set('elev', x)} help={t('help.fieldElevation')} error={err('elev')} />
      <span aria-hidden="true" className="desktop-only" />
      <NumberField
        label={t('takeoffForm.altimeter')}
        unit={v.qu === 'mb' ? 'mb' : 'in.Hg'}
        value={v.qnh}
        onChange={(x) => set('qnh', x)}
        help={t('help.altimeterSetting')}
        error={err('qnh')}
        hint={v.qu === 'mb' ? t('takeoffForm.exampleMb') : t('takeoffForm.exampleInHg')}
      />
      <Choice label={t('takeoffForm.altimeterUnit')} value={v.qu} onChange={(x) => set('qu', x)} options={[['inHg', 'in.Hg (")'], ['mb', 'mb']]} />
      <NumberField label={t('takeoffForm.oat')} unit={v.tu === 'C' ? '°C' : '°F'} value={v.oat} onChange={(x) => set('oat', x)} help={t('help.takeoffOat')} error={err('oat')} hint={t('takeoffForm.tempHint')} />
      <Choice label={t('takeoffForm.temperatureUnit')} value={v.tu} onChange={(x) => set('tu', x)} options={[['F', '°F'], ['C', '°C']]} />
      {b737 ? (
        <>
          <Choice label={t('takeoffForm.airConditioning')} help={t('help.airCondB737')} value={v.ac} onChange={(x) => set('ac', x)} options={ON_OFF} />
          <Choice label={t('takeoffForm.antiIceEngines')} help={t('help.antiIceB737')} value={v.ai} onChange={(x) => set('ai', x)} options={ON_OFF} />
        </>
      ) : (
        <>
          <Choice label={t('takeoffForm.airConditioning13')} help={t('help.airCondEng13')} value={v.ac} onChange={(x) => set('ac', x)} options={ON_OFF} />
          <Choice label={t('takeoffForm.antiIce2')} help={t('help.antiIceEng2')} value={v.ai} onChange={(x) => set('ai', x)} options={ON_OFF} />
          <Choice label={t('takeoffForm.sixthStage')} help={t('help.sixthStage')} value={v.b6} onChange={(x) => set('b6', x)} options={ON_OFF} />
        </>
      )}
    </div>
  );
}
