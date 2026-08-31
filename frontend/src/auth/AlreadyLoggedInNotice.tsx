import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import ConfirmLogoutModal from "../components/ConfirmLogoutModal";
import "../pages/Login/styles.css";

const AlreadyLoggedInNotice = () => {
  const { user, logout } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

  return (
    <div className="loginPage">
      <div className="loginCard">
        <img src="/logo.png" alt="ITER 4.12" className="loginLogo" />
        <h1>Ya iniciaste sesión</h1>
        <p className="loginSub">Primero debes cerrar sesión para continuar.</p>

        <button
          className="btnPrimary"
          type="button"
          style={{ width: "100%" }}
          onClick={() => setShowConfirm(true)}
        >
          Cerrar sesión
        </button>

        <p className="loginBackRow">
          Volver a: <Link to="/profile">Perfil</Link>
          {isAdmin && (
            <>
              <span className="sep">·</span>
              <Link to="/dashboard">Dashboard</Link>
            </>
          )}
        </p>
      </div>

      {showConfirm && (
        <ConfirmLogoutModal onCancel={() => setShowConfirm(false)} onConfirm={logout} />
      )}
    </div>
  );
};

export default AlreadyLoggedInNotice;
