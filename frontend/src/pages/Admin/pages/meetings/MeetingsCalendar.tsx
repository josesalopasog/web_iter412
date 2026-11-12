import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deleteEvent } from "../../../../api/events";
import type { EventRecord } from "../../../../api/events";
import { PageLoader } from "../../../../components/Spinner";
import ConfirmDeleteEventModal from "../../../ManageSchedule/ui/ConfirmDeleteEventModal";
import MonthCalendar from "../../ui/MonthCalendar";
import BirthdayList, { useBirthdays } from "../../ui/BirthdayList";
import { eventClass, eventsOn, formatDayTitle, monthOf } from "../../ui/calendarUtils";
import StarRating from "../../ui/StarRating";
import { PageHeading } from "../../ui/PageParts";
import { CalendarIcon, ChartBarIcon, TrashIcon } from "../../icons";
import { formatStars } from "./exampleRatings";
import { eventTimeLabel, todayKey, useEvents } from "./useEvents";
import { useRatings } from "./useRatings";
import "../../../ManageSchedule/styles.css";

// Cronograma de reuniones como calendario: elegir un día muestra sus eventos para editarlos o
// borrarlos, y desde ahí se agregan eventos nuevos.
const MeetingsCalendar = () => {
  const navigate = useNavigate();
  const today = todayKey();
  const { events, setEvents, isLoading, error } = useEvents();
  const { ratings, isExample } = useRatings(events, today);
  const birthdays = useBirthdays();
  const ratingsById = useMemo(() => new Map(ratings.map((r) => [r.eventId, r])), [ratings]);
  const [month, setMonth] = useState(monthOf(today));
  const [selected, setSelected] = useState<string | null>(today);
  const [deleting, setDeleting] = useState<EventRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const dayEvents = selected ? eventsOn(events, selected) : [];

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await deleteEvent(deleting._id);
      setEvents((prev) => prev.filter((e) => e._id !== deleting._id));
      setDeleting(null);
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Error eliminando el evento");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <PageLoader variant="inline" label="Cargando eventos" />;

  return (
    <div className="adPage">
      <PageHeading
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Reuniones" }, { label: "Cronograma" }]}
        title="Cronograma de reuniones"
        subtitle="Elige un día para ver, editar o eliminar sus eventos, o para agregar uno nuevo."
      >
        <Link to="/dashboard/reuniones" className="toolbarButton">
          <ChartBarIcon /> Ver analítica
        </Link>
        <Link to={`/dashboard/reuniones/nuevo${selected ? `?fecha=${selected}` : ""}`} className="toolbarButton primary">
          <CalendarIcon /> Agregar evento
        </Link>
      </PageHeading>

      {(error || deleteError) && <p className="eventErrorMsg">{error ?? deleteError}</p>}

      <MonthCalendar
        events={events}
        month={month}
        onMonth={setMonth}
        today={today}
        selected={selected}
        onSelect={setSelected}
        birthdays={birthdays}
        chipExtra={(e) => {
          const r = ratingsById.get(e._id);
          return r && !isExample ? `${r.average.toFixed(1).replace(".", ",")}★` : null;
        }}
      >
        {!selected ? (
          <p className="pageEmpty">Elige un día para ver sus eventos.</p>
        ) : (
          <>
            <div className="calPanelHead">
              <h3>{formatDayTitle(selected)}</h3>
              <button type="button" className="toolbarButton primary" onClick={() => navigate(`/dashboard/reuniones/nuevo?fecha=${selected}`)}>
                <CalendarIcon /> Nuevo
              </button>
            </div>
            <BirthdayList birthdays={birthdays} day={selected} />
            {dayEvents.length === 0 && <p className="pageEmpty">No hay eventos este día.</p>}
            <ul className="calEvents">
              {dayEvents.map((e) => {
                const r = ratingsById.get(e._id);
                return (
                  <li key={e._id} className={`calEvent ${eventClass(e)}`}>
                    <strong>{e.title}</strong>
                    <span className="calEventMeta">
                      {[eventTimeLabel(e) !== "-" && eventTimeLabel(e), e.location, e.tag].filter(Boolean).join(" · ")}
                    </span>
                    {e.description && <span>{e.description}</span>}
                    <span className="calEventActions">
                      <span className={`statusPill ${e.isOpen ? "completo" : "sinPago"}`}>{e.isOpen ? "Abierta" : "Cerrada"}</span>
                      {r && (
                        <span className="statusPill info" title={isExample ? "Calificación de ejemplo" : `${r.votes} votos`}>
                          {formatStars(r.average)} · {r.votes} {isExample ? "(ejemplo)" : "votos"}
                        </span>
                      )}
                    </span>
                    {r && !isExample && <StarRating value={Math.round(r.average)} />}
                    <span className="calEventActions">
                      <button type="button" className="toolbarButton" onClick={() => navigate(`/dashboard/reuniones/evento/${e._id}`)}>
                        Editar
                      </button>
                      <button type="button" className="toolbarButton" onClick={() => setDeleting(e)}>
                        <TrashIcon /> Eliminar
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </MonthCalendar>

      {deleting && (
        <ConfirmDeleteEventModal title={deleting.title} isDeleting={isDeleting} onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
      )}
    </div>
  );
};

export default MeetingsCalendar;
