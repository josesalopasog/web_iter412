import { useMemo } from "react";
import { Link } from "react-router-dom";
import { PageLoader } from "../../../../components/Spinner";
import EventStatsCards from "../../../ManageSchedule/ui/EventStatsCards";
import { BarList, ChartCard, ColumnChart, DonutChart } from "../../ui/Charts";
import { COLORS } from "../../ui/colors";
import DataTable, { type DataColumn } from "../../ui/DataTable";
import KpiCard from "../../ui/KpiCard";
import { PageHeading } from "../../ui/PageParts";
import { CalendarIcon, SparklesIcon, UsersIcon } from "../../icons";
import { formatNumber } from "../../format";
import { formatStars, type MeetingRating } from "./exampleRatings";
import { useRatings } from "./useRatings";
import { eventDateLabel, eventTimeLabel, sortEvents, todayKey, useEvents } from "./useEvents";
import "../../../ManageSchedule/styles.css";

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const ratingColumns: DataColumn<MeetingRating>[] = [
  { key: "title", label: "Reunión", className: "cellStrong", render: (r) => r.title, value: (r) => r.title },
  { key: "date", label: "Fecha", className: "cellMuted", render: (r) => r.dateISO, value: (r) => r.dateISO },
  { key: "votes", label: "Votos", align: "right", render: (r) => formatNumber(r.votes), value: (r) => r.votes },
  { key: "avg", label: "Promedio", align: "right", className: "cellStrong", render: (r) => formatStars(r.average), value: (r) => r.average.toFixed(1) },
  {
    key: "comment",
    label: "Comentario destacado",
    className: "cellWrap",
    render: (r) => (r.comments[0] ? `“${r.comments[0].text}”` : "-"),
    value: (r) => r.comments[0]?.text ?? "",
  },
];

