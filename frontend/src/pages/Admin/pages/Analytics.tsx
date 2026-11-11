import { useState, type ReactNode } from "react";
import { getAnalyticsSummary, type AnalyticsSummary } from "../../../api/dashboard";
import { useReport } from "../useReport";
import KpiCard from "../ui/KpiCard";
import { ChartCard, ChartLegend, ColumnChart, DonutChart, TrendChart } from "../ui/Charts";
import { COLORS } from "../ui/colors";
import DataTable, { type DataColumn } from "../ui/DataTable";
import { PageHeading, PageState, RangeSelector, type Range } from "../ui/PageParts";
import { ChartBarIcon, ClockIcon, EyeIcon, UsersIcon } from "../icons";
import { formatNumber, formatPercent, formatShortDay, getChange } from "../format";

type TopPage = AnalyticsSummary["topPages"][number];

const PAGE_NAMES: Record<string, string> = {
  "/": "Inicio",
  "/inscribirme": "Inscripción de soldados",
  "/servidores": "Inscripción de servidores",
  "/login": "Iniciar sesión",
  "/profile": "Perfil",
  "/password": "Cambiar contraseña",
  "/participante": "Respuestas de un participante",
  "/dashboard": "Dashboard · Resumen",
  "/dashboard/analitica": "Dashboard · Analítica",
  "/dashboard/finanzas": "Dashboard · Finanzas",
  "/dashboard/soldados": "Dashboard · Soldados",
  "/dashboard/soldados/inscripciones": "Dashboard · Inscripciones de soldados",
  "/dashboard/servidores": "Dashboard · Servidores",
  "/dashboard/servidores/inscripciones": "Dashboard · Inscripciones de servidores",
  "/dashboard/pedido": "Dashboard · Analítica del pedido",
  "/dashboard/pedido/tabla": "Dashboard · Pedidos de merch",
  "/dashboard/pedido/precios": "Dashboard · Precios de merch",
  "/dashboard/ajustes": "Dashboard · Ajustes del retiro",
  "/dashboard/tu-voz": "Dashboard · Tu voz en ITER",
  "/dashboard/tu-voz/respuestas": "Dashboard · Respuestas de Tu voz",
  "/dashboard/soldados/salud": "Dashboard · Salud de soldados",
  "/dashboard/servidores/salud": "Dashboard · Salud de servidores",
  "/dashboard/reuniones": "Dashboard · Analítica de reuniones",
  "/dashboard/reuniones/tabla": "Dashboard · Cronograma",
  "/dashboard/reuniones/nuevo": "Dashboard · Agregar evento",
  "/dashboard/notificaciones": "Dashboard · Notificaciones",
  "/dashboard/actividad": "Dashboard · Registro de actividad",
  "/dashboard/eliminados": "Dashboard · Eliminados",
};

const pageName = (path: string) => PAGE_NAMES[path] ?? path;

const DAY_NAMES: Record<number, string> = { 1: "Domingo", 2: "Lunes", 3: "Martes", 4: "Miércoles", 5: "Jueves", 6: "Viernes", 7: "Sábado" };
const hourLabel = (hour: number | string) => `${String(hour).padStart(2, "0")}:00`;
const hourRange = (hour: number | string) => `${hourLabel(hour)} – ${hourLabel((Number(hour) + 1) % 24)}`;
const decimal = (value: number) => value.toFixed(1).replace(".", ",");

const trafficSeries = [
  { key: "views", name: "Vistas", color: COLORS.visitas },
  { key: "visitors", name: "Visitantes únicos", color: COLORS.visitantes },
];
const viewsSeries = { key: "views", name: "Vistas", color: COLORS.visitas };

type Insight = { tone: "up" | "down" | "neutral"; text: ReactNode };

