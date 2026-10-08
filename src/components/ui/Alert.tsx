import { Info, TriangleAlert, CircleX } from 'lucide-react';
import type { ReactNode } from 'react';

const ICONS = { info: Info, warning: TriangleAlert, error: CircleX };

export function Alert({ kind = 'info', children }: { kind?: keyof typeof ICONS; children: ReactNode }) {
  const Icon = ICONS[kind];
  return (
    <div className={`alert alert-${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      <Icon size={18} />
      <div>{children}</div>
    </div>
  );
}
