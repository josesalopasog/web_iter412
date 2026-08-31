import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {
  listSoldados,
  listServidores,
  listEliminados,
  updateSoldadoField,
  updateServidorField,
  updateServidorRole,
  deleteSoldado,
  deleteServidor,
  restoreEliminado,
} from "../../api/adminUsers";
import type { SoldadoRecord, ServidorRecord, EliminadoRecord } from "../../api/adminUsers";
import { UserIcon, LogoutIcon } from "../../assets/icons";
import StatsCards from "./ui/StatsCards";
import UsersTable from "./ui/UsersTable";
import EliminadosTable from "./ui/EliminadosTable";
import type { View } from "./ui/ViewDropdown";
import ConfirmLogoutModal from "../../components/ConfirmLogoutModal";
import "./styles.css";

const isMujer = (gender?: string) => gender === "Mujer" || gender === "Femenino";
const isHombre = (gender?: string) => gender === "Hombre" || gender === "Masculino";

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = user?.role === "SUPERADMIN";

  const [view, setView] = useState<View>("soldados");
  const [soldados, setSoldados] = useState<SoldadoRecord[]>([]);
  const [servidores, setServidores] = useState<ServidorRecord[]>([]);
  const [eliminados, setEliminados] = useState<EliminadoRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const fetchAll = async () => {
    if (!token) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [soldadosData, servidoresData] = await Promise.all([
        listSoldados(token),
        listServidores(token),
      ]);
      setSoldados(soldadosData);
      setServidores(servidoresData);
      if (isSuperAdmin) {
        setEliminados(await listEliminados(token));
      }
    } catch (error: unknown) {
      setErrorMsg(error instanceof Error ? error.message : "Error cargando los datos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const soldadoStats = useMemo(() => {
    const total = soldados.length;
    const hombres = soldados.filter((s) => isHombre(s.gender)).length;
    const mujeres = soldados.filter((s) => isMujer(s.gender)).length;
    return { total, hombres, mujeres };
  }, [soldados]);

  const servidorStats = useMemo(() => {
    const total = servidores.length;
    const hombres = servidores.filter((s) => isHombre(s.gender)).length;
    const mujeres = servidores.filter((s) => isMujer(s.gender)).length;
    return { total, hombres, mujeres };
  }, [servidores]);

  const activeStats = view === "soldados" ? soldadoStats : servidorStats;

  const handleEditSoldado = async (id: string, field: string, value: string) => {
    const updated = await updateSoldadoField(token!, id, field, value);
    setSoldados((prev) => prev.map((s) => (s._id === id ? updated : s)));
  };

  const handleEditServidor = async (id: string, field: string, value: string) => {
    const updated = await updateServidorField(token!, id, field, value);
    setServidores((prev) => prev.map((s) => (s._id === id ? updated : s)));
  };

  const handleRoleChange = async (id: string, role: string) => {
    const updated = await updateServidorRole(token!, id, role);
    setServidores((prev) => prev.map((s) => (s._id === id ? updated : s)));
  };

  const handleDeleteSoldado = async (id: string) => {
    await deleteSoldado(token!, id);
    setSoldados((prev) => prev.filter((s) => s._id !== id));
    if (isSuperAdmin) setEliminados(await listEliminados(token!));
  };

  const handleDeleteServidor = async (id: string) => {
    await deleteServidor(token!, id);
    setServidores((prev) => prev.filter((s) => s._id !== id));
    if (isSuperAdmin) setEliminados(await listEliminados(token!));
  };

  const handleRestore = async (id: string) => {
    await restoreEliminado(token!, id);
    await fetchAll();
  };

  return (
    <div className="dashboardPage">
      <header className="dashboardHeader">
        <div className="dashboardHeaderLeft">
          <img src="/logo.png" alt="ITER 4.12" className="dashboardLogo" />
          <div className="dashboardTitle">
            <h1>Dashboard</h1>
          </div>
        </div>

        <div className="dashboardHeaderRight">
          <span className="dashboardUserName">{user?.preferredName}</span>
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
          <p className="emptyState">Cargando datos...</p>
        ) : (
          <>
            {view !== "eliminados" && (
              <StatsCards
                view={view}
                total={activeStats.total}
                hombres={activeStats.hombres}
                mujeres={activeStats.mujeres}
              />
            )}

            {view === "soldados" && (
              <UsersTable
                view="soldados"
                rows={soldados}
                currentUserRole={user?.role ?? ""}
                showEliminados={isSuperAdmin}
                onViewChange={setView}
                onEditField={handleEditSoldado}
                onDelete={handleDeleteSoldado}
              />
            )}

            {view === "servidores" && (
              <UsersTable
                view="servidores"
                rows={servidores}
                currentUserRole={user?.role ?? ""}
                showEliminados={isSuperAdmin}
                onViewChange={setView}
                onEditField={handleEditServidor}
                onDelete={handleDeleteServidor}
                onRoleChange={handleRoleChange}
              />
            )}

            {view === "eliminados" && isSuperAdmin && (
              <EliminadosTable rows={eliminados} onViewChange={setView} onRestore={handleRestore} />
            )}
          </>
        )}
      </div>

      {showLogoutConfirm && (
        <ConfirmLogoutModal onCancel={() => setShowLogoutConfirm(false)} onConfirm={logout} />
      )}
    </div>
  );
};

export default Dashboard;
