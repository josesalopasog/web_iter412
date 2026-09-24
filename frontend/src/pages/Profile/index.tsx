import LogoLink from "../../components/LogoLink";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import PageLoader from "../../components/Spinner";
import { getMyServidorProfile, updateMyServidorField } from "../../api/adminUsers";
import { LogoutIcon } from "../../assets/icons";
import ServidorProfileForm from "./ui/ServidorProfileForm";
import ConfirmLogoutModal from "../../components/ConfirmLogoutModal";
import { roleLabel } from "../../auth/roleLabel";
import "./styles.css";

const Profile = () => {
  const { user, logout } = useAuth();
  const userId = user?.sub;
  const navigate = useNavigate();
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN" || user?.role === "TREASURER";
  const isSuperadmin = user?.role === "SUPERADMIN";

  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const loadProfile = () => {
    if (!userId) return;
    getMyServidorProfile()
      .then(setData)
      .catch((error: unknown) =>
        setErrorMsg(error instanceof Error ? error.message : "Error cargando tu perfil")
      );
  };

  useEffect(loadProfile, [userId]);

  return (
    <div className="profilePage">
      <header className="profileHeader">
        <div className="profileHeaderLeft">
          <LogoLink className="profileLogo" />
          <h1>Mi perfil</h1>
        </div>
        <div className="profileHeaderRight">
          {isAdmin && (
            <button
              className="btnGhost profileDashboardBtn profileDashboardBtnDanger"
              type="button"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </button>
          )}
          <button
            className="iconBtn"
            type="button"
            title="Cerrar sesión"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <LogoutIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="profileBody">
        <div className="profileBadgeRow">
          <div className="profileBadge">
            {user?.firstNames} {user?.lastNames} · {roleLabel(user?.role)}
          </div>
          <button
            className="btnGhost profileDashboardBtn"
            type="button"
            onClick={() => navigate("/password")}
          >
            Cambiar contraseña
          </button>
        </div>

        {errorMsg && <p className="loginError">{errorMsg}</p>}

        {!data && !errorMsg && <PageLoader variant="inline" />}

        {data && (
          <ServidorProfileForm
            data={data}
            rowLabel="Mi perfil"
            canEditEmail={isSuperadmin}
            save={(field, value) => updateMyServidorField(field, value).then(() => undefined)}
            onSaved={loadProfile}
          />
        )}
      </div>

      {showLogoutConfirm && (
        <ConfirmLogoutModal onCancel={() => setShowLogoutConfirm(false)} onConfirm={logout} />
      )}
    </div>
  );
};

export default Profile;
