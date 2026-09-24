import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import "./styles.css";

// Mismo umbral que usan RegisterFab/BackToTop para aparecer en Home.
const RIGHT_CLUSTER_SHOW_AFTER_PX = 480;

type ProfileFabProps = {
  /** true mientras "Quiero Inscribirme" está expandido (mostrando el texto): en vez de intentar
   *  calcularle un hueco a un ancho de texto variable, este botón se aparta un momento. */
  yieldToRegister?: boolean;
};

/**
 * Botón circular flotante para ir a "Mi perfil". Solo se muestra en Home y solo si ya hay una
 * sesión iniciada (para quien entra ya logueado, sin tener que buscar cómo volver a su cuenta).
 * Va del lado derecho, igual que BackButton en el resto de páginas: ocupa la esquina mientras
 * "Quiero Inscribirme"/"volver arriba" no hayan aparecido, y se corre a su izquierda en cuanto
 * aparecen (tras bajar el scroll), para no superponerse.
 */
const ProfileFab = ({ yieldToRegister = false }: ProfileFabProps) => {
  const { user } = useAuth();
  const [rightClusterVisible, setRightClusterVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const check = () => {
      ticking = false;
      setRightClusterVisible(window.scrollY > RIGHT_CLUSTER_SHOW_AFTER_PX);
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

  if (!user) return null;

  const classes = [
    "profileFab-container",
    rightClusterVisible && "beside-right-cluster",
    yieldToRegister && "is-yielding",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} aria-hidden={yieldToRegister}>
      <Link
        to="/profile"
        className="profileFab"
        aria-label="Ir a mi perfil"
        tabIndex={yieldToRegister ? -1 : 0}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="8.2" r="3.4" stroke="currentColor" strokeWidth={2.1} />
          <path
            d="M5 19.5c0-3.8 3.13-6.2 7-6.2s7 2.4 7 6.2"
            stroke="currentColor"
            strokeWidth={2.1}
            strokeLinecap="round"
          />
        </svg>
      </Link>
    </div>
  );
};

export default ProfileFab;
