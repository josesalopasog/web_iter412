import { useEffect, useState } from "react";
import { listMyRatings, rateEvent } from "../../api/events";
import type { CalendarEvent } from "../../api/events";
import { PageLoader } from "../../components/Spinner";
import MonthCalendar from "../Admin/ui/MonthCalendar";
import { eventClass, eventsOn, formatDayTitle, monthOf, todayKey } from "../Admin/ui/calendarUtils";
import StarRating from "../Admin/ui/StarRating";
import BirthdayList, { useBirthdays } from "../Admin/ui/BirthdayList";
import { PageHeading } from "../Admin/ui/PageParts";
import { useDashboardTheme } from "../Admin/useDashboardTheme";
import ProfileTopBar from "./ui/ProfileTopBar";
import "../Admin/styles.css";
import "../Admin/dark.css";
import "./styles.css";
import "./modern.css";

const timeLabel = (e: CalendarEvent) => (e.start ? `${e.start}${e.end ? ` - ${e.end}` : ""}` : "");

type RateBoxProps = {
  event: CalendarEvent;
  onSaved: (stars: number, comment: string) => void;
  onClose: () => void;
};

// Formulario para calificar (o editar la calificación de) una reunión.
const RateBox = ({ event, onSaved, onClose }: RateBoxProps) => {
  const [stars, setStars] = useState(event.myRating?.stars ?? 0);
  const [comment, setComment] = useState(event.myRating?.comment ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const changed = stars !== (event.myRating?.stars ?? 0) || comment !== (event.myRating?.comment ?? "");

  const save = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const saved = await rateEvent(event._id, stars, comment);
      onSaved(saved.stars, saved.comment);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la calificación");
      setIsSaving(false);
    }
  };

  return (
    <div className="rateBox">
      <span className="rateBoxTitle">{event.myRating ? "Editar tu calificación" : "¿Cómo te pareció esta reunión?"}</span>
      <StarRating value={stars} onChange={setStars} label="Tu calificación" />
      <textarea
        className="ratingComment"
        placeholder="Cuéntanos qué te gustó o qué mejorarías (opcional)"
        maxLength={300}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <span className="calEventActions">
        <button type="button" className="toolbarButton primary" disabled={!stars || !changed || isSaving} onClick={save}>
          {isSaving ? "Guardando..." : event.myRating ? "Guardar" : "Calificar"}
        </button>
        <button type="button" className="toolbarButton" onClick={onClose} disabled={isSaving}>
          Cancelar
        </button>
      </span>
      {error && <p className="eventErrorMsg">{error}</p>}
    </div>
  );
};

/**
 * Reuniones para los servidores: el calendario grande y, a la derecha, las reuniones del día
 * (hoy por defecto) y "Tus calificaciones", donde califican o editan lo que ya calificaron.
 */
