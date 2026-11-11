import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listMyRatings } from "../../../api/events";
import type { CalendarEvent } from "../../../api/events";
import MonthCalendar from "../../Admin/ui/MonthCalendar";
import { eventClass, eventsOn, formatDayTitle, monthOf, todayKey } from "../../Admin/ui/calendarUtils";

const MEETING_TAGS = ["Reunión", "Formación"];
const timeLabel = (e: CalendarEvent) => (e.start ? `${e.start}${e.end ? ` - ${e.end}` : ""}` : "");

// Calendario del perfil: solo las reuniones, y el botón para ir a calificarlas.
const ProfileMeetingsCard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [today, setToday] = useState(todayKey());
  const [month, setMonth] = useState(monthOf(todayKey()));
  const [selected, setSelected] = useState(todayKey());

  useEffect(() => {
    listMyRatings()
      .then((data) => {
        setEvents(data.events.filter((e) => MEETING_TAGS.includes(e.tag ?? "Reunión")));
        setToday(data.today);
      })
      .catch(() => setEvents([]));
  }, []);

  const pending = useMemo(() => events.filter((e) => e.ratable && !e.myRating).length, [events]);
  // Si el día elegido no tiene reuniones, se muestra la siguiente.
  const dayEvents = eventsOn(events, selected);
  const next = events.find((e) => (e.endDateISO || e.dateISO) >= today);

  return (
    <div className="profileSection meetingsCard" data-tour="meetings">
      <div className="meetingsCardHead">
        <h3>Calendario de reuniones</h3>
        <button type="button" className="toolbarButton primary" onClick={() => navigate("/profile/reuniones")}>
          ⭐ Calificar reuniones
          {pending > 0 && <span className="meetingsCardBadge">{pending}</span>}
        </button>
      </div>

      <MonthCalendar events={events} month={month} onMonth={setMonth} today={today} selected={selected} onSelect={setSelected} compact />

      <div className="meetingsCardDay">
        <strong>{selected === today ? "Hoy" : formatDayTitle(selected)}</strong>
        {dayEvents.length ? (
          <ul className="calEvents">
            {dayEvents.map((e) => (
              <li key={e._id} className={`calEvent ${eventClass(e)}`}>
                <strong>{e.title}</strong>
                <span className="calEventMeta">{[timeLabel(e), e.location].filter(Boolean).join(" · ")}</span>
              </li>
            ))}
          </ul>
        ) : (
          <span className="calEventMeta">
            No hay reuniones este día.
            {next && (
              <>
                {" "}
                La próxima es <strong>{next.title}</strong> el {formatDayTitle(next.dateISO).toLowerCase()}.
              </>
            )}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProfileMeetingsCard;
