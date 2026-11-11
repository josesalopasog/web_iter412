import { useMemo } from "react";
import { Link } from "react-router-dom";
import { VOICE_SPACE_LABELS, VOICE_TARGET_LABELS, VOICE_TYPE_LABELS, VOICE_VISIBILITY_LABELS } from "../../../../api/voice";
import type { VoiceType } from "../../../../api/voice";
import { PageLoader } from "../../../../components/Spinner";
import KpiCard from "../../ui/KpiCard";
import { BarList, ChartCard, ChartLegend, DonutChart, StackedBars } from "../../ui/Charts";
import { COLORS } from "../../ui/colors";
import { PageHeading } from "../../ui/PageParts";
import { BellIcon, ClipboardIcon, HandHeartIcon, SparklesIcon, UsersIcon } from "../../icons";
import { dayKeyOf, formatDateTime, formatNumber, formatPercent, lastDays } from "../../format";
import { useVoice } from "./useVoice";

const TYPE_COLORS: Record<VoiceType, string> = {
  SUGERENCIA: COLORS.info,
  ACTIVIDAD: COLORS.info2,
  ORACION: COLORS.todos,
};

const typeSeries = (Object.keys(VOICE_TYPE_LABELS) as VoiceType[]).map((t) => ({ key: t, name: VOICE_TYPE_LABELS[t], color: TYPE_COLORS[t] }));

