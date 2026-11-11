import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import ConfirmLogoutModal from "../../../components/ConfirmLogoutModal";
import ThemeToggle from "../../Admin/ThemeToggle";
import type { Theme } from "../../Admin/useDashboardTheme";
import { LogoutIcon, SquaresIcon, UserCircleIcon } from "../../Admin/icons";
import NotificationsBell from "./NotificationsBell";

type Props = {
  title: string;
  theme: Theme;
  onToggleTheme: () => void;
  /** Fuera del perfil (reuniones, editar perfil) aparece el botón para volver al perfil. */
  current: "perfil" | "reuniones" | "editar";
};

// Barra superior del perfil con el estilo del dashboard: reuniones, tema, notificaciones,
// dashboard (admins) y cerrar sesión.
const ProfileTopBar = ({ title, theme, onToggleTheme, current }: Props) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN" || user?.role === "TREASURER";

  return (
    <div className="adTopBar profileTopBar">
      <Link to="/" className="adBrand" aria-label="Ir a la página principal">
        <img src="/logo.png" alt="ITER 4.12" className="adBrandLogo" />
        <span className="adBrandText">
          <span className="adBrandName">Iter 4.12</span>
          <span className="adBrandSubtitle">{title}</span>
        </span>
      </Link>
      <div className="adTopBarRight">
        {current !== "perfil" && (
          <button type="button" className="adIconButton" title="Mi perfil" aria-label="Mi perfil" onClick={() => navigate("/profile")}>
            <UserCircleIcon />
          </button>
        )}
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <NotificationsBell userId={user?.sub} />
        {isAdmin && (
          <button type="button" className="adProfileButton" onClick={() => navigate("/dashboard")} title="Ir al dashboard" data-tour="dashboard">
            <span className="adAvatar">
              <SquaresIcon />
            </span>
            <span className="adProfileText">
              <span className="adProfileName">Dashboard</span>
              <span className="adProfileRole">Administración</span>
            </span>
          </button>
        )}
        <button type="button" className="adIconButton" title="Cerrar sesión" aria-label="Cerrar sesión" onClick={() => setShowLogout(true)}>
          <LogoutIcon />
        </button>
      </div>
      {showLogout && <ConfirmLogoutModal onCancel={() => setShowLogout(false)} onConfirm={logout} />}
    </div>
  );
};

export default ProfileTopBar;
