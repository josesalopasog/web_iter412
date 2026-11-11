import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import PageLoader from "../../components/Spinner";
import { getMyServidorProfile } from "../../api/adminUsers";
import ProfileMeetingsCard from "./ui/ProfileMeetingsCard";
import ProfileMerch from "./ui/ProfileMerch";
import TestimonyEditor from "./ui/TestimonyEditor";
import ServiceStatusToggle from "./ui/ServiceStatusToggle";
import VoiceForm from "./ui/VoiceForm";
import type { ServiceStatus } from "./ui/ServiceStatusToggle";
import ProfileTopBar from "./ui/ProfileTopBar";
import { useDashboardTheme } from "../Admin/useDashboardTheme";
import { KeyIcon, PencilIcon } from "../Admin/icons";
import GuidedTour from "../../tours/GuidedTour";
import { roleLabel } from "../../auth/roleLabel";
import "../Admin/styles.css";
import "../Admin/dark.css";
import "./styles.css";
import "./modern.css";

// Color de acento del perfil según la disponibilidad: verde activo, gris inactivo, azul Santísimo nocturno.
const STATUS_THEME_CLASS: Record<ServiceStatus, string> = {
  ACTIVO: "theme-activo",
  INACTIVO: "theme-inactivo",
  SANTISIMO_NOCTURNO: "theme-nocturno",
};

const toServiceStatus = (value: unknown): ServiceStatus =>
  value === "INACTIVO" || value === "SANTISIMO_NOCTURNO" ? value : "ACTIVO";

const Profile = () => {
  const { user } = useAuth();
  const userId = user?.sub;
  const navigate = useNavigate();

  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { theme, toggle: toggleTheme } = useDashboardTheme();
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
    <div className={`adminShell profilePage profileModern ${STATUS_THEME_CLASS[serviceStatus]}`}>
      <ProfileTopBar title="Mi perfil" theme={theme} onToggleTheme={toggleTheme} current="perfil" />

      <div className="profileBody">
        <div className="profileHero">
          <span className="profileHeroAvatar">
            {`${user?.firstNames?.[0] ?? ""}${user?.lastNames?.[0] ?? ""}`.toUpperCase()}
          </span>
          <div className="profileHeroText">
            <h1>
              {user?.firstNames} {user?.lastNames}
            </h1>
            <span className="profileHeroRole">{roleLabel(user?.role)}</span>
            <span className="profileHeroActions">
              <button className="toolbarButton" type="button" onClick={() => navigate("/password")} data-tour="password">
                <KeyIcon /> Cambiar contraseña
              </button>
              <button className="toolbarButton primary" type="button" onClick={() => navigate("/profile/editar")} data-tour="edit-profile">
                <PencilIcon /> Editar perfil
              </button>
            </span>
          </div>
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

        {data && <ProfileMeetingsCard />}

        {data && <VoiceForm />}

        {data && <ProfileMerch data={data} onSaved={loadProfile} />}
      </div>

      <GuidedTour tourId="perfil" userId={userId} ready={Boolean(data)} />

    </div>
  );
};

export default Profile;