const Meetings = () => {
  const { theme, toggle } = useDashboardTheme();
  const birthdays = useBirthdays();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [today, setToday] = useState(todayKey());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState(monthOf(todayKey()));
  const [selected, setSelected] = useState<string>(todayKey());
  // Calificación abierta para editar: "dia:<id>" (reuniones del día) o "lista:<id>" (tus calificaciones).
  const [editing, setEditing] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    listMyRatings()
      .then((data) => {
        setEvents(data.events);
        setToday(data.today);
        setSelected(data.today);
        setMonth(monthOf(data.today));
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "No se pudieron cargar las reuniones"))
      .finally(() => setIsLoading(false));
  }, []);

  const dayEvents = eventsOn(events, selected);
  // Primero las que faltan por calificar y luego las calificadas, de la más reciente a la más antigua.
  const myList = events
    .filter((e) => e.ratable)
    .sort((a, b) => Number(Boolean(a.myRating)) - Number(Boolean(b.myRating)) || b.dateISO.localeCompare(a.dateISO));
  const ratedCount = myList.filter((e) => e.myRating).length;
  const pendingCount = myList.length - ratedCount;
  const isToday = selected === today;

  const goTo = (day: string) => {
    setSelected(day);
    setMonth(monthOf(day));
  };

  const handleSaved = (id: string, stars: number, comment: string) => {
    setEvents((prev) => prev.map((e) => (e._id === id ? { ...e, myRating: { stars, comment } } : e)));
    setEditing(null);
    setSavedId(id);
  };

  const rateBox = (e: CalendarEvent, where: "dia" | "lista") =>
    editing === `${where}:${e._id}` ? (
      <RateBox key={`${where}-${e._id}`} event={e} onSaved={(stars, comment) => handleSaved(e._id, stars, comment)} onClose={() => setEditing(null)} />
    ) : null;

  return (
    <div className="adminShell profilePage profileModern">
      <ProfileTopBar title="Reuniones" theme={theme} onToggleTheme={toggle} current="reuniones" />

      <div className="profileBody meetingsRateBody">
        <PageHeading
          crumbs={[{ label: "Mi perfil", to: "/profile" }, { label: "Reuniones" }]}
          title="Reuniones"
          subtitle={
            pendingCount
              ? `Tienes ${pendingCount} ${pendingCount === 1 ? "reunión" : "reuniones"} por calificar en "Tus calificaciones".`
              : "En \"Tus calificaciones\" puedes editar lo que ya calificaste."
          }
        />

        {error && <p className="eventErrorMsg">{error}</p>}
        {isLoading ? (
          <PageLoader variant="inline" label="Cargando reuniones" />
        ) : (
          <MonthCalendar
            events={events}
            month={month}
            onMonth={setMonth}
            today={today}
            selected={selected}
            onSelect={setSelected}
            birthdays={birthdays}
            chipExtra={(e) => (e.myRating ? `${e.myRating.stars}★` : e.ratable ? "•" : null)}
            legend={<span>★ = tu calificación · • = por calificar</span>}
          >
            <div className="calPanelSection">
              <div className="calPanelHead">
                <h3>{isToday ? "Reuniones de hoy" : formatDayTitle(selected)}</h3>
                {!isToday && (
                  <button type="button" className="toolbarButton" onClick={() => goTo(today)}>
                    Hoy
                  </button>
                )}
              </div>
              {dayEvents.length === 0 && <p className="pageEmpty">{isToday ? "Hoy no hay reuniones." : "No hay reuniones este día."}</p>}
              <ul className="calEvents">
                {dayEvents.map((e) => (
                  <li key={e._id} className={`calEvent ${eventClass(e)}`}>
                    <strong>{e.title}</strong>
                    <span className="calEventMeta">{[timeLabel(e), e.location, e.tag].filter(Boolean).join(" · ")}</span>
                    {e.description && <span>{e.description}</span>}
                    {e.ratable ? (
                      editing !== `dia:${e._id}` && (
                        <span className="calEventActions">
                          {e.myRating ? <StarRating value={e.myRating.stars} /> : <span className="statusPill parcial">Por calificar</span>}
                          <button type="button" className="toolbarButton myRatingEdit" onClick={() => setEditing(`dia:${e._id}`)}>
                            {e.myRating ? "Editar" : "Calificar"}
                          </button>
                        </span>
                      )
                    ) : (
                      e.tag !== "Retiro" && e.tag !== "Otro" && <span className="calEventMeta">Podrás calificarla cuando termine{e.end ? ` (${e.end})` : e.start ? ` (${e.start})` : ""}.</span>
                    )}
                    {rateBox(e, "dia")}
                  </li>
                ))}
              </ul>
            </div>

            <BirthdayList birthdays={birthdays} day={selected} />

            <div className="calPanelSection">
              <div className="calPanelHead">
                <h3>Tus calificaciones</h3>
                <span className="calEventMeta">
                  {ratedCount} calificadas{pendingCount ? ` · ${pendingCount} por calificar` : ""}
                </span>
              </div>
              {myList.length === 0 && <p className="pageEmpty">Aún no hay reuniones para calificar.</p>}
              <ul className="myRatings">
                {myList.map((e) => (
                  <li key={e._id} className={e.myRating ? "" : "isPending"}>
                    <button type="button" className="myRatingRow" onClick={() => goTo(e.dateISO)} title="Ver en el calendario">
                      <span className="miniListMain">
                        <span className="miniListTitle">{e.title}</span>
                        <span className="miniListMeta">{formatDayTitle(e.dateISO)}</span>
                      </span>
                      {e.myRating ? <StarRating value={e.myRating.stars} /> : <span className="statusPill parcial">Por calificar</span>}
                    </button>
                    {e.myRating?.comment && editing !== `lista:${e._id}` && <span className="myRatingComment">“{e.myRating.comment}”</span>}
                    {savedId === e._id && !editing && <span className="rateSaved">¡Gracias! Quedó guardada.</span>}
                    {editing === `lista:${e._id}` ? (
                      rateBox(e, "lista")
                    ) : (
                      <button type="button" className="toolbarButton myRatingEdit" onClick={() => setEditing(`lista:${e._id}`)}>
                        {e.myRating ? "Editar" : "Calificar"}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </MonthCalendar>
        )}
      </div>
    </div>
  );
};

export default Meetings;
