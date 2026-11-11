import { useEffect, useMemo, useState } from "react";
import { listLogs } from "../../../api/adminUsers";
import type { LogRecord } from "../../../api/adminUsers";
import { roleLabel } from "../../../auth/roleLabel";
import KpiCard from "../ui/KpiCard";
import { BarList, ChartCard } from "../ui/Charts";
import { COLORS } from "../ui/colors";
import DataTable, { type DataColumn } from "../ui/DataTable";
import { PageHeading, PageState } from "../ui/PageParts";
import { BanknotesIcon, ClipboardIcon, TrashIcon, UsersIcon } from "../icons";
import { formatDateTime, formatNumber } from "../format";

const ACTION_GROUPS: { value: string; label: string; match: (log: LogRecord) => boolean; dot: string }[] = [
  { value: "pagos", label: "Pagos", match: (l) => /"(paymentAmount|subsidyAmount|merchPaymentAmount)"/.test(l.summary), dot: COLORS.finanzas },
  { value: "soldados", label: "Soldados", match: (l) => l.action.includes("SOLDADO"), dot: COLORS.soldados },
  { value: "servidores", label: "Servidores", match: (l) => l.action.includes("SERVIDOR") || l.action === "CAMBIAR_ROL", dot: COLORS.servidores },
  { value: "eliminaciones", label: "Eliminaciones", match: (l) => l.action.startsWith("ELIMINAR") || l.action.startsWith("RESTAURAR"), dot: COLORS.inactivo },
  { value: "configuracion", label: "Ajustes y eventos", match: (l) => /CONFIGURACION|EVENTO|NOTIFICACION/.test(l.action), dot: COLORS.info },
];

const columns: DataColumn<LogRecord>[] = [
  { key: "date", label: "Fecha", className: "cellMuted", render: (l) => formatDateTime(l.createdAt), value: (l) => formatDateTime(l.createdAt) },
  { key: "user", label: "Usuario", className: "cellStrong", render: (l) => l.userName, value: (l) => l.userName },
  { key: "role", label: "Rol", render: (l) => <span className="statusPill info">{roleLabel(l.userRole)}</span>, value: (l) => roleLabel(l.userRole) },
  { key: "summary", label: "Cambio", className: "cellWrap", render: (l) => l.summary, value: (l) => l.summary },
];

// Registro de actividad (antes en /logs): quién cambió qué y cuándo.
const ActivityLog = () => {
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastWeek, setLastWeek] = useState(0);

  useEffect(() => {
    listLogs()
      .then((data) => {
        setLogs(data);
        const weekAgo = Date.now() - 7 * 86_400_000;
        setLastWeek(data.filter((l) => new Date(l.createdAt).getTime() >= weekAgo).length);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Error cargando el registro"))
      .finally(() => setIsLoading(false));
  }, []);

  const byUser = useMemo(() => {
    const counts = new Map<string, number>();
    for (const l of logs) counts.set(l.userName, (counts.get(l.userName) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [logs]);


  return (
    <div className="adPage">
      <PageHeading
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Gestión" }, { label: "Registro de actividad" }]}
        title="Registro de actividad"
        subtitle="Los últimos 500 cambios hechos en el dashboard y en los perfiles."
      />

      <PageState isLoading={isLoading} error={error} />

      {!isLoading && !error && (
        <>
          <div className="kpiGrid">
            <KpiCard tone="info" label="Cambios registrados" icon={ClipboardIcon} value={formatNumber(logs.length)} detail={`${formatNumber(lastWeek)} en los últimos 7 días`} />
            <KpiCard tone="finanzas" label="Cambios de pagos" icon={BanknotesIcon} value={formatNumber(logs.filter(ACTION_GROUPS[0].match).length)} />
            <KpiCard tone="info" label="Eliminaciones" icon={TrashIcon} value={formatNumber(logs.filter((l) => l.action.startsWith("ELIMINAR")).length)} />
            <KpiCard tone="todos" label="Personas que editaron" icon={UsersIcon} value={formatNumber(new Set(logs.map((l) => l.userId)).size)} />
          </div>

          <div className="pageGrid pageGridSide">
            <ChartCard title="Quién hace más cambios">
              <BarList
                emptyText="Aún no hay actividad."
                items={byUser.map(([label, value]) => ({ label, value, display: formatNumber(value) }))}
              />
            </ChartCard>
            <ChartCard title="Actividad">
              <DataTable
                id="registro-de-actividad"
                rows={logs}
                columns={columns}
                getRowId={(l) => l._id}
                tabs={[{ value: "todos", label: "Todos" }, ...ACTION_GROUPS]}
                searchPlaceholder="Buscar por usuario o cambio"
                emptyText="No hay registros de actividad todavía."
              />
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
};

export default ActivityLog;
