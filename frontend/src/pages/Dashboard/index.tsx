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
  resetServidorMerch,
  restoreEliminado,
} from "../../api/adminUsers";
import type { SoldadoRecord, ServidorRecord, EliminadoRecord } from "../../api/adminUsers";
import { getSettings } from "../../api/settings";
import type { AppSettings } from "../../api/settings";
import { UserIcon, LogoutIcon, LogsIcon } from "../../assets/icons";
import StatsCards from "./ui/StatsCards";
import SettingsModal from "./ui/SettingsModal";
import UsersTable from "./ui/UsersTable";
import EliminadosTable from "./ui/EliminadosTable";
import PedidoTable from "./ui/PedidoTable";
import type { View } from "./ui/ViewDropdown";
import ConfirmLogoutModal from "../../components/ConfirmLogoutModal";
import "./styles.css";

const DEFAULT_SETTINGS: AppSettings = {
  soldadoPrice: 435000,
  servidorPrice: 300000,
  fridayDate: 13,
  saturdayDate: 14,
  sundayDate: 15,
  retreatMonth: 11,
  retreatYear: 2026,
  advanceStartDay: 1,
  advanceEndDay: 15,
  advanceMonth: 10,
  finalPaymentStartDay: 1,
  finalPaymentEndDay: 7,
  finalPaymentMonth: 11,
  subsidyCap: 100000,
  shirtPrice: 27000,
  busoChaquetaPrice: 52000,
  canguroPrice: 29000,
  tulaPrice: 7000,
  cachuchaPrice: 16000,
  extraSizePrice: 4000,
};

