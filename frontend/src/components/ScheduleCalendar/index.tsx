import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { EventClickArg } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";

import AnimatedBorder from "../AnimatedBorder";
import { listPublicEvents } from "../../api/events";
import type { EventRecord } from "../../api/events";
import { getDemoEvents } from "./demoEvents";
import "./styles.css";

const todayISO = () => new Date().toISOString().slice(0, 10);

const transformEvents = (events: EventRecord[]) => {
  return events.map((event) => {
    const startISO = event.start ? `${event.dateISO}T${event.start}:00` : event.dateISO;

    const endISO =
      event.endDateISO && event.end
        ? `${event.endDateISO}T${event.end}:00`
        : event.end
          ? `${event.dateISO}T${event.end}:00`
          : undefined;

    let eventClass = "";

    if (event.tag === "Retiro") {
      eventClass = "event-retiro";
    } else if (event.isOpen) {
      eventClass = "event-open";
    } else {
      eventClass = "event-closed";
    }

    return {
      id: event._id,
      title: event.title,
      start: startISO,
      end: endISO,
      allDay: !event.start,
      classNames: [eventClass],
    };
  });
};

const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const text = new Date(y, m - 1, d).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const formatWhen = (event: EventRecord) => {
  const multiDay = event.endDateISO && event.endDateISO !== event.dateISO;
  const startDate = formatDate(event.dateISO);
  if (multiDay) {
    const from = event.start ? `${startDate}, ${event.start}` : startDate;
    const endDate = formatDate(event.endDateISO!);
    const to = event.end ? `${endDate}, ${event.end}` : endDate;
    return `${from} — ${to}`;
  }
  if (event.start && event.end) return `${startDate} · ${event.start} – ${event.end}`;
  if (event.start) return `${startDate} · ${event.start}`;
  return `${startDate} · Todo el día`;
};

type EventModalProps = {
  event: EventRecord;
  onClose: () => void;
};

const EventModal = ({ event, onClose }: EventModalProps) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const status =
    event.tag === "Retiro" ? null : event.isOpen ? "Abierta" : "Cerrada";

  // Portal a <body>: el calendario vive dentro de un .reveal con transform, y eso rompe position: fixed.
  return createPortal(
    <div
      className="calEventOverlay notranslate"
      translate="no"
      role="dialog"
      aria-modal="true"
      aria-labelledby="calEventTitle"
      onClick={onClose}
    >
      <div className="calEventCard" onClick={(e) => e.stopPropagation()}>
        <div className="calEventHead">
          <div className="calEventBadges">
            {event.tag && (
              <span className={`calEventBadge ${event.tag === "Retiro" ? "is-retiro" : ""}`}>
                {event.tag}
              </span>
            )}
            {status && (
              <span className={`calEventBadge ${event.isOpen ? "is-open" : "is-closed"}`}>
                {status}
              </span>
            )}
          </div>
          <button type="button" className="calEventClose" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <h3 id="calEventTitle" className="calEventTitle">
          {event.title}
        </h3>

        <dl className="calEventInfo">
          <div>
            <dt>Cuándo</dt>
            <dd>{formatWhen(event)}</dd>
          </div>
          {event.location && (
            <div>
              <dt>Lugar</dt>
              <dd>{event.location}</dd>
            </div>
          )}
        </dl>

        {event.description && <p className="calEventDesc">{event.description}</p>}

        {event.tag === "Retiro" && (
          <div className="calEventCta">
            <AnimatedBorder text="Quiero Inscribirme" href="/inscribirme" />
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

const ScheduleCalendar = () => {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [selected, setSelected] = useState<EventRecord | null>(null);

  const handleEventClick = (info: EventClickArg) => {
    info.jsEvent.preventDefault();
    const found = events.find((e) => e._id === info.event.id);
    if (found) setSelected(found);
  };

  useEffect(() => {
    let cancelled = false;
    // En desarrollo se suman eventos de ejemplo; en producción la lista queda vacía.
    const demo = import.meta.env.DEV ? getDemoEvents() : [];
    listPublicEvents()
      .then((data) => {
        if (!cancelled) setEvents([...data, ...demo]);
      })
      .catch(() => {
        if (!cancelled) setEvents(demo);
        // sin conexión o sin eventos: el calendario simplemente queda vacío
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    // translate="no": los traductores automáticos del navegador reescriben el DOM de FullCalendar
    // y React acaba duplicando los textos ("mesmes", "3030").
    <div translate="no" className="notranslate">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        // Solo presente y futuro: los eventos que ya pasaron se eliminan solos en el backend, y
        // aquí además se bloquea poder navegar hacia meses anteriores.
        validRange={{ start: todayISO() }}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
        }}
        locale="es"
        firstDay={0}
        height="auto"
        events={transformEvents(events)}
        nowIndicator
        eventDisplay="block"
        displayEventTime={true}
        dayMaxEvents={true}
        eventClick={handleEventClick}
        buttonText={{
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
          list: "Lista",
        }}
      />
      {selected && <EventModal event={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default ScheduleCalendar;
