import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { listLogs } from "../../api/adminUsers";
import type { LogRecord } from "../../api/adminUsers";
import { LogoutIcon, UserIcon } from "../../assets/icons";
import ConfirmLogoutModal from "../../components/ConfirmLogoutModal";
import "../Dashboard/styles.css";
import "./styles.css";

const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Logs = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!token) return;
    listLogs(token)
      .then(setLogs)
      .catch((error: unknown) =>
        setErrorMsg(error instanceof Error ? error.message : "Error cargando el registro")
      )
      .finally(() => setIsLoading(false));
  }, [token]);

  return (
    <div className="dashboardPage">
      <header className="dashboardHeader">
        <div className="dashboardHeaderLeft">
          <img src="/logo.png" alt="ITER 4.12" className="dashboardLogo" />
          <div className="dashboardTitle">
            <h1>Registro de actividad</h1>
          </div>
        </div>

        <div className="dashboardHeaderRight">
          <button
            className="btnGhost profileDashboardBtnDanger"
            type="button"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
          <button
            className="iconBtn"
            type="button"
            title="Mi perfil"
            onClick={() => navigate("/profile")}
          >
            <UserIcon className="w-5 h-5" />
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

      <div className="dashboardBody">
        {errorMsg && <p className="loginError">{errorMsg}</p>}

        {isLoading ? (
          <p className="emptyState">Cargando...</p>
        ) : (
          <div className="tableSection">
            <div className="tableSectionHead">
              <span className="tableCount">{logs.length} registros</span>
            </div>

            <div className="tableScroll">
              <table className="dataTable">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Cambio</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td className="emptyState" colSpan={4}>
                        No hay registros de actividad todavía.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log._id}>
                        <td>{log.userName}</td>
                        <td>{log.userRole}</td>
                        <td className="logSummaryCell">{log.summary}</td>
                        <td>{formatDate(log.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showLogoutConfirm && (
        <ConfirmLogoutModal onCancel={() => setShowLogoutConfirm(false)} onConfirm={logout} />
      )}
    </div>
  );
};

export default Logs;
