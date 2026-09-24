import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import "./styles.css";

// Mismo umbral que el botón de volver arriba: aparecen juntos al hacer scroll.
const SHOW_AFTER_PX = 480;

type RegisterFabProps = {
  /** Avisa cuando cambia el estado expandido/colapsado, para que otros botones vecinos
   *  (ProfileFab) puedan apartarse mientras este ocupa más espacio. */
  onExpandedChange?: (expanded: boolean) => void;
};

/**
 * Acceso directo flotante a "Quiero Inscribirme": arranca como un círculo con un "+" y, al
 * tocarlo, se expande hacia la izquierda mostrando el texto. Un segundo toque (ya expandido)
 * navega al formulario.
 */
const RegisterFab = ({ onExpandedChange }: RegisterFabProps = {}) => {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpandedState] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);

  const setExpanded = useCallback(
    (next: boolean) => {
      setExpandedState(next);
      onExpandedChange?.(next);
    },
    [onExpandedChange]
  );

  useEffect(() => {
    let ticking = false;

    const check = () => {
      ticking = false;
      const isVisible = window.scrollY > SHOW_AFTER_PX;
      setVisible(isVisible);
      // Si se oculta por scroll, que no reaparezca ya expandido la próxima vez.
      if (!isVisible) setExpanded(false);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(check);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [setExpanded]);

  // Con el botón ya expandido, tocar fuera de él lo vuelve a colapsar.
  useEffect(() => {
    if (!expanded) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!linkRef.current?.contains(e.target as Node)) setExpanded(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [expanded, setExpanded]);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // El primer toque solo expande y revela el texto; ya expandido, el clic navega normal.
    if (!expanded) {
      e.preventDefault();
      setExpanded(true);
    }
  };

  const handleMinimizeClick = (e: MouseEvent<HTMLSpanElement>) => {
    // Evita que el clic también dispare la navegación del <Link> que lo envuelve.
    e.preventDefault();
    e.stopPropagation();
    setExpanded(false);
  };

  return (
    <div className={`registerFab-container${visible ? " is-visible" : ""}`} aria-hidden={!visible}>
      {/* .registerFab-ring: solo envuelve y dibuja el anillo arcoíris (sin overflow:hidden, para
          no recortarlo); se ajusta solo al tamaño de .registerFab, que es quien realmente anima
          su ancho y recorta el texto mientras está colapsado. */}
      <Link
        ref={linkRef}
        to="/inscribirme"
        className={`registerFab-ring${expanded ? " is-expanded" : ""}`}
        aria-label="Quiero inscribirme al retiro"
        aria-expanded={expanded}
        tabIndex={visible ? 0 : -1}
        onClick={handleClick}
      >
        <span className="registerFab">
          <span className="registerFab-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" />
            </svg>
          </span>
          <span className="registerFab-label">Quiero Inscribirme</span>
          {/* Dentro de la píldora, a la derecha: minimiza sin tener que tocar fuera. */}
          <span
            className="registerFab-minimize"
            role="button"
            aria-label="Minimizar"
            tabIndex={expanded ? 0 : -1}
            onClick={handleMinimizeClick}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" />
            </svg>
          </span>
        </span>
      </Link>
    </div>
  );
};

export default RegisterFab;
