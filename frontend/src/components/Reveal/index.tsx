import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import "./styles.css";

type RevealProps = {
  children: ReactNode;
  /** Retraso en ms, útil para escalonar elementos consecutivos (p. ej. tarjetas de una grilla). */
  delay?: number;
  /** Clases extra para el div envoltorio (p. ej. "span-4" de una grilla). */
  className?: string;
};

// Fracción del alto de la pantalla a partir de la cual el elemento ya cuenta como visible.
const TRIGGER_LINE = 0.92;

// Un solo listener de scroll/resize compartido por todas las instancias de Reveal, en lugar de
// uno por elemento: en páginas con muchos títulos y tarjetas animados evita decenas de listeners.
const pending = new Set<{ el: HTMLElement; onVisible: () => void }>();
let listenersAttached = false;
let checkScheduled = false;

const checkPending = () => {
  checkScheduled = false;
  for (const entry of pending) {
    if (entry.el.getBoundingClientRect().top >= window.innerHeight * TRIGGER_LINE) continue;
    pending.delete(entry);
    entry.onVisible();
  }
};

const scheduleCheck = () => {
  if (checkScheduled) return;
  checkScheduled = true;
  requestAnimationFrame(checkPending);
};

const ensureListeners = () => {
  if (listenersAttached) return;
  listenersAttached = true;
  window.addEventListener("scroll", scheduleCheck, { passive: true });
  window.addEventListener("resize", scheduleCheck);
};

/**
 * Aparece con fade + leve subida cuando su parte superior entra en pantalla.
 * También aparece si el usuario saltó más allá (ancla, scroll rápido), para no dejarlo oculto.
 */
const Reveal = ({ children, delay = 0, className }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    ensureListeners();
    const entry = { el, onVisible: () => setVisible(true) };
    pending.add(entry);
    // Un frame después para que el layout ya esté calculado (fuentes, imágenes) al comprobar.
    scheduleCheck();

    return () => {
      pending.delete(entry);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={["reveal", visible && "is-visible", className].filter(Boolean).join(" ")}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
};

export default Reveal;
