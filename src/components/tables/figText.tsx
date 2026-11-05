import type { ReactNode } from 'react';
import { tokenizeFigText, type FigToken } from '@/data/tables/figText';
import type { FigText as FigTextValue } from '@/data/tables';

function renderTokens(tokens: FigToken[]): ReactNode[] {
  return tokens.map((t, i) => {
    // Preserve repeated source spaces using NBSP after the first space.
    if (t.kind === 'text') return t.text.replace(/ {2,}/g, (m) => ' ' + '\u00a0'.repeat(m.length - 1));
    if (t.kind === 'br') return <br key={i} />;
    const Tag = t.kind;
    return <Tag key={i}>{renderTokens(t.children)}</Tag>;
  });
}

/** Render source markup as React nodes without innerHTML. */
export function FigText({ text }: { text: FigTextValue }) {
  return <>{renderTokens(tokenizeFigText(text))}</>;
}
