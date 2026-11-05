import { Choice } from '@/components/ui/Choice';
import { NumberField, numberError } from '@/components/ui/NumberField';
import { HELP } from '@/content/help';
import { parseNumber } from '@/core/format';
import { formAircraft, type EprFormKey, type EprFormValues } from './eprForm';

const ON_OFF: [string, string][] = [
  ['on', 'ON'],
  ['off', 'OFF'],
];

/** Datos de entrada del EPR de despegue (FIGURE 53 / 81): avión, reglaje, temperatura y sangrados. */
export function TakeoffEprForm({ values: v, set }: { values: EprFormValues; set: (k: EprFormKey, x: string) => void }) {
  const err = (k: EprFormKey) => numberError(v[k], parseNumber(v[k]), HELP.invalidNumber);
  const b737 = formAircraft(v) === 'b737';
  return (
    <div className="grid grid-2 epr-form">
      <Choice wide label="Avión" help={HELP.aircraftEpr} value={formAircraft(v)} onChange={(x) => set('av', x)} options={[['b737', 'Boeing 737'], ['b727', 'Boeing 727']]} />
      <NumberField label="Elevación del campo" unit="ft" value={v.elev} onChange={(x) => set('elev', x)} help={HELP.fieldElevation} error={err('elev')} />
      <span aria-hidden="true" className="desktop-only" />
      <NumberField
        label="Reglaje altimétrico"
        unit={v.qu === 'mb' ? 'mb' : 'in.Hg'}
        value={v.qnh}
        onChange={(x) => set('qnh', x)}
        help={HELP.altimeterSetting}
        error={err('qnh')}
        hint={v.qu === 'mb' ? 'Ejemplo: 1016' : 'Ejemplo: 29.54'}
      />
      <Choice label="Unidad del reglaje" value={v.qu} onChange={(x) => set('qu', x)} options={[['inHg', 'in.Hg (")'], ['mb', 'mb']]} />
      <NumberField label="Temperatura (OAT)" unit={v.tu === 'C' ? '°C' : '°F'} value={v.oat} onChange={(x) => set('oat', x)} help={HELP.takeoffOat} error={err('oat')} hint="Usa el signo menos bajo cero: −5" />
      <Choice label="Unidad de la temperatura" value={v.tu} onChange={(x) => set('tu', x)} options={[['F', '°F'], ['C', '°C']]} />
      {b737 ? (
        <>
          <Choice label="Aire acondicionado" help={HELP.airCondB737} value={v.ac} onChange={(x) => set('ac', x)} options={ON_OFF} />
          <Choice label="Antihielo de motores" help={HELP.antiIceB737} value={v.ai} onChange={(x) => set('ai', x)} options={ON_OFF} />
        </>
      ) : (
        <>
          <Choice label="Aire acondicionado motores 1 y 3" help={HELP.airCondEng13} value={v.ac} onChange={(x) => set('ac', x)} options={ON_OFF} />
          <Choice label="Antihielo motor 2" help={HELP.antiIceEng2} value={v.ai} onChange={(x) => set('ai', x)} options={ON_OFF} />
          <Choice label="Sangrado 6.ª etapa" help={HELP.sixthStage} value={v.b6} onChange={(x) => set('b6', x)} options={ON_OFF} />
        </>
      )}
    </div>
  );
}
