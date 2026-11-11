import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
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
import { takeNewRegistrations } from "../Dashboard/ui/newRegistrations";
import type { ServiceStatusFilterValue } from "../Dashboard/ui/serviceStatus";

const DEFAULT_SETTINGS: AppSettings = {
  retreatNumber: 16,
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

type AdminDataValue = {
  soldados: SoldadoRecord[];
  servidores: ServidorRecord[];
  eliminados: EliminadoRecord[];
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  isLoading: boolean;
  error: string | null;
  /** Inscripciones que llegaron desde la última visita (fila coloreada y "+N"). */
  newIds: Set<string>;
  totalSubsidyUsed: number;
  /** Filtro de disponibilidad de servidores: lo comparten la tabla y las tarjetas. */
  servidorStatusFilter: ServiceStatusFilterValue;
  setServidorStatusFilter: (value: ServiceStatusFilterValue) => void;
  reload: () => Promise<void>;
  editSoldado: (id: string, field: string, value: string) => Promise<void>;
  editServidor: (id: string, field: string, value: unknown) => Promise<void>;
  changeRole: (id: string, role: string) => Promise<void>;
  removeSoldado: (id: string) => Promise<void>;
  removeServidor: (id: string) => Promise<void>;
  resetMerch: (id: string) => Promise<void>;
  restore: (id: string) => Promise<void>;
};

const AdminDataContext = createContext<AdminDataValue | null>(null);

/**
 * Datos de soldados, servidores y ajustes compartidos por todas las secciones del dashboard:
 * se cargan una sola vez al entrar y cada sección los usa sin volver a pedirlos.
 */
export const AdminDataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const userId = user?.sub;
  const isSuperAdmin = user?.role === "SUPERADMIN";

  const [soldados, setSoldados] = useState<SoldadoRecord[]>([]);
  const [servidores, setServidores] = useState<ServidorRecord[]>([]);
  const [eliminados, setEliminados] = useState<EliminadoRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [servidorStatusFilter, setServidorStatusFilter] = useState<ServiceStatusFilterValue>("ACTIVO");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(() => new Set());

  const reload = useCallback(async () => {
    if (!userId) return;
    setError(null);
    try {
      const [soldadosData, servidoresData, settingsData] = await Promise.all([
        listSoldados(),
        listServidores(),
        getSettings(),
      ]);
      setSoldados(soldadosData);
      setServidores(servidoresData);
      setSettings(settingsData);
      const fresh = [
        ...takeNewRegistrations(userId, "soldados", soldadosData),
        ...takeNewRegistrations(userId, "servidores", servidoresData),
      ];
      if (fresh.length) setNewIds((prev) => new Set([...prev, ...fresh]));
      if (isSuperAdmin) setEliminados(await listEliminados());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error cargando los datos");
    } finally {
      setIsLoading(false);
    }
  }, [userId, isSuperAdmin]);

  useEffect(() => {
    reload();
  }, [reload]);

  const totalSubsidyUsed = useMemo(
    () =>
      soldados.reduce((sum, s) => sum + (Number(s.subsidyAmount) || 0), 0) +
      servidores.reduce((sum, s) => sum + (Number(s.subsidyAmount) || 0), 0),
    [soldados, servidores]
  );

  const value: AdminDataValue = {
    soldados,
    servidores,
    eliminados,
    settings,
    setSettings,
    isLoading,
    error,
    newIds,
    totalSubsidyUsed,
    servidorStatusFilter,
    setServidorStatusFilter,
    reload,
    editSoldado: async (id, field, val) => {
      const updated = await updateSoldadoField(id, field, val);
      // Mover el # corre a los demás: se recarga la lista completa.
      if (field === "registrationNumber") setSoldados(await listSoldados());
      else setSoldados((prev) => prev.map((s) => (s._id === id ? updated : s)));
    },
    editServidor: async (id, field, val) => {
      const updated = await updateServidorField(id, field, val);
      if (field === "registrationNumber") setServidores(await listServidores());
      else setServidores((prev) => prev.map((s) => (s._id === id ? updated : s)));
    },
    changeRole: async (id, role) => {
      const updated = await updateServidorRole(id, role);
      setServidores((prev) => prev.map((s) => (s._id === id ? updated : s)));
    },
    removeSoldado: async (id) => {
      await deleteSoldado(id);
      // El backend renumera el # de los que estaban debajo, así que se recarga la lista.
      setSoldados(await listSoldados());
      if (isSuperAdmin) setEliminados(await listEliminados());
    },
    removeServidor: async (id) => {
      await deleteServidor(id);
      setServidores(await listServidores());
      if (isSuperAdmin) setEliminados(await listEliminados());
    },
    resetMerch: async (id) => {
      const updated = await resetServidorMerch(id);
      setServidores((prev) => prev.map((s) => (s._id === id ? updated : s)));
    },
    restore: async (id) => {
      await restoreEliminado(id);
      await reload();
    },
  };

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminData = () => {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData debe usarse dentro de AdminDataProvider");
  return ctx;
};
