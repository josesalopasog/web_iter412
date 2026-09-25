import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import "./styles.css";

// 20 min sin actividad: cierre automático. Aviso 1min30s antes para poder seguir conectado.
const IDLE_LIMIT_MS = 20 * 60 * 1000;
const WARNING_MS = 90 * 1000;

const ACTIVITY_EVENTS = ["mousedown", "mousemove", "keydown", "touchstart", "scroll", "wheel"] as const;

type Props = {
  children: React.ReactNode;
};

/** Envuelve páginas protegidas: cierra la sesión sola tras un rato sin actividad del usuario. */
const IdleLogoutGuard: React.FC<Props> = ({ children }) => {
  const { idleLogout } = useAuth();
  const lastActivityRef = useRef(0);
  const hasTriggeredRef = useRef(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  const registerActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    lastActivityRef.current = Date.now();
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, registerActivity, { passive: true });
    }
    return () => {
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, registerActivity);
      }
    };
  }, [registerActivity]);

  useEffect(() => {
    const interval = setInterval(() => {
      const idleFor = Date.now() - lastActivityRef.current;

      if (idleFor >= IDLE_LIMIT_MS) {
        if (!hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          setSecondsLeft(null);
          void idleLogout();
        }
        return;
      }

      setSecondsLeft(idleFor >= IDLE_LIMIT_MS - WARNING_MS ? Math.ceil((IDLE_LIMIT_MS - idleFor) / 1000) : null);
    }, 1000);

    return () => clearInterval(interval);
  }, [idleLogout]);

  const stayConnected = () => {
    registerActivity();
    setSecondsLeft(null);
  };

  return (
    <>
      {children}
      {secondsLeft !== null && (
        <div className="idleGuardOverlay" role="alertdialog" aria-modal="true">
          <div className="idleGuardCard">
            <h3>¿Sigues ahí?</h3>
            <p>
              Por seguridad, tu sesión se cerrará en <strong>{secondsLeft}s</strong> por inactividad.
            </p>
            <div className="idleGuardActions">
              <button type="button" className="idleGuardBtnGhost" onClick={() => void idleLogout()}>
                Cerrar sesión
              </button>
              <button type="button" className="idleGuardBtnPrimary" onClick={stayConnected}>
                Seguir conectado
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IdleLogoutGuard;
