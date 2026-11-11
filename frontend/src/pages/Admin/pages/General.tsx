import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import { getDashboardSummary } from "../../../api/dashboard";
import { useReport } from "../useReport";
import KpiCard from "../ui/KpiCard";
import { BarList, ChartCard, ChartLegend, DonutChart, MoneySplit, TrendChart } from "../ui/Charts";
import { COLORS } from "../ui/colors";
import { PageHeading, PageState, RangeSelector, type Range } from "../ui/PageParts";
import {
  BanknotesIcon,
  CheckCircleIcon,
  EyeIcon,
  GiftIcon,
  ReceiptIcon,
  UserPlusIcon,
  UsersIcon,
} from "../icons";
import {
  formatCOP,
  formatCompactCOP,
  formatDateTime,
  formatNumber,
  formatPercent,
  formatRegNum,
  formatShortDay,
  getChange,
} from "../format";

const registrationSeries = [
  { key: "soldados", name: "Soldados", color: COLORS.soldados },
  { key: "servidores", name: "Servidores", color: COLORS.servidores },
];

const paymentSeries = [
  { key: "pagosSoldados", name: "Soldados", color: COLORS.finanzas },
  { key: "pagosServidores", name: "Servidores", color: COLORS.finanzas3 },
];

const trafficSeries = [
  { key: "views", name: "Vistas", color: COLORS.visitas },
  { key: "visitors", name: "Visitantes únicos", color: COLORS.visitantes },
];

const eventDay = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return { day: d, month: date.toLocaleDateString("es-CO", { month: "short" }).replace(".", "") };
};