// Lo más importante del periodo, escrito a partir de los datos.
const buildInsights = (data: AnalyticsSummary, range: number): Insight[] => {
  const insights: Insight[] = [];
  const views = getChange(data.kpis.views);
  if (views) {
    insights.push({
      tone: views.isUp ? "up" : "down",
      text: (
        <>
          Las vistas <strong>{views.isUp ? "subieron" : "bajaron"} {views.value}</strong> frente a los {range} días anteriores.
        </>
      ),
    });
  }
  const peakHour = [...data.byHour].sort((a, b) => b.views - a.views)[0];
  if (peakHour?.views) {
    insights.push({
      tone: "neutral",
      text: (
        <>
          La hora con más tráfico es <strong>{hourRange(peakHour.hour)}</strong> ({formatNumber(peakHour.views)} vistas): buen momento para publicar
          en redes.
        </>
      ),
    });
  }
  const peakDay = [...data.byWeekday].sort((a, b) => b.views - a.views)[0];
  if (peakDay?.views) {
    insights.push({
      tone: "neutral",
      text: (
        <>
          El día con más visitas es el <strong>{DAY_NAMES[peakDay.day].toLowerCase()}</strong>.
        </>
      ),
    });
  }
  const signup = data.topPages.find((p) => p.path === "/inscribirme");
  const home = data.topPages.find((p) => p.path === "/");
  if (signup && home?.visitors) {
    insights.push({
      tone: "neutral",
      text: (
        <>
          <strong>{formatPercent(Math.min(1, signup.visitors / home.visitors))}</strong> de quienes entran al inicio abren el formulario de
          inscripción.
        </>
      ),
    });
  }
  if (data.kpis.visitors.value) {
    insights.push({
      tone: "neutral",
      text: (
        <>
          Cada visitante abre en promedio <strong>{decimal(data.kpis.viewsPerVisitor.value)} páginas</strong>.
        </>
      ),
    });
  }
  return insights;
};

