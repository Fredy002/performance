import { ChevronDown } from 'lucide-react';
import { forwardRef, type ReactNode } from 'react';

interface Props {
  title: ReactNode;
  /** Resumen a la derecha del título (se ve aunque esté plegada) */
  meta?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

/** Sección plegable: lo secundario queda a un clic sin ocupar la pantalla. */
export const Disclosure = forwardRef<HTMLDetailsElement, Props>(function Disclosure({ title, meta, defaultOpen, children }, ref) {
  return (
    <details className="disclosure" open={defaultOpen} ref={ref}>
      <summary>
        <span className="disclosure-title">{title}</span>
        {meta && <span className="disclosure-meta">{meta}</span>}
        <ChevronDown size={18} className="disclosure-chevron" aria-hidden="true" />
      </summary>
      <div className="disclosure-body">{children}</div>
    </details>
  );
});
