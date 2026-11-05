import { Card } from '@/components/ui/Card';
import { Disclosure } from '@/components/ui/Disclosure';
import { Alert } from '@/components/ui/Alert';
import type { FigBlock, FigCell, FigRow, FigScaleMark, FigureTable } from '@/data/tables';
import { figPlainText } from '@/data/tables/figText';
import { getTableDisplay } from '@/data/tables/localization';
import { useI18n } from '@/i18n';
import { FigText } from './figText';

type TableBlock = Extract<FigBlock, { type: 'table' }>;
type ScaleBlock = Extract<FigBlock, { type: 'scale' }>;
const isBreak = (row: FigRow): row is Exclude<FigRow, FigCell[]> => !Array.isArray(row);

/** Preserve semantic cell coordinates without inheriting the scan's page layout. */
function resolveRows(rows: FigRow[]) {
  const pending: number[] = [];
  let columns = 0;
  const resolved = rows.map(row => {
    if (isBreak(row)) return row;
    let column = 0;
    const cells = row.map(cell => {
      while ((pending[column] ?? 0) > 0) column++;
      const start = column;
      for (let offset = 0; offset < (cell.cs ?? 1); offset++) pending[column + offset] = cell.rs ?? 1;
      column += cell.cs ?? 1;
      return { cell, column: start };
    });
    columns = Math.max(columns, column, pending.length);
    for (let i = 0; i < pending.length; i++) if (pending[i] > 0) pending[i]--;
    return cells;
  });
  return { resolved, columns };
}

/** Rowspans cannot cross a thead/tbody boundary. */
function headerLength(rows: FigRow[], requested: number) {
  let length = requested;
  for (let row = 0; row < length; row++) {
    const cells = rows[row];
    if (Array.isArray(cells)) for (const cell of cells) length = Math.max(length, row + (cell.rs ?? 1));
  }
  return Math.min(rows.length, length);
}

function tableTitle(block: TableBlock, table: FigureTable, t: ReturnType<typeof useI18n>['t'], displayTitle: string) {
  const text = block.rows.flatMap(row => Array.isArray(row) ? row.map(cell => figPlainText(cell.t)) : []).join(' ').toUpperCase();
  if (text.includes('OPERATING CONDITIONS')) return t('table.exerciseConditions');
  if (text.includes('QNH')) return t('table.qnhPressureAltitude');
  if (text.includes('BRAKE RELEASE') || text.includes('MIN/LB') || text.includes('MIM/LB')) return t('table.climbTimeFuelDistanceTas');
  if (text.includes('V1') && text.includes('GROSS')) return t('table.takeoffSpeeds');
  if (text.includes('UNITS AIRPLANE NOSE UP') || text.includes('FLAPS ALL')) return t('table.stabilizerTrim');
  if (text.includes('FLAP POSITION') || text.includes('KTS IAS')) return t('table.flapRetractionManeuver');
  if (text.includes('V1ADJUSTMENTS')) return t('table.v1WindSlopeCorrections');
  if (text.includes('ANTI-SKID') && !text.includes('GROSS')) return t('table.takeoffSpeedConditions');
  if (text.includes('BLEED CORRECTIONS')) return t('table.bleedCorrections');
  if (text.includes('TEMP') && text.includes('EPR')) return t('table.takeoffEpr');
  if (text.includes('ENG 1') || text.includes('AIRBLEED')) return t('table.engineConfiguration');
  if (text.includes('ELEVATION') || text.includes('FEET')) return t('table.elevationAdjustment');
  return displayTitle || table.title;
}

