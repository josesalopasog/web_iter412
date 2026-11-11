import KpiCard from "../../Admin/ui/KpiCard";
import { CalendarIcon, CheckCircleIcon, ClockIcon, MountainIcon, SparklesIcon } from "../../Admin/icons";
import type { EventRecord } from "../../../api/events";

type Props = {
  events: EventRecord[];
};

const EventStatsCards: React.FC<Props> = ({ events }) => {
  const total = events.length;
  const abiertas = events.filter((e) => e.tag === "Reunión" && e.isOpen).length;
  const cerradas = events.filter((e) => e.tag === "Reunión" && !e.isOpen).length;
  const retiros = events.filter((e) => e.tag === "Retiro").length;
  const otros = events.filter((e) => e.tag === "Formación" || e.tag === "Otro").length;

  return (
    <div className="kpiGrid eventKpiGrid">
      <KpiCard tone="info" label="Eventos programados" icon={CalendarIcon} value={total} />
      <KpiCard tone="info" label="Reuniones abiertas" icon={CheckCircleIcon} value={abiertas} />
      <KpiCard tone="info" label="Reuniones cerradas" icon={ClockIcon} value={cerradas} />
      <KpiCard tone="todos" label="Retiros" icon={MountainIcon} value={retiros} />
      <KpiCard tone="info" label="Formación / Otros" icon={SparklesIcon} value={otros} />
    </div>
  );
};

export default EventStatsCards;
