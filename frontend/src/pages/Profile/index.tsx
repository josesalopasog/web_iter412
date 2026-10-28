import LogoLink from "../../components/LogoLink";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import PageLoader from "../../components/Spinner";
import { getMyServidorProfile, updateMyServidorField } from "../../api/adminUsers";
import { LogoutIcon } from "../../assets/icons";
import ServidorProfileForm from "./ui/ServidorProfileForm";
import TestimonyEditor from "./ui/TestimonyEditor";
import ServiceStatusToggle from "./ui/ServiceStatusToggle";
import type { ServiceStatus } from "./ui/ServiceStatusToggle";
import NotificationsBell from "./ui/NotificationsBell";
import ConfirmLogoutModal from "../../components/ConfirmLogoutModal";
import GuidedTour from "../../tours/GuidedTour";
import { roleLabel } from "../../auth/roleLabel";
import "./styles.css";

// Color de acento del perfil según la disponibilidad: verde activo, gris inactivo, azul Santísimo nocturno.
const STATUS_THEME_CLASS: Record<ServiceStatus, string> = {
  ACTIVO: "theme-activo",
  INACTIVO: "theme-inactivo",
  SANTISIMO_NOCTURNO: "theme-nocturno",
};

const toServiceStatus = (value: unknown): ServiceStatus =>
  value === "INACTIVO" || value === "SANTISIMO_NOCTURNO" ? value : "ACTIVO";

const Profile = () => {
  const { user, logout } = useAuth();
  const userId = user?.sub;
  const navigate = useNavigate();
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN" || user?.role === "TREASURER";
  const isSuperadmin = user?.role === "SUPERADMIN";

  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>("ACTIVO");

  const loadProfile = () => {
    if (!userId) return;
    getMyServidorProfile()
      .then((profile) => {
        setData(profile);
        setServiceStatus(toServiceStatus(profile.serviceStatus));
      })
      .catch((error: unknown) =>
        setErrorMsg(error instanceof Error ? error.message : "Error cargando tu perfil")
      );
  };

  useEffect(loadProfile, [userId]);

  return (
    <div className={`profilePage ${STATUS_THEME_CLASS[serviceStatus]}`}>
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
              data-tour="dashboard"
            >
              Dashboard
            </button>
          )}
          <NotificationsBell userId={userId} />
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
            data-tour="password"
          >
            Cambiar contraseña
          </button>
        </div>

        {errorMsg && <p className="loginError">{errorMsg}</p>}

        {!data && !errorMsg && <PageLoader variant="inline" />}

        {data && (
          <ServiceStatusToggle value={serviceStatus} onChange={setServiceStatus} onSaved={loadProfile} />
        )}

        {data && (
          <TestimonyEditor
            initialValue={typeof data.testimony === "string" ? data.testimony : ""}
            onSaved={loadProfile}
          />
        )}

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

      <GuidedTour tourId="perfil" userId={userId} ready={Boolean(data)} />

      {showLogoutConfirm && (
        <ConfirmLogoutModal onCancel={() => setShowLogoutConfirm(false)} onConfirm={logout} />
      )}
    </div>
  );
};

export default Profile;
