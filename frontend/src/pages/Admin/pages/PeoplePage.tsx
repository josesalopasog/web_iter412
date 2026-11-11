import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import { PageLoader } from "../../../components/Spinner";
import GuidedTour from "../../../tours/GuidedTour";
import StatsCards from "../../Dashboard/ui/StatsCards";
import UsersTable from "../../Dashboard/ui/UsersTable";
import { serviceStatusOf, SERVICE_STATUS_LABELS } from "../../Dashboard/ui/serviceStatus";
import type { ServidorRecord, SoldadoRecord } from "../../../api/adminUsers";
import { toRoman } from "../../../utils/romanNumeral";
import { useAdminData } from "../AdminData";
import { BarList, ChartCard, ChartLegend, ColumnChart, StackedBars } from "../ui/Charts";
import { COLORS } from "../ui/colors";
import { PageHeading, Segmented } from "../ui/PageParts";
import { ChartBarIcon, ClipboardIcon } from "../icons";
import type { ServiceStatusFilterValue } from "../../Dashboard/ui/serviceStatus";
import { formatCOP, formatNumber, formatPercent, isHombre, isMujer } from "../format";
import { ageBuckets, averageAge, buildStats, countBy, registrationsByDay } from "./peopleStats";

type Group = "soldados" | "servidores";
type Mode = "dashboard" | "inscripciones";

const STATUS_DOTS: Record<ServiceStatusFilterValue, string> = {
  ACTIVO: "#059669",
  SANTISIMO_NOCTURNO: "#1a9be0",
  INACTIVO: "#9ca3af",
  TODOS: "#7c3aed",
};

const genderSeries = [
  { key: "hombres", name: "Hombres", color: COLORS.hombres },
  { key: "mujeres", name: "Mujeres", color: COLORS.mujeres },
];

/**
 * Soldados o servidores en dos secciones: "Dashboard" (tarjetas de siempre + gráficas estilo
 * cytek) e "Inscripciones" (la tabla editable de siempre).
 */
