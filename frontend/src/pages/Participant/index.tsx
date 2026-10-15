import LogoLink from "../../components/LogoLink";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import PageLoader from "../../components/Spinner";
import {
  getServidorByDocument,
  getSoldadoByDocument,
  updateServidorField,
  updateSoldadoField,
} from "../../api/adminUsers";
import { LogoutIcon } from "../../assets/icons";
import ServidorProfileForm from "../Profile/ui/ServidorProfileForm";
import SoldadoProfileForm from "../Profile/ui/SoldadoProfileForm";
import ConfirmLogoutModal from "../../components/ConfirmLogoutModal";
import "../Profile/styles.css";

const Participant = () => {
  const { tipo, documento } = useParams<{ tipo: string; documento: string }>();
  const { user, logout } = useAuth();
  const userId = user?.sub;
  const navigate = useNavigate();
  const isSuperadmin = user?.role === "SUPERADMIN";
  const isServidor = tipo === "servidores";

  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const load = () => {
    if (!userId || !documento) return;
    const request = isServidor ? getServidorByDocument : getSoldadoByDocument;
    request(documento)
      .then(setData)
      .catch((error: unknown) =>
        setErrorMsg(error instanceof Error ? error.message : "Error cargando las respuestas")
      );
  };

  useEffect(load, [userId, documento, isServidor]);

  // Enlaces desde el dashboard (p. ej. talla "Otro") traen #campo: se lleva a esa respuesta y se resalta.
  const { hash } = useLocation();
  const hasData = Boolean(data);
  useEffect(() => {
    if (!hasData || !hash) return;
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.classList.add("profileRowHighlight");
  }, [hasData, hash]);

  const fullName = data ? `${String(data.firstNames ?? "")} ${String(data.lastNames ?? "")}`.trim() : "";
  const id = data ? String(data._id) : "";

  return (
    <div className="profilePage">
      <header className="profileHeader">
        <div className="profileHeaderLeft">
          <LogoLink className="profileLogo" />
          <h1>Respuestas del participante</h1>
        </div>
        <div className="profileHeaderRight">
          <button
            className="btnGhost profileDashboardBtn profileDashboardBtnDanger"
            type="button"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
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
        {data && (
          <div className="profileBadgeRow">
            <div className="profileBadge">
              {fullName} · {isServidor ? "Servidor" : "Soldado"} · Doc. {documento}
            </div>
          </div>
        )}

        {errorMsg && <p className="loginError">{errorMsg}</p>}
        {!data && !errorMsg && <PageLoader variant="inline" />}

        {data && isServidor && (
          <ServidorProfileForm
            data={data}
            rowLabel={fullName}
            canEditEmail={isSuperadmin}
            save={(field, value) => updateServidorField(id, field, value).then(() => undefined)}
            onSaved={load}
          />
        )}

        {data && !isServidor && (
          <SoldadoProfileForm
            data={data}
            rowLabel={fullName}
            canEditEmail={isSuperadmin}
            save={(field, value) => updateSoldadoField(id, field, value).then(() => undefined)}
            onSaved={load}
          />
        )}
      </div>

      {showLogoutConfirm && (
        <ConfirmLogoutModal onCancel={() => setShowLogoutConfirm(false)} onConfirm={logout} />
      )}
    </div>
  );
};

export default Participant;
