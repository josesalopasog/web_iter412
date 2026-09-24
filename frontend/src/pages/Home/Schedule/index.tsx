import ScheduleCalendar from "../../../components/ScheduleCalendar";
import Reveal from "../../../components/Reveal";
import "./styles.css";

const Schedule = () => {
  return (
    <section id="schedule" aria-label="Horario">
      <div className="container">
        <div className="section-head">
          <Reveal>
            <h2>Cronograma de Reuniones</h2>
          </Reveal>
          <Reveal delay={80}>
            <h3>Próximas reuniones y eventos</h3>
          </Reveal>
          <Reveal delay={160}>
            <p className="sub">
              Aquí encontrarás las fechas y horarios de nuestras próximas
              reuniones y eventos. ¡Asegúrate de marcar tu calendario y unirte a
              nosotros!
            </p>
          </Reveal>
          <Reveal delay={220}>
            <ul className="calendar-list">
              <li>
                <strong>💚 Reunión Abierta:</strong> Son las reuniones que
                cualquiera puede venir a participar.
              </li>
              <li>
                <strong>❤️ Reunión Cerrada:</strong> Son las reuniones que solo
                pueden asistir los miembros activos del grupo.
              </li>
              <li>
                <strong>💜 Retiro:</strong> Es el mejor fin de semana de tu vida. (Requiere inscripción)
              </li>
            </ul>
          </Reveal>
          <Reveal delay={280}>
            <div className="card span-8">
              <ScheduleCalendar />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
export default Schedule;
