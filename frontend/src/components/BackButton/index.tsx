import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getPreviousPath } from "./navHistory";
import "./styles.css";

// Mismo umbral que usa BackToTop para aparecer: así sabemos si realmente está en pantalla.
const UP_BUTTON_SHOW_AFTER_PX = 480;

type BackButtonProps = {
  /** true en páginas que también pueden mostrar el botón de "volver arriba" (Layout: inscribirme,
   *  servidores). Mientras ese botón no haya aparecido (aún no se baja lo suficiente), este ocupa
   *  su lugar (la esquina, a la derecha); en cuanto aparece, se corre a su izquierda para cederlo. */
  besideUpButton?: boolean;
};

/** Botón circular flotante para volver a la página anterior. Se usa en todas las páginas salvo Home. */
const BackButton = ({ besideUpButton = false }: BackButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [upButtonVisible, setUpButtonVisible] = useState(false);

  useEffect(() => {
    if (!besideUpButton) return;

    let ticking = false;
    const check = () => {
      ticking = false;
      setUpButtonVisible(window.scrollY > UP_BUTTON_SHOW_AFTER_PX);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(check);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [besideUpButton]);

  // Vuelve literalmente a la ruta anterior (p. ej. /profile → /dashboard). Si se entró directo a
  // esta página no hay anterior: las respuestas del participante se abren desde el dashboard en
  // otra pestaña, así que vuelven ahí; el resto va al inicio.
  const handleClick = () => {
    const previous = getPreviousPath();
    if (previous) navigate(previous);
    else navigate(location.pathname.startsWith("/participante/") ? "/dashboard" : "/");
  };

  const showBeside = besideUpButton && upButtonVisible;

  return (
    <div className={`backButton-container${showBeside ? " beside-up-button" : ""}`}>
      <button
        type="button"
        className="backButton"
        onClick={handleClick}
        aria-label="Volver a la página anterior"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M19 12H5M5 12l6-6M5 12l6 6"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default BackButton;