const isMujer = (gender?: string) => gender === "Mujer" || gender === "Femenino";
const isHombre = (gender?: string) => gender === "Hombre" || gender === "Masculino";

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = user?.role === "SUPERADMIN";
  const canEditSettings = user?.role === "SUPERADMIN" || user?.role === "TREASURER";
  const canEditMerchSettings =
    user?.role === "SUPERADMIN" || user?.role === "TREASURER" || user?.role === "ADMIN";

  const [view, setView] = useState<View>("soldados");
  const [soldados, setSoldados] = useState<SoldadoRecord[]>([]);
  const [servidores, setServidores] = useState<ServidorRecord[]>([]);
  const [eliminados, setEliminados] = useState<EliminadoRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const fetchAll = async () => {
    if (!token) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [soldadosData, servidoresData, settingsData] = await Promise.all([
        listSoldados(token),
        listServidores(token),
        getSettings(token),
      ]);
      setSoldados(soldadosData);
      setServidores(servidoresData);
      setSettings(settingsData);
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

  const buildStats = (
    rows: (SoldadoRecord | ServidorRecord)[],
    price: number
  ) => {
    const hombresList = rows.filter((s) => isHombre(s.gender));
    const mujeresList = rows.filter((s) => isMujer(s.gender));
    const sumField = (list: (SoldadoRecord | ServidorRecord)[], field: "paymentAmount" | "subsidyAmount") =>
      list.reduce((sum, s) => sum + (Number(s[field]) || 0), 0);

    const total = rows.length;
    const totalPaid = sumField(rows, "paymentAmount");
    const totalSubsidy = sumField(rows, "subsidyAmount");
    const hombresPaid = sumField(hombresList, "paymentAmount");
    const hombresSubsidy = sumField(hombresList, "subsidyAmount");
    const mujeresPaid = sumField(mujeresList, "paymentAmount");
    const mujeresSubsidy = sumField(mujeresList, "subsidyAmount");

    return {
      total,
      hombres: hombresList.length,
      mujeres: mujeresList.length,
      totalPaid,
      totalDue: Math.max(0, total * price - totalPaid - totalSubsidy),
      totalSubsidy,
      hombresPaid,
      hombresDue: Math.max(0, hombresList.length * price - hombresPaid - hombresSubsidy),
      hombresSubsidy,
      mujeresPaid,
      mujeresDue: Math.max(0, mujeresList.length * price - mujeresPaid - mujeresSubsidy),
      mujeresSubsidy,
    };
  };

  const soldadoStats = useMemo(
    () => buildStats(soldados, settings.soldadoPrice),
    [soldados, settings.soldadoPrice]
  );

  const servidorStats = useMemo(
    () => buildStats(servidores, settings.servidorPrice),
    [servidores, settings.servidorPrice]
  );

  const activeStats = view === "soldados" ? soldadoStats : servidorStats;

  const totalSubsidyUsed = useMemo(
    () =>
      soldados.reduce((sum, s) => sum + (Number(s.subsidyAmount) || 0), 0) +
      servidores.reduce((sum, s) => sum + (Number(s.subsidyAmount) || 0), 0),
    [soldados, servidores]
  );

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

  const handleResetMerch = async (id: string) => {
    const updated = await resetServidorMerch(token!, id);
    setServidores((prev) => prev.map((s) => (s._id === id ? updated : s)));
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
          {isSuperAdmin && (
            <button
              className="iconBtn"
              type="button"
              title="Registro de actividad"
              onClick={() => navigate("/logs")}
            >
              <LogsIcon className="w-5 h-5" />
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

      <div className="dashboardBody">
        {errorMsg && <p className="loginError">{errorMsg}</p>}

        {isLoading ? (
          <p className="emptyState">Cargando datos...</p>
        ) : (
          <>
            {view !== "eliminados" && view !== "pedido" && (
              <div className="statsWrap">
                <StatsCards
                  view={view}
                  total={activeStats.total}
                  hombres={activeStats.hombres}
                  mujeres={activeStats.mujeres}
                  totalPaid={activeStats.totalPaid}
                  totalDue={activeStats.totalDue}
                  totalSubsidy={activeStats.totalSubsidy}
                  hombresPaid={activeStats.hombresPaid}
                  hombresDue={activeStats.hombresDue}
                  hombresSubsidy={activeStats.hombresSubsidy}
                  mujeresPaid={activeStats.mujeresPaid}
                  mujeresDue={activeStats.mujeresDue}
                  mujeresSubsidy={activeStats.mujeresSubsidy}
                />
              </div>
            )}

            {view === "soldados" && (
              <UsersTable
                view="soldados"
                rows={soldados}
                currentUserRole={user?.role ?? ""}
                showEliminados={isSuperAdmin}
                price={settings.soldadoPrice}
                subsidyMax={settings.subsidyCap}
                totalSubsidyUsed={totalSubsidyUsed}
                onViewChange={setView}
                onEditField={handleEditSoldado}
                onDelete={handleDeleteSoldado}
                onOpenSettings={() => setShowSettingsModal(true)}
              />
            )}

            {view === "servidores" && (
              <UsersTable
                view="servidores"
                rows={servidores}
                currentUserRole={user?.role ?? ""}
                showEliminados={isSuperAdmin}
                price={settings.servidorPrice}
                subsidyMax={settings.subsidyCap}
                totalSubsidyUsed={totalSubsidyUsed}
                onViewChange={setView}
                onEditField={handleEditServidor}
                onDelete={handleDeleteServidor}
                onRoleChange={handleRoleChange}
                onOpenSettings={() => setShowSettingsModal(true)}
              />
            )}

            {view === "pedido" && (
              <PedidoTable
                rows={servidores}
                showEliminados={isSuperAdmin}
                settings={settings}
                token={token!}
                canEditSettings={canEditMerchSettings}
                onViewChange={setView}
                onEditField={handleEditServidor}
                onResetMerch={handleResetMerch}
                onSettingsSaved={setSettings}
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

      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          token={token!}
          canEdit={canEditSettings}
          totalSubsidyUsed={totalSubsidyUsed}
          onSaved={setSettings}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
