import { Info } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

interface Props {
  /** Concepto que explica (p. ej. «FOB»): da nombre al botón, «Qué es FOB». */
  label: string;
  /** Explicación breve: una o dos frases. */
  children: ReactNode;
}

/**
 * Ayuda contextual. Funciona con ratón (hover), teclado (foco, Escape) y toque
 * (abre y cierra al tocar). El texto está siempre en el DOM y enlazado con
 * aria-describedby, así que los lectores de pantalla lo anuncian al enfocar.
 */
export function InfoTip({ label, children }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState(0);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  // un toque o clic genera foco + clic: el clic no debe cerrar lo que el foco acaba de abrir
  const pointerFocus = useRef(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  // mantiene la burbuja dentro de la ventana en pantallas estrechas
  useLayoutEffect(() => {
    if (!open) return setShift(0);
    const r = tipRef.current?.getBoundingClientRect();
    if (!r || !r.width) return;
    const margin = 8;
    const max = window.innerWidth - margin;
    if (r.right > max) setShift(max - r.right);
    else if (r.left < margin) setShift(margin - r.left);
  }, [open]);

  return (
    <span
      className={`infotip${open ? ' is-open' : ''}`}
      ref={wrapRef}
      // hover solo con ratón: en táctil el navegador emite un «mouseout» tras el toque y cerraría la burbuja
      onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(false)}
    >
      <button
        type="button"
        className="infotip-trigger"
        aria-label={`Qué es ${label}`}
        aria-describedby={id}
        aria-expanded={open}
        onPointerDown={() => {
          // cerrada al tocar → el clic la deja abierta (aunque el foco ya la haya abierto);
          // abierta al tocar → el clic la cierra. Funciona igual en Safari, que no enfoca botones al tocarlos.
          pointerFocus.current = !open;
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (pointerFocus.current) {
            pointerFocus.current = false;
            setOpen(true);
          } else setOpen((o) => !o);
        }}
      >
        <Info size={14} aria-hidden="true" />
      </button>
      <span
        role="tooltip"
        id={id}
        ref={tipRef}
        className="infotip-bubble"
        style={shift ? { translate: `${shift}px 0` } : undefined}
      >
        {children}
      </span>
    </span>
  );
}
