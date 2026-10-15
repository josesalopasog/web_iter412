import { useEffect, useState } from "react";

type Props = {
  value: number;
  /** Cuántas inscripciones nuevas incluye `value` (las que aún no se habían visto). */
  added: number;
};

// Momento en que el número pasa al total nuevo: cuando el "+N" ya se está desvaneciendo
// (ver .statValueAdded en styles.css: arranca a los 0.4s, dura 1.6s y se desvanece desde ~1.55s).
const SWAP_MS = 1750;

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Número de una tarjeta de estadísticas. Si hay inscripciones nuevas, primero muestra el total
 * anterior, aparece "+N" encima con un fade-zoom-in y luego el número se actualiza.
 */
const StatValue: React.FC<Props> = ({ value, added }) => {
  const [settled, setSettled] = useState(() => added <= 0 || prefersReducedMotion());

  useEffect(() => {
    if (settled) return;
    const timer = window.setTimeout(() => setSettled(true), SWAP_MS);
    return () => window.clearTimeout(timer);
  }, [settled]);

  const animating = added > 0 && !prefersReducedMotion();

  return (
    <div className={["statValue", animating && "hasAdded", animating && settled && "settled"].filter(Boolean).join(" ")}>
      <span key={settled ? "new" : "old"} className="statValueNumber">
        {settled ? value : value - added}
      </span>
      {animating && (
        <span className="statValueAdded" aria-hidden="true">
          +{added}
        </span>
      )}
    </div>
  );
};

export default StatValue;