// Analítica del cronograma: cuántos eventos hay, cuándo, y cómo califican los servidores las reuniones.
const MeetingsAnalytics = () => {
  const { events, isLoading, error } = useEvents();
  const today = todayKey();
  const sorted = useMemo(() => sortEvents(events), [events]);
  const upcoming = sorted.filter((e) => (e.endDateISO || e.dateISO) >= today);
  const { ratings, isExample } = useRatings(events, today);

  const byMonth = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of events) {
      const key = e.dateISO.slice(0, 7);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, count]) => ({ month: `${MONTHS[Number(key.slice(5, 7)) - 1]} ${key.slice(2, 4)}`, count }));
  }, [events]);

  const byTag = (tag: string) => events.filter((e) => (e.tag ?? "Reunión") === tag).length;
  const totalVotes = ratings.reduce((s, r) => s + r.votes, 0);
  const overall = totalVotes ? ratings.reduce((s, r) => s + r.average * r.votes, 0) / totalVotes : 0;
  const starTotals = [1, 2, 3, 4, 5].map((n) => ({ stars: `${n} ★`, count: ratings.reduce((s, r) => s + r.stars[n - 1], 0) }));
  const best = [...ratings].sort((a, b) => b.average - a.average)[0];
  const comments = ratings.flatMap((r) => r.comments.map((c) => ({ ...c, title: r.title }))).slice(0, 6);

  if (isLoading) return <PageLoader variant="inline" label="Cargando eventos" />;

  return (
    <div className="adPage">
      <PageHeading
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Reuniones" }, { label: "Analítica" }]}
        title="Analítica de reuniones"
        subtitle="Eventos del cronograma y cómo califican los servidores cada reunión."
      >
        <Link to="/dashboard/reuniones/tabla" className="toolbarButton">
          <CalendarIcon /> Ver cronograma
        </Link>
        <Link to="/dashboard/reuniones/nuevo" className="toolbarButton primary">
          <CalendarIcon /> Agregar evento
        </Link>
      </PageHeading>

      {error && <p className="eventErrorMsg">{error}</p>}

      <EventStatsCards events={events} />

      <div className="pageGrid pageGridMain">
        <ChartCard title="Eventos por mes" subtitle="Todo el cronograma">
          <ColumnChart
            data={byMonth}
            xKey="month"
            series={{ key: "count", name: "Eventos", color: COLORS.info }}
            format={formatNumber}
            labelFormat={(label) => label}
            label="Eventos por mes"
          />
        </ChartCard>
        <ChartCard title="Tipos de evento">
          <DonutChart
            emptyText="Aún no hay eventos."
            centerLabel="eventos"
            centerValue={formatNumber(events.length)}
            format={formatNumber}
            items={[
              { label: "Reuniones", value: byTag("Reunión"), color: COLORS.info },
              { label: "Retiros", value: byTag("Retiro"), color: COLORS.todos },
              { label: "Formación", value: byTag("Formación"), color: COLORS.info2 },
              { label: "Otros", value: byTag("Otro"), color: COLORS.inactivo },
            ]}
          />
        </ChartCard>
      </div>

      <ChartCard title="Próximos eventos" subtitle={`${upcoming.length} por venir`}>
        {upcoming.length === 0 ? (
          <p className="pageEmpty">No hay eventos próximos.</p>
        ) : (
          <ul className="miniList">
            {upcoming.slice(0, 6).map((e) => {
              const [, m, d] = e.dateISO.split("-");
              return (
                <li key={e._id}>
                  <span className="dateBadge">
                    <strong>{Number(d)}</strong>
                    <span>{MONTHS[Number(m) - 1]}</span>
                  </span>
                  <span className="miniListMain">
                    <span className="miniListTitle">{e.title}</span>
                    <span className="miniListMeta">
                      {[eventDateLabel(e), eventTimeLabel(e) !== "-" && eventTimeLabel(e), e.location, e.tag].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span className={`statusPill ${e.isOpen ? "completo" : "sinPago"}`}>{e.isOpen ? "Abierta" : "Cerrada"}</span>
                </li>
              );
            })}
          </ul>
        )}
      </ChartCard>

      <div className="sectionDivider">
        <h2>Calificaciones de las reuniones</h2>
        {isExample && <span className="statusPill info">Datos de ejemplo</span>}
        <p>
          {isExample
            ? "Los servidores califican las reuniones desde su perfil (botón del calendario). Mientras nadie califique se muestran calificaciones de ejemplo."
            : "Lo que respondieron los servidores desde su perfil (botón del calendario)."}
        </p>
      </div>

      <div className="kpiGrid">
        <KpiCard tone="info" label="Calificación promedio" icon={SparklesIcon} value={formatStars(overall)} progress={overall / 5} detail="De 1 a 5 estrellas" />
        <KpiCard tone="info" label="Votos" icon={UsersIcon} value={formatNumber(totalVotes)} detail={`${ratings.length} reuniones calificadas`} />
        <KpiCard tone="info" label="Mejor calificada" icon={CalendarIcon} value={best ? formatStars(best.average) : "—"} detail={best?.title} />
        <KpiCard
          tone="info"
          label="Votos de 4 o 5 estrellas"
          icon={SparklesIcon}
          value={`${totalVotes ? Math.round(((starTotals[3].count + starTotals[4].count) / totalVotes) * 100) : 0}%`}
        />
      </div>

      <div className="pageGrid pageGridMain">
        <ChartCard title="Promedio por reunión" subtitle="De la mejor a la peor calificada">
          <BarList
            emptyText="Sin calificaciones."
            color={COLORS.info}
            items={[...ratings]
              .sort((a, b) => b.average - a.average)
              .map((r) => ({ label: r.title, value: r.average, display: formatStars(r.average), detail: `${r.votes} votos` }))}
          />
        </ChartCard>
        <ChartCard title="Distribución de estrellas" subtitle="Todos los votos">
          <ColumnChart
            data={starTotals}
            xKey="stars"
            series={{ key: "count", name: "Votos", color: COLORS.info }}
            format={formatNumber}
            labelFormat={(label) => label}
            label="Votos por cantidad de estrellas"
          />
        </ChartCard>
      </div>

      <div className="pageGrid pageGridSide">
        <ChartCard title="Comentarios recientes" subtitle="Lo que escribieron los servidores">
          <ul className="miniList">
            {comments.map((c, i) => (
              <li key={i}>
                <span className="miniListMain">
                  <span className="miniListTitle">“{c.text}”</span>
                  <span className="miniListMeta">
                    {c.author} · {c.title}
                  </span>
                </span>
                <span className="statusPill info">{c.stars} ★</span>
              </li>
            ))}
          </ul>
        </ChartCard>
        <ChartCard title="Calificaciones por reunión">
          <DataTable
            id="calificaciones-reuniones"
            rows={ratings as MeetingRating[]}
            columns={ratingColumns}
            getRowId={(r) => r.eventId}
            searchPlaceholder="Buscar reunión"
            emptyText="Sin calificaciones."
            pageSize={8}
          />
        </ChartCard>
      </div>
    </div>
  );
};

export default MeetingsAnalytics;