// Tráfico del sitio: vistas, visitantes, horas y días pico, páginas más vistas.
const Analytics = () => {
  const [range, setRange] = useState<Range>(30);
  const { data, isLoading, error } = useReport(getAnalyticsSummary, range);
  const comparedWith = `vs. ${range} días anteriores`;
  const peakHour = data && [...data.byHour].sort((a, b) => b.views - a.views)[0];
  const peakDay = data && [...data.byWeekday].sort((a, b) => b.views - a.views)[0];
  const totalViews = data?.kpis.views.value ?? 0;

  const pageColumns: DataColumn<TopPage>[] = [
    { key: "page", label: "Página", className: "cellStrong", render: (p) => pageName(p.path), value: (p) => pageName(p.path) },
    { key: "path", label: "Ruta", className: "cellMuted", render: (p) => p.path, value: (p) => p.path },
    { key: "views", label: "Vistas", align: "right", render: (p) => formatNumber(p.views), value: (p) => p.views },
    { key: "visitors", label: "Visitantes únicos", align: "right", render: (p) => formatNumber(p.visitors), value: (p) => p.visitors },
    {
      key: "share",
      label: "Participación",
      align: "right",
      className: "cellMuted",
      render: (p) => (totalViews ? formatPercent(p.views / totalViews) : "—"),
      value: (p) => (totalViews ? formatPercent(p.views / totalViews) : ""),
    },
  ];

  return (
    <div className="adPage">
      <PageHeading
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Analítica" }]}
        title="Analítica"
        subtitle={<>Visitas a iter412.com{data && ` del ${formatShortDay(data.from)} al ${formatShortDay(data.to)}`}.</>}
      >
        <RangeSelector value={range} onChange={setRange} />
      </PageHeading>

      <PageState isLoading={isLoading} error={error} />

      {data && (
        <>
          <div className="kpiGrid">
            <KpiCard tone="info" label="Vistas de página" icon={EyeIcon} value={formatNumber(data.kpis.views.value)} change={getChange(data.kpis.views)} detail={comparedWith} />
            <KpiCard tone="info" label="Visitantes únicos" icon={UsersIcon} value={formatNumber(data.kpis.visitors.value)} change={getChange(data.kpis.visitors)} detail={comparedWith} />
            <KpiCard tone="info"
              label="Páginas por visitante"
              icon={ChartBarIcon}
              value={decimal(data.kpis.viewsPerVisitor.value)}
              change={getChange(data.kpis.viewsPerVisitor)}
              detail={comparedWith}
            />
            <KpiCard tone="info"
              label="Hora pico"
              icon={ClockIcon}
              value={peakHour?.views ? hourLabel(peakHour.hour) : "—"}
              detail={peakDay?.views ? `El día con más tráfico es el ${DAY_NAMES[peakDay.day].toLowerCase()}` : "Aún no hay visitas"}
            />
          </div>

          <div className="pageGrid pageGridMain">
            <ChartCard title="Tráfico por día" subtitle="Vistas de página y visitantes únicos" headline={formatNumber(data.kpis.views.value)}>
              <ChartLegend
                items={[
                  { label: "Vistas", color: COLORS.visitas, value: formatNumber(data.kpis.views.value) },
                  { label: "Visitantes únicos", color: COLORS.visitantes, value: formatNumber(data.kpis.visitors.value) },
                ]}
              />
              <TrendChart data={data.series} series={trafficSeries} format={formatNumber} label="Vistas y visitantes por día" />
            </ChartCard>
            <ChartCard title="Análisis" subtitle={`Lo más importante de los últimos ${range} días`}>
              {buildInsights(data, range).length === 0 ? (
                <p className="pageEmpty">Aún no hay suficientes visitas para analizar.</p>
              ) : (
                <ul className="insights">
                  {buildInsights(data, range).map((insight, i) => (
                    <li key={i}>
                      <span className={`insightDot ${insight.tone}`} />
                      <span>{insight.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </ChartCard>
          </div>

          <div className="pageGrid pageGridThird">
            <ChartCard title="Vistas por hora" subtitle="Hora de Colombia · resaltada la hora pico">
              <ColumnChart
                data={data.byHour}
                xKey="hour"
                series={viewsSeries}
                format={formatNumber}
                tickFormat={hourLabel}
                labelFormat={hourRange}
                highlight={peakHour?.views ? peakHour.hour : undefined}
                label="Vistas por hora del día"
              />
            </ChartCard>
            <ChartCard title="Vistas por día de la semana" subtitle="Resaltado el día con más tráfico">
              <ColumnChart
                data={data.byWeekday.map((d) => ({ ...d, name: DAY_NAMES[d.day].slice(0, 3) }))}
                xKey="name"
                series={viewsSeries}
                format={formatNumber}
                labelFormat={(label) => label}
                highlight={peakDay?.views ? DAY_NAMES[peakDay.day].slice(0, 3) : undefined}
                label="Vistas por día de la semana"
              />
            </ChartCard>
            <ChartCard title="Sitio público vs. interno" subtitle="Inicio e inscripciones frente a dashboard y perfiles">
              <DonutChart
                emptyText="Aún no hay visitas."
                centerLabel="vistas"
                centerValue={formatNumber(data.sections.public + data.sections.internal)}
                format={formatNumber}
                items={[
                  { label: "Sitio público", value: data.sections.public, color: COLORS.visitas },
                  { label: "Dashboard y perfiles", value: data.sections.internal, color: COLORS.visitantes },
                ]}
              />
            </ChartCard>
          </div>

          <ChartCard title="Páginas más vistas" subtitle="Top 10 del periodo">
            <DataTable
              id="paginas-mas-vistas"
              rows={data.topPages}
              columns={pageColumns}
              getRowId={(p) => p.path}
              searchPlaceholder="Buscar página"
              emptyText="Aún no hay visitas en este periodo."
            />
          </ChartCard>
        </>
      )}
    </div>
  );
};

export default Analytics;
