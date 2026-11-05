import { Info } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

interface Props {
  /** Concepto que explica (p. ej. «FOB» o «°F»): da nombre al botón, «Qué es FOB». */
  label: string;
  /** Explicación breve: una o dos frases. */
  children: ReactNode;
  /**
   * Contenido visible del botón en lugar del icono ⓘ (p. ej. la unidad «°F»).
   * Se muestra subrayado con puntos para indicar que tiene ayuda.
   */
  trigger?: ReactNode;
}

const MARGIN = 8;
const GAP = 6;

/**
 * Ayuda contextual. Funciona con ratón (hover), teclado (foco, Escape) y toque
 * (abre y cierra al tocar). El texto está siempre en el DOM y enlazado con
 * aria-describedby, así que los lectores de pantalla lo anuncian al enfocar.
 * La burbuja se posiciona respecto a la ventana: no la recortan los campos ni
 * las tablas con desplazamiento.
 */
export function InfoTip({ label, children, trigger }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<CSSProperties>();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  // un toque o clic genera foco + clic: el clic no debe cerrar lo que el foco acaba de abrir
  const pointerFocus = useRef(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    // la burbuja es fija en la ventana: al desplazar la página se cierra
    const onScroll = () => setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open]);

  // encima del botón, centrada y dentro de la ventana; debajo si no cabe arriba
  useLayoutEffect(() => {
    if (!open) return setPos(undefined);
    const b = btnRef.current?.getBoundingClientRect();
    const t = tipRef.current?.getBoundingClientRect();
    if (!b || !t || !t.width) return;
    const left = Math.min(Math.max(b.left + b.width / 2 - t.width / 2, MARGIN), window.innerWidth - t.width - MARGIN);
    const above = b.top - t.height - GAP;
    const top = above >= MARGIN ? above : b.bottom + GAP;
    setPos({ left, top });
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
        ref={btnRef}
        className={`infotip-trigger${trigger ? ' is-text' : ''}`}
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
        {trigger ?? <Info size={14} aria-hidden="true" />}
      </button>
      <span
        role="tooltip"
        id={id}
        ref={tipRef}
        className="infotip-bubble"
        // hasta medirla, invisible en su sitio para no parpadear
        style={pos ?? (open ? { visibility: 'hidden', left: 0, top: 0 } : undefined)}
      >
        {children}
      </span>
    </span>
  );
}
