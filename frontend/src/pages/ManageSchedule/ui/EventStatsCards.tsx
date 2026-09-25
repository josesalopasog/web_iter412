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
    <div className="eventStatsGrid">
      <div className="eventStatCard eventStatTotal">
        <div className="eventStatLabel">Eventos programados</div>
        <div className="eventStatValue">{total}</div>
      </div>
      <div className="eventStatCard eventStatOpen">
        <div className="eventStatLabel">💚 Reuniones abiertas</div>
        <div className="eventStatValue">{abiertas}</div>
      </div>
      <div className="eventStatCard eventStatClosed">
        <div className="eventStatLabel">❤️ Reuniones cerradas</div>
        <div className="eventStatValue">{cerradas}</div>
      </div>
      <div className="eventStatCard eventStatRetiro">
        <div className="eventStatLabel">💜 Retiros</div>
        <div className="eventStatValue">{retiros}</div>
      </div>
      <div className="eventStatCard eventStatOther">
        <div className="eventStatLabel">✨ Formación / Otros</div>
        <div className="eventStatValue">{otros}</div>
      </div>
    </div>
  );
};

export default EventStatsCards;
