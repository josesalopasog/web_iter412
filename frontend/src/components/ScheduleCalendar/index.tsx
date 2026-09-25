import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";

import { listPublicEvents } from "../../api/events";
import type { EventRecord } from "../../api/events";
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

const ScheduleCalendar = () => {
  const [events, setEvents] = useState<EventRecord[]>([]);

  useEffect(() => {
    let cancelled = false;
    listPublicEvents()
      .then((data) => {
        if (!cancelled) setEvents(data);
      })
      .catch(() => {
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
        buttonText={{
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
          list: "Lista",
        }}
      />
    </div>
  );
};

export default ScheduleCalendar;
