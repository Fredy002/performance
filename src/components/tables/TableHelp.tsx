import { BookOpen, Lightbulb, ListOrdered, Tags } from 'lucide-react';
import type { TableHelp as Help } from '@/data/tables';
import { Card } from '@/components/ui/Card';

/** Ayuda al usuario: para qué sirve la tabla, cómo usarla, glosario y consejos. */
export function TableHelp({ help }: { help: Help }) {
  return (
    <div className="grid grid-2">
      <div className="stack">
        <Card title={<span className="row" style={{ gap: 8 }}><BookOpen size={17} /> ¿Para qué sirve?</span>}>
          <div className="help-block">
            <p>{help.purpose}</p>
          </div>
        </Card>
        <Card title={<span className="row" style={{ gap: 8 }}><ListOrdered size={17} /> Cómo se usa</span>}>
          <ol className="steps">
            {help.steps.map((s) => (
              <li key={s}>
                <span style={{ fontSize: 14 }}>{s}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
      <div className="stack">
        <Card title={<span className="row" style={{ gap: 8 }}><Tags size={17} /> Glosario</span>}>
          <dl className="glossary">
            {help.glossary.map((g) => (
              <div key={g.term} style={{ display: 'contents' }}>
                <dt>{g.term}</dt>
                <dd>{g.meaning}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <Card title={<span className="row" style={{ gap: 8 }}><Lightbulb size={17} /> Consejos</span>}>
          <div className="help-block">
            <ul>
              {help.tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