function TableContent({ block, title }: { block: TableBlock; title: string }) {
  const { t } = useI18n();
  // The scan connects independent pressure limits to temperature columns with arrows.
  // Separate those axes so print positions cannot be mistaken for a numeric relation.
  if (block.rows.some(row => Array.isArray(row) && row.some(cell => cell.pointer))) {
    const rows = block.rows.filter((row): row is FigCell[] => Array.isArray(row));
    const pressure = rows.flat().filter(cell => cell.pointer).map(cell => {
      const [epr, altitude] = cell.t.split('\n');
      return [{ t: altitude.replace(/^ALT\s+/, '') }, { t: epr }];
    });
    const temperature: FigRow[] = [[{ t: 'OAT °F', h: true }, { t: 'OAT °C', h: true }, { t: t('table.maxEprByTemperature'), h: true }]];
    const fahrenheit = rows[0].slice(2);
    const celsius = rows[1].slice(1);
    const limits = rows[2].slice(1);
    fahrenheit.forEach((cell, index) => temperature.push([{ t: cell.t }, { t: celsius[index].t }, { t: limits[index].t }]));
    return <div className="grid grid-2 fig-epr-grid">
      <TableContent title={t('table.temperatureEprLimit')} block={{ type: 'table', headerRows: 1, rows: temperature }} />
      <TableContent title={t('table.pressureAltitudeEprLimit')} block={{ type: 'table', headerRows: 1, rows: [[{ t: t('table.pressureAltitudeFt'), h: true }, { t: t('table.maximumEpr'), h: true }], ...pressure] }} />
    </div>;
  }
  const { resolved, columns } = resolveRows(block.rows);
  const headers = headerLength(block.rows, block.headerRows ?? 0);
  const renderRows = (from: number, to: number) => resolved.slice(from, to).map((row, index) => {
    const originalRow = block.rows[from + index];
    if (!Array.isArray(row)) return <tr key={index} className="fig-break"><td colSpan={columns}>{t('table.sourceOmittedIntermediateRows')}</td></tr>;
    if (Array.isArray(originalRow) && originalRow.every(cell => !cell.t.trim())) return null;
    return <tr key={index}>{row.map(({ cell, column }, cellIndex) => {
      const header = from + index < headers || cell.h;
      const rowHeading = column === 0 && !cell.bare;
      const Tag = header || rowHeading ? 'th' : 'td';
      const classes = [rowHeading ? 'fig-row-heading' : '', cell.shaded ? 'fig-shaded' : '', figPlainText(cell.t).length > 45 ? 'fig-wrap' : ''].filter(Boolean).join(' ');
      return <Tag key={cellIndex} colSpan={cell.cs} rowSpan={cell.rs} className={classes || undefined}
        scope={header ? (cell.cs && cell.cs > 1 ? 'colgroup' : 'col') : rowHeading ? (cell.rs && cell.rs > 1 ? 'rowgroup' : 'row') : undefined}>
        <FigText text={header ? cell.t.replace(/\n/g, ' ') : cell.t} />
      </Tag>;
    })}</tr>;
  });
  return <Card title={title} flush>
    <div className="data-table-wrap fig-table-wrap after-header" tabIndex={0} role="region" aria-label={t('table.figureShift', { title })}>
      <table className="data-table fig-table" aria-label={title}>
        {headers > 0 && <thead>{renderRows(0, headers)}</thead>}
        <tbody>{renderRows(headers, resolved.length)}</tbody>
      </table>
    </div>
  </Card>;
}

function ScaleLabels({ marks, side }: { marks: FigScaleMark[]; side: 'left' | 'right' }) {
  return <div className={`fig-scale-labels is-${side}`}>{marks.map((mark, index) =>
    <span key={index} className="fig-scale-label" style={{ top: `${mark.pos * 100}%` }}><FigText text={mark.label} /></span>,
  )}</div>;
}

function Scale({ block }: { block: ScaleBlock }) {
  const { t } = useI18n();
  return <Card title={t('table.stationPressureAltitude')}>
    <div className="fig-scale">
      <p className="calc-text"><FigText text={block.title.replace(/\n/g, ' ')} /></p>
      <div className="fig-scale-units"><span><FigText text={block.leftUnit} /></span><span><FigText text={block.rightUnit} /></span></div>
      <div className="fig-scale-body">
        <ScaleLabels marks={block.left} side="left" />
        <div className="fig-scale-rule">
          {Array.from({ length: block.minorTicks + 1 }, (_, index) => <span key={index} className="fig-tick is-minor" style={{ top: `${index / Math.max(1, block.minorTicks) * 100}%` }} />)}
          {block.left.map((mark, index) => <span key={`l${index}`} className="fig-tick is-left" style={{ top: `${mark.pos * 100}%` }} />)}
          {block.right.map((mark, index) => <span key={`r${index}`} className="fig-tick is-right" style={{ top: `${mark.pos * 100}%` }} />)}
        </div>
        <ScaleLabels marks={block.right} side="right" />
      </div>
    </div>
  </Card>;
}

/** Source columns and spacers describe print layout, not the application's reading flow. */
function flatten(blocks: FigBlock[]): Exclude<FigBlock, { type: 'columns' | 'spacer' }>[] {
  return blocks.flatMap(block => block.type === 'columns' ? block.columns.flatMap(flatten) : block.type === 'spacer' ? [] : [block]);
}

export function FigureView({ table }: { table: FigureTable }) {
  const { t, locale } = useI18n();
  const display = getTableDisplay(table, locale);
  return <div className="stack figure-view">
    {table.cautions?.map(caution => <Alert key={caution} kind="warning">{caution}</Alert>)}
    {table.sheets.map((sheet, sheetIndex) => <figure key={sheetIndex} className="fig-sheet">
      <div className="fig-flow">{flatten(sheet.blocks).map((block, index) => {
        switch (block.type) {
          case 'table': return <TableContent key={index} block={block} title={tableTitle(block, table, t, display.title)} />;
          case 'scale': return <Scale key={index} block={block} />;
          case 'heading': return <h3 key={index} className="fig-heading"><FigText text={block.text.replace(/\n/g, ' ')} /></h3>;
          case 'text': return <p key={index} className={block.boxed ? 'fig-note' : 'fig-text'}><FigText text={block.text.replace(/\n/g, ' ')} /></p>;
          case 'list': return <ol key={index} className="fig-list">{block.items.map((item, itemIndex) => <li key={itemIndex}><FigText text={item.text.replace(/\n/g, ' ')} /></li>)}</ol>;
        }
      })}</div>
      <figcaption className="fig-caption"><FigText text={sheet.caption} /></figcaption>
    </figure>)}
    {!!table.uncertain?.length && <Disclosure title={t('table.sourceObservations')} meta={t('table.figureNotes', { count: table.uncertain.length })}>
      <div className="help-block"><ul>{table.uncertain.map(note => <li key={note}>{note}</li>)}</ul></div>
    </Disclosure>}
  </div>;
}