// Análisis de "Tu voz en ITER": qué comparten los servidores, cuánto, a quién y qué falta por leer.
const VoiceAnalytics = () => {
  const { entries, isLoading, error } = useVoice();

  const byDay = useMemo(() => {
    const days = lastDays(30);
    const map = new Map(days.map((d) => [d, { date: d, SUGERENCIA: 0, ACTIVIDAD: 0, ORACION: 0 } as Record<string, string | number>]));
    for (const e of entries) {
      const point = map.get(dayKeyOf(e.createdAt));
      if (point) point[e.type] = Number(point[e.type]) + 1;
    }
    return [...map.values()];
  }, [entries]);

  if (isLoading) return <PageLoader variant="inline" label="Cargando respuestas" />;

  const count = (fn: (e: (typeof entries)[number]) => boolean) => entries.filter(fn).length;
  const total = entries.length;
  const unread = count((e) => e.status === "NUEVO");
  const anonymous = count((e) => e.anonymous);
  const last30 = byDay.reduce((s, d) => s + Number(d.SUGERENCIA) + Number(d.ACTIVIDAD) + Number(d.ORACION), 0);

  const topicCounts = new Map<string, number>();
  for (const e of entries) {
    const key = e.topic.trim().toLowerCase();
    if (key) topicCounts.set(key, (topicCounts.get(key) ?? 0) + 1);
  }
  const topTopics = [...topicCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const pendingPrayers = entries.filter((e) => e.type === "ORACION" && e.status === "NUEVO").slice(0, 5);

  return (
    <div className="adPage">
      <PageHeading
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Tu voz en ITER" }, { label: "Análisis" }]}
        title="Tu voz en ITER"
        subtitle="Sugerencias, actividades y peticiones de oración que comparten los servidores desde su perfil."
      >
        <Link to="/dashboard/tu-voz/respuestas" className="toolbarButton primary">
          <ClipboardIcon /> Ver respuestas
        </Link>
      </PageHeading>

      {error && <p className="eventErrorMsg">{error}</p>}

      <div className="kpiGrid">
        <KpiCard tone="info" label="Mensajes recibidos" icon={BellIcon} value={formatNumber(total)} detail={`${formatNumber(last30)} en los últimos 30 días`} />
        <KpiCard tone="info" label="Por leer" icon={ClipboardIcon} value={formatNumber(unread)} progress={total ? (total - unread) / total : 0} detail={`${formatNumber(total - unread)} leídos o atendidos`} />
        <KpiCard tone="todos" label="Peticiones de oración" icon={HandHeartIcon} value={formatNumber(count((e) => e.type === "ORACION"))} detail={`${formatNumber(count((e) => e.type === "ORACION" && e.visibility === "COMUNIDAD"))} para toda la comunidad`} />
        <KpiCard tone="info" label="Anónimos" icon={UsersIcon} value={formatNumber(anonymous)} detail={`${formatPercent(total ? anonymous / total : 0)} de los mensajes`} />
      </div>

      <div className="pageGrid pageGridMain">
        <ChartCard title="Mensajes por día" subtitle="Últimos 30 días" headline={formatNumber(last30)}>
          <ChartLegend items={typeSeries.map((s) => ({ label: s.name, color: s.color, value: formatNumber(count((e) => e.type === s.key)) }))} />
          <StackedBars data={byDay} series={typeSeries} format={formatNumber} label="Mensajes por día y tipo" height={240} />
        </ChartCard>
        <ChartCard title="¿Qué comparten?">
          <DonutChart
            emptyText="Aún no hay mensajes."
            centerLabel="mensajes"
            centerValue={formatNumber(total)}
            format={formatNumber}
            items={typeSeries.map((s) => ({ label: s.name, value: count((e) => e.type === s.key), color: s.color }))}
          />
        </ChartCard>
      </div>

      <div className="pageGrid pageGridThird">
        <ChartCard title="Estado" subtitle="Lo que falta por leer o atender">
          <BarList
            emptyText="Aún no hay mensajes."
            items={[
              { label: "Nuevos", value: unread, display: formatNumber(unread), color: COLORS.negativo },
              { label: "Leídos", value: count((e) => e.status === "LEIDO"), display: formatNumber(count((e) => e.status === "LEIDO")), color: COLORS.info },
              { label: "Atendidos", value: count((e) => e.status === "ATENDIDO"), display: formatNumber(count((e) => e.status === "ATENDIDO")), color: COLORS.positivo },
            ]}
          />
        </ChartCard>
        <ChartCard title="Sugerencias dirigidas a">
          <BarList
            emptyText="Aún no hay sugerencias."
            color={COLORS.info}
            items={(Object.keys(VOICE_TARGET_LABELS) as (keyof typeof VOICE_TARGET_LABELS)[]).map((t) => {
              const n = count((e) => e.type === "SUGERENCIA" && e.target === t);
              return { label: VOICE_TARGET_LABELS[t], value: n, display: formatNumber(n) };
            })}
          />
        </ChartCard>
        <ChartCard title="Ideas de actividades">
          <BarList
            emptyText="Aún no hay ideas."
            color={COLORS.info2}
            items={(Object.keys(VOICE_SPACE_LABELS) as (keyof typeof VOICE_SPACE_LABELS)[]).map((sp) => {
              const n = count((e) => e.type === "ACTIVIDAD" && e.space === sp);
              return { label: VOICE_SPACE_LABELS[sp], value: n, display: formatNumber(n) };
            })}
          />
        </ChartCard>
      </div>

      <div className="pageGrid pageGridHalf">
        <ChartCard title="Temas más mencionados" subtitle="De sugerencias y actividades">
          <BarList
            emptyText="Aún no hay temas."
            color={COLORS.info}
            items={topTopics.map(([label, value]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), value, display: formatNumber(value) }))}
          />
        </ChartCard>
        <ChartCard title="Peticiones de oración sin leer" subtitle="Para tenerlas presentes">
          {pendingPrayers.length === 0 ? (
            <p className="pageEmpty">No hay peticiones nuevas.</p>
          ) : (
            <ul className="miniList">
              {pendingPrayers.map((e) => (
                <li key={e._id}>
                  <span className="miniListMain">
                    <span className="miniListTitle">{e.text}</span>
                    <span className="miniListMeta">
                      {e.anonymous ? "Anónimo" : e.userName} · {e.visibility ? VOICE_VISIBILITY_LABELS[e.visibility] : ""} · {formatDateTime(e.createdAt)}
                    </span>
                  </span>
                  <SparklesIcon width={16} height={16} />
                </li>
              ))}
            </ul>
          )}
          <Link to="/dashboard/tu-voz/respuestas" className="cardLink">
            Ver todas las respuestas →
          </Link>
        </ChartCard>
      </div>
    </div>
  );
};

export default VoiceAnalytics;