const PeoplePage = ({ group, mode }: { group: Group; mode: Mode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const data = useAdminData();
  const isDashboard = mode === "dashboard";
  const base = `/dashboard/${group}`;
  const isSoldados = group === "soldados";
  const price = isSoldados ? data.settings.soldadoPrice : data.settings.servidorPrice;
  const allRows: (SoldadoRecord | ServidorRecord)[] = isSoldados ? data.soldados : data.servidores;

  // Servidores: las tarjetas y gráficas siguen el filtro de disponibilidad (activos por defecto).
  const rows = useMemo(
    () =>
      isSoldados || data.servidorStatusFilter === "TODOS"
        ? allRows
        : allRows.filter((s) => serviceStatusOf(s) === data.servidorStatusFilter),
    [allRows, isSoldados, data.servidorStatusFilter]
  );

  const stats = useMemo(() => buildStats(rows, price), [rows, price]);
  const added = useMemo(() => {
    const fresh = rows.filter((r) => data.newIds.has(r._id));
    return {
      total: fresh.length,
      hombres: fresh.filter((r) => isHombre(r.gender)).length,
      mujeres: fresh.filter((r) => isMujer(r.gender)).length,
    };
  }, [rows, data.newIds]);

  const daily = useMemo(() => registrationsByDay(rows, 30), [rows]);
  const last30 = daily.reduce((s, d) => s + d.hombres + d.mujeres, 0);
  const cities = useMemo(() => countBy(rows, (r) => String(r.city ?? "")), [rows]);
  const ages = useMemo(() => ageBuckets(rows), [rows]);
  const avgAge = useMemo(() => averageAge(rows), [rows]);
  const fourth = useMemo(
    () =>
      isSoldados
        ? countBy(rows, (r) => String(r.hearAbout ?? ""))
        : countBy(rows, (r) => (Array.isArray(r.services) ? (r.services as string[]) : []), 8),
    [rows, isSoldados]
  );

  const collectedRate = stats.total ? (stats.totalPaid + stats.totalSubsidy) / (stats.total * price) : 0;
  const scope = isSoldados ? "" : ` · ${SERVICE_STATUS_LABELS[data.servidorStatusFilter].toLowerCase()}`;

  if (data.isLoading) return <PageLoader variant="inline" label="Cargando datos" />;

  return (
    <div className="adPage">
      <PageHeading
        crumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: isSoldados ? "Soldados" : "Servidores", to: isDashboard ? undefined : base },
          ...(isDashboard ? [] : [{ label: "Inscripciones" }]),
        ]}
        title={`${isDashboard ? "Dashboard de" : "Inscripciones de"} ${isSoldados ? "soldados" : "servidores"}`}
        subtitle={
          <>
            Retiro {toRoman(data.settings.retreatNumber)} · {formatNumber(stats.total)} {isSoldados ? "inscritos" : "servidores"}
            {scope} · precio {formatCOP(price)} · {formatPercent(Math.min(1, collectedRate))} recaudado
          </>
        }
      >
        {isDashboard && !isSoldados && (
          <Segmented
            label="Disponibilidad"
            value={data.servidorStatusFilter}
            onChange={data.setServidorStatusFilter}
            options={(["ACTIVO", "SANTISIMO_NOCTURNO", "INACTIVO", "TODOS"] as ServiceStatusFilterValue[]).map((value) => ({
              value,
              label: SERVICE_STATUS_LABELS[value],
              dot: STATUS_DOTS[value],
              count: value === "TODOS" ? allRows.length : allRows.filter((r) => serviceStatusOf(r) === value).length,
            }))}
          />
        )}
        {isDashboard ? (
          <Link to={`${base}/inscripciones`} className="toolbarButton primary">
            <ClipboardIcon /> Ver inscripciones
          </Link>
        ) : (
          <Link to={base} className="toolbarButton">
            <ChartBarIcon /> Ver dashboard
          </Link>
        )}
      </PageHeading>

      {data.error && <p className="loginError">{data.error}</p>}

      {isDashboard && (
      <div data-tour="stats">
        <StatsCards
          view={group}
          total={stats.total}
          hombres={stats.hombres}
          mujeres={stats.mujeres}
          totalPaid={stats.totalPaid}
          totalDue={stats.totalDue}
          totalSubsidy={stats.totalSubsidy}
          hombresPaid={stats.hombresPaid}
          hombresDue={stats.hombresDue}
          hombresSubsidy={stats.hombresSubsidy}
          mujeresPaid={stats.mujeresPaid}
          mujeresDue={stats.mujeresDue}
          mujeresSubsidy={stats.mujeresSubsidy}
          added={added}
        />
      </div>
      )}

      {isDashboard && (
        <>
          <div className="pageGrid pageGridMain">
            <ChartCard title="Inscripciones por día" subtitle="Últimos 30 días" headline={formatNumber(last30)}>
              <ChartLegend
                items={[
                  { label: "Hombres", color: COLORS.hombres, value: formatNumber(daily.reduce((s, d) => s + d.hombres, 0)) },
                  { label: "Mujeres", color: COLORS.mujeres, value: formatNumber(daily.reduce((s, d) => s + d.mujeres, 0)) },
                ]}
              />
              <StackedBars data={daily} series={genderSeries} format={formatNumber} label="Inscripciones por día" height={220} />
            </ChartCard>
            <ChartCard title="Edades" subtitle={avgAge ? `Promedio ${avgAge.toFixed(1).replace(".", ",")} años` : "Sin datos de edad"}>
              <ColumnChart
                data={ages}
                xKey="label"
                series={{ key: "count", name: isSoldados ? "Soldados" : "Servidores", color: isSoldados ? COLORS.soldados : COLORS.servidores }}
                format={formatNumber}
                labelFormat={(label) => `${label} años`}
                label="Personas por rango de edad"
                height={220}
              />
            </ChartCard>
          </div>
          <div className="pageGrid pageGridHalf">
            <ChartCard title="Ciudades" subtitle="Dónde viven">
              <BarList
                emptyText="Sin datos."
                color={isSoldados ? COLORS.soldados : COLORS.servidores}
                items={cities.map((c) => ({
                  label: c.label,
                  value: c.value,
                  display: formatNumber(c.value),
                  detail: stats.total ? formatPercent(c.value / stats.total) : undefined,
                }))}
              />
            </ChartCard>
            <ChartCard
              title={isSoldados ? "¿Cómo se enteraron?" : "Servicios"}
              subtitle={isSoldados ? "Lo que respondieron al inscribirse" : "En qué han servido antes"}
            >
              <BarList
                emptyText="Sin datos."
                color={isSoldados ? "var(--iter-soldados-2)" : "var(--iter-servidores-2)"}
                items={fourth.map((c) => ({
                  label: c.label,
                  value: c.value,
                  display: formatNumber(c.value),
                  detail: stats.total ? formatPercent(c.value / stats.total) : undefined,
                }))}
              />
            </ChartCard>
          </div>
        </>
      )}

      {isDashboard ? null : group === "soldados" ? (
        <UsersTable
          view="soldados"
          rows={data.soldados}
          newIds={data.newIds}
          currentUserRole={user?.role ?? ""}
          price={data.settings.soldadoPrice}
          subsidyMax={data.settings.subsidyCap}
          totalSubsidyUsed={data.totalSubsidyUsed}
          onEditField={data.editSoldado}
          onDelete={data.removeSoldado}
          onOpenSettings={() => navigate("/dashboard/ajustes")}
        />
      ) : (
        <UsersTable
          view="servidores"
          rows={data.servidores}
          newIds={data.newIds}
          currentUserRole={user?.role ?? ""}
          price={data.settings.servidorPrice}
          subsidyMax={data.settings.subsidyCap}
          totalSubsidyUsed={data.totalSubsidyUsed}
          onOpenPedido={() => navigate("/dashboard/pedido/tabla")}
          onEditField={data.editServidor}
          onDelete={data.removeServidor}
          onRoleChange={data.changeRole}
          onOpenSettings={() => navigate("/dashboard/ajustes")}
          statusFilter={data.servidorStatusFilter}
          onStatusFilterChange={data.setServidorStatusFilter}
        />
      )}

      {!isDashboard && <GuidedTour tourId="dashboard" userId={user?.sub} ready={!data.isLoading} />}

    </div>
  );
};

export const SoldadosDashboard = () => <PeoplePage group="soldados" mode="dashboard" />;
export const SoldadosInscripciones = () => <PeoplePage group="soldados" mode="inscripciones" />;
export const ServidoresDashboard = () => <PeoplePage group="servidores" mode="dashboard" />;
export const ServidoresInscripciones = () => <PeoplePage group="servidores" mode="inscripciones" />;
