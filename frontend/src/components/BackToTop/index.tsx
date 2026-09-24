import { useEffect, useState } from "react";
import "./styles.css";

// Cuánto hay que bajar (en píxeles) antes de que aparezca el botón.
const SHOW_AFTER_PX = 480;

/** Botón circular flotante para volver al principio de la página en Home y los formularios largos. */
const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const check = () => {
      ticking = false;
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(check);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <div className={`backToTop-container${visible ? " is-visible" : ""}`}>
      <button
        type="button"
        className="backToTop"
        onClick={scrollToTop}
        aria-label="Volver al inicio de la página"
        aria-hidden={!visible}
        tabIndex={visible ? 0 : -1}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 19V5M12 5L6 11M12 5L18 11"
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

export default BackToTop;
