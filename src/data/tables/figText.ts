import type { FigText } from './types';

/** Source text tokens, including nested subscript and superscript markup. */
export type FigToken =
  | { kind: 'text'; text: string }
  | { kind: 'br' }
  | { kind: 'sub' | 'sup'; children: FigToken[] };

/** Tokenize source text; preserve unmatched markup as literal text. */
export function tokenizeFigText(src: FigText): FigToken[] {
  const out: FigToken[] = [];
  let buf = '';
  const flush = () => {
    if (buf) out.push({ kind: 'text', text: buf });
    buf = '';
  };
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === '\n') {
      flush();
      out.push({ kind: 'br' });
      continue;
    }
    if ((ch === '_' || ch === '^') && src[i + 1] === '{') {
      let depth = 0;
      let end = -1;
      for (let j = i + 1; j < src.length; j++) {
        if (src[j] === '{') depth++;
        else if (src[j] === '}' && --depth === 0) {
          end = j;
          break;
        }
      }
      if (end !== -1) {
        flush();
        out.push({ kind: ch === '_' ? 'sub' : 'sup', children: tokenizeFigText(src.slice(i + 2, end)) });
        i = end;
        continue;
      }
    }
    buf += ch;
  }
  flush();
  return out;
}

/** Plain text without markup; line breaks become spaces. */
export function figPlainText(src: FigText): string {
  const walk = (tokens: FigToken[]): string =>
    tokens.map((t) => (t.kind === 'text' ? t.text : t.kind === 'br' ? ' ' : walk(t.children))).join('');
  return walk(tokenizeFigText(src));
}