// Resumen general del retiro: soldados y servidores juntos, cada grupo con su color.
const General = () => {
  const { user } = useAuth();
  const [range, setRange] = useState<Range>(30);
  const { data, isLoading, error } = useReport(getDashboardSummary, range);
  const comparedWith = `vs. ${range} días anteriores`;
  const share = (part: number, total: number) => (total ? part / total : 0);
  const coverage = data ? share(data.kpis.collected + data.kpis.subsidy.used, data.kpis.expected) : 0;

  return (
    <div className="adPage">
      <PageHeading
        crumbs={[{ label: "Dashboard" }, { label: "Resumen" }]}
        title="Resumen general"
        subtitle={
          <>
            Hola{user ? `, ${user.preferredName}` : ""}. Inscripciones, pagos y visitas de soldados y servidores
            {data && ` del ${formatShortDay(data.from)} al ${formatShortDay(data.to)}`}.
          </>
        }
      >
        <RangeSelector value={range} onChange={setRange} />
      </PageHeading>

      <PageState isLoading={isLoading} error={error} />

      {data && (
        <>
          {/* Arriba: tarjetas de soldados y servidores (izquierda) y la tendencia de inscripciones (derecha). */}
          <div className="summaryTop">
            <div className="summaryCards">
              <span className="summaryGroupTitle">Soldados</span>
              <div className="summaryCardsRow">
                <KpiCard
                  tone="todos"
                  label="Total soldados"
                  icon={UsersIcon}
                  value={formatNumber(data.kpis.soldados.total)}
                  change={getChange(data.kpis.soldados)}
                  detail={`+${formatNumber(data.kpis.soldados.value)} en ${range} días`}
                />
                <KpiCard
                  tone="hombres"
                  label="Hombres"
                  icon={UsersIcon}
                  value={formatNumber(data.gender.soldados.hombres)}
                  progress={share(data.gender.soldados.hombres, data.kpis.soldados.total)}
                  detail={`${formatPercent(share(data.gender.soldados.hombres, data.kpis.soldados.total))} de los soldados`}
                />
                <KpiCard
                  tone="mujeres"
                  label="Mujeres"
                  icon={UsersIcon}
                  value={formatNumber(data.gender.soldados.mujeres)}
                  progress={share(data.gender.soldados.mujeres, data.kpis.soldados.total)}
                  detail={`${formatPercent(share(data.gender.soldados.mujeres, data.kpis.soldados.total))} de los soldados`}
                />
              </div>
              <span className="summaryGroupTitle">Servidores activos</span>
              <div className="summaryCardsRow">
                <KpiCard
                  tone="todos"
                  label="Total servidores"
                  icon={UsersIcon}
                  value={formatNumber(data.kpis.servidores.active)}
                  change={getChange(data.kpis.servidores)}
                  detail={`de ${formatNumber(data.kpis.servidores.total)} · +${formatNumber(data.kpis.servidores.value)} en ${range} días`}
                />
                <KpiCard
                  tone="hombres"
                  label="Hombres"
                  icon={UsersIcon}
                  value={formatNumber(data.gender.servidores.hombres)}
                  progress={share(data.gender.servidores.hombres, data.kpis.servidores.active)}
                  detail={`${formatPercent(share(data.gender.servidores.hombres, data.kpis.servidores.active))} de los activos`}
                />
                <KpiCard
                  tone="mujeres"
                  label="Mujeres"
                  icon={UsersIcon}
                  value={formatNumber(data.gender.servidores.mujeres)}
                  progress={share(data.gender.servidores.mujeres, data.kpis.servidores.active)}
                  detail={`${formatPercent(share(data.gender.servidores.mujeres, data.kpis.servidores.active))} de los activos`}
                />
              </div>
            </div>

            <div className="summaryChartCol">
            <span className="summaryGroupTitle">Inscripciones</span>
            <ChartCard
              className="summaryTrend"
              title="Inscripciones por día"
              subtitle="Soldados y servidores que se registraron cada día"
              headline={formatNumber(data.kpis.registrations.value)}
            >
              <ChartLegend
                items={[
                  { label: "Soldados", color: COLORS.soldados, value: formatNumber(data.kpis.soldados.value) },
                  { label: "Servidores", color: COLORS.servidores, value: formatNumber(data.kpis.servidores.value) },
                ]}
              />
              <TrendChart data={data.series} series={registrationSeries} format={formatNumber} label="Inscripciones por día" height={290} />
            </ChartCard>
            </div>
          </div>

          {/* Debajo: inscripciones del periodo, visitas y dinero. */}
          <div className="kpiGrid kpiGridThree">
            <KpiCard
              tone="todos"
              label="Inscripciones del periodo"
              icon={UserPlusIcon}
              value={formatNumber(data.kpis.registrations.value)}
              change={getChange(data.kpis.registrations)}
              detail={comparedWith}
            />
            <KpiCard
              tone="info"
              label="Vistas de la página"
              icon={EyeIcon}
              value={formatNumber(data.kpis.pageViews.value)}
              change={getChange(data.kpis.pageViews)}
              detail={`${formatNumber(data.kpis.pageViews.visitors)} visitantes únicos`}
            />
            <KpiCard
              tone="finanzas"
              label="Pagos recibidos"
              icon={BanknotesIcon}
              value={formatCOP(data.kpis.income.value)}
              change={getChange(data.kpis.income)}
              detail={comparedWith}
            />
            <KpiCard
              tone="finanzas"
              label="Recaudado del retiro"
              icon={CheckCircleIcon}
              value={formatCOP(data.kpis.collected)}
              progress={coverage}
              detail={`${formatPercent(coverage)} cubierto de ${formatCOP(data.kpis.expected)}`}
            />
            <KpiCard tone="finanzas" label="Falta por pagar" icon={ReceiptIcon} value={formatCOP(data.kpis.due)} detail="Soldados y servidores activos" />
            <KpiCard
              tone="finanzas"
              label="Subsidio usado"
              icon={GiftIcon}
              value={formatCOP(data.kpis.subsidy.used)}
              progress={share(data.kpis.subsidy.used, data.kpis.subsidy.cap)}
              detail={`quedan ${formatCOP(Math.max(0, data.kpis.subsidy.cap - data.kpis.subsidy.used))} de ${formatCOP(data.kpis.subsidy.cap)}`}
            />
          </div>

          <div className="pageGrid pageGridMain">
            <ChartCard title="Pagos y subsidios" subtitle="Cómo se cubre el precio del retiro en cada grupo" headline={formatCOP(data.kpis.expected)}>
              <ChartLegend
                items={[
                  { label: "Pagado", color: COLORS.positivo },
                  { label: "Subsidio", color: COLORS.finanzas3 },
                  { label: "Falta", color: COLORS.negativo },
                ]}
              />
              <MoneySplit
                rows={[
                  { label: "Soldados", detail: `${formatNumber(data.paymentStatus.soldados.count)} × ${formatCOP(data.paymentStatus.soldados.price)}`, ...data.paymentStatus.soldados },
                  { label: "Servidores activos", detail: `${formatNumber(data.paymentStatus.servidores.count)} × ${formatCOP(data.paymentStatus.servidores.price)}`, ...data.paymentStatus.servidores },
                ]}
              />
              <div className="infoGrid">
                <div className="infoItem">
                  <span>Pagado en total</span>
                  <strong>{formatCOP(data.kpis.collected)}</strong>
                </div>
                <div className="infoItem">
                  <span>Subsidio otorgado</span>
                  <strong>{formatCOP(data.kpis.subsidy.used)}</strong>
                </div>
                <div className="infoItem">
                  <span>Falta por pagar</span>
                  <strong>{formatCOP(data.kpis.due)}</strong>
                </div>
                <div className="infoItem">
                  <span>Subsidio disponible</span>
                  <strong>{formatCOP(Math.max(0, data.kpis.subsidy.cap - data.kpis.subsidy.used))}</strong>
                </div>
              </div>
            </ChartCard>
            <ChartCard title="Estado de pago" subtitle="Pago + subsidio frente al precio del retiro">
              <BarList
                emptyText="Aún no hay inscritos."
                items={[
                  {
                    label: "Soldados con pago completo",
                    value: data.paymentStatus.soldados.status.completo,
                    display: formatNumber(data.paymentStatus.soldados.status.completo),
                    detail: `de ${formatNumber(data.paymentStatus.soldados.count)}`,
                    color: COLORS.positivo,
                  },
                  {
                    label: "Soldados con abono",
                    value: data.paymentStatus.soldados.status.parcial,
                    display: formatNumber(data.paymentStatus.soldados.status.parcial),
                    color: COLORS.parcial,
                  },
                  {
                    label: "Soldados sin pago",
                    value: data.paymentStatus.soldados.status.sinPago,
                    display: formatNumber(data.paymentStatus.soldados.status.sinPago),
                    color: COLORS.negativo,
                  },
                  {
                    label: "Servidores con pago completo",
                    value: data.paymentStatus.servidores.status.completo,
                    display: formatNumber(data.paymentStatus.servidores.status.completo),
                    detail: `de ${formatNumber(data.paymentStatus.servidores.count)}`,
                    color: COLORS.positivo,
                  },
                  {
                    label: "Servidores con abono",
                    value: data.paymentStatus.servidores.status.parcial,
                    display: formatNumber(data.paymentStatus.servidores.status.parcial),
                    color: COLORS.parcial,
                  },
                  {
                    label: "Servidores sin pago",
                    value: data.paymentStatus.servidores.status.sinPago,
                    display: formatNumber(data.paymentStatus.servidores.status.sinPago),
                    color: COLORS.negativo,
                  },
                ]}
              />
            </ChartCard>
          </div>

          <div className="pageGrid pageGridHalf">
            <ChartCard
              title="Pagos por día"
              subtitle="Abonos registrados en la tabla (inscripción)"
              headline={formatCOP(data.series.reduce((s, d) => s + d.pagosSoldados + d.pagosServidores, 0))}
            >
              <ChartLegend
                items={[
                  { label: "Soldados", color: COLORS.finanzas, value: formatCOP(data.series.reduce((s, d) => s + d.pagosSoldados, 0)) },
                  { label: "Servidores", color: COLORS.finanzas3, value: formatCOP(data.series.reduce((s, d) => s + d.pagosServidores, 0)) },
                ]}
              />
              <TrendChart
                data={data.series}
                series={paymentSeries}
                format={formatCOP}
                axisFormat={formatCompactCOP}
                label="Pagos recibidos por día"
                stacked
              />
            </ChartCard>
            <ChartCard
              title="Visitas a la página"
              subtitle={`${formatNumber(data.kpis.pageViews.visitors)} visitantes únicos`}
              headline={formatNumber(data.kpis.pageViews.value)}
            >
              <ChartLegend
                items={trafficSeries.map((s) => ({
                  label: s.name,
                  color: s.color,
                  value: formatNumber(s.key === "views" ? data.kpis.pageViews.value : data.kpis.pageViews.visitors),
                }))}
              />
              <TrendChart data={data.series} series={trafficSeries} format={formatNumber} label="Vistas y visitantes por día" />
            </ChartCard>
          </div>

          <div className="pageGrid pageGridThird">
            <ChartCard title="Soldados por género" subtitle="Todos los inscritos">
              <DonutChart
                emptyText="Aún no hay soldados."
                centerLabel="soldados"
                centerValue={formatNumber(data.kpis.soldados.total)}
                format={formatNumber}
                items={[
                  { label: "Hombres", value: data.gender.soldados.hombres, color: COLORS.hombres },
                  { label: "Mujeres", value: data.gender.soldados.mujeres, color: COLORS.mujeres },
                  ...(data.gender.soldados.otros ? [{ label: "Otro", value: data.gender.soldados.otros, color: COLORS.inactivo }] : []),
                ]}
              />
            </ChartCard>
            <ChartCard title="Servidores por género" subtitle="Solo activos">
              <DonutChart
                emptyText="Aún no hay servidores activos."
                centerLabel="activos"
                centerValue={formatNumber(data.kpis.servidores.active)}
                format={formatNumber}
                items={[
                  { label: "Hombres", value: data.gender.servidores.hombres, color: COLORS.hombres },
                  { label: "Mujeres", value: data.gender.servidores.mujeres, color: COLORS.mujeres },
                ]}
              />
            </ChartCard>
            <ChartCard title="Disponibilidad de servidores" subtitle="Lo que marcó cada servidor en su perfil">
              <DonutChart
                emptyText="Aún no hay servidores."
                centerLabel="servidores"
                centerValue={formatNumber(data.kpis.servidores.total)}
                format={formatNumber}
                items={[
                  { label: "Activos", value: data.servidoresByStatus.ACTIVO, color: COLORS.positivo },
                  { label: "Santísimo nocturno", value: data.servidoresByStatus.SANTISIMO_NOCTURNO, color: COLORS.santisimo },
                  { label: "Inactivos", value: data.servidoresByStatus.INACTIVO, color: COLORS.inactivo },
                ]}
              />
            </ChartCard>
          </div>

          <div className="pageGrid pageGridSide">
            <ChartCard title="Próximas reuniones" subtitle="Del cronograma">
              {data.upcomingEvents.length === 0 ? (
                <p className="pageEmpty">No hay reuniones próximas.</p>
              ) : (
                <ul className="miniList">
                  {data.upcomingEvents.map((e) => {
                    const { day, month } = eventDay(e.dateISO);
                    return (
                      <li key={e._id}>
                        <span className="dateBadge">
                          <strong>{day}</strong>
                          <span>{month}</span>
                        </span>
                        <span className="miniListMain">
                          <span className="miniListTitle">{e.title}</span>
                          <span className="miniListMeta">
                            {[e.start && `${e.start}${e.end ? ` - ${e.end}` : ""}`, e.location, e.tag].filter(Boolean).join(" · ")}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
              {(user?.role === "ADMIN" || user?.role === "SUPERADMIN") && (
                <Link to="/dashboard/reuniones/tabla" className="cardLink">
                  Ver cronograma →
                </Link>
              )}
            </ChartCard>
            <ChartCard title="Inscripciones recientes" subtitle="Últimos soldados y servidores registrados">
              {data.recentRegistrations.length === 0 ? (
                <p className="pageEmpty">Aún no hay inscripciones.</p>
              ) : (
                <div className="adTableWrapper">
                  <table className="adTable">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>Ciudad</th>
                        <th>Pago</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentRegistrations.map((r) => {
                        const covered = r.paid + r.subsidy;
                        const status = covered >= r.price ? "completo" : covered > 0 ? "parcial" : "sinPago";
                        return (
                          <tr key={r._id}>
                            <td className="cellStrong">{formatRegNum(r.registrationNumber)}</td>
                            <td>{r.name}</td>
                            <td>
                              <span className={`typeTag ${r.group}`}>{r.group === "soldados" ? "Soldado" : "Servidor"}</span>
                            </td>
                            <td className="cellMuted">{r.city || "-"}</td>
                            <td>
                              <span className={`statusPill ${status}`}>
                                {status === "completo" ? "Completo" : status === "parcial" ? "Abono" : "Sin pago"}
                              </span>
                            </td>
                            <td className="cellMuted">{formatDateTime(r.createdAt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
};

export default General;
