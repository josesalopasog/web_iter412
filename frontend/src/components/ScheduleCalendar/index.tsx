import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";

import { SCHEDULE } from "../../data/schedule.data";
import type { ScheduleEvent } from "../../types/types";
import "./styles.css";

const transformEvents = (events: ScheduleEvent[]) => {
  return events.map((event) => {
    const startISO = event.start
      ? `${event.dateISO}T${event.start}:00`
      : event.dateISO;

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
      id: event.id,
      title: event.title,
      start: startISO,
      end: endISO,
      allDay: !event.start,
      classNames: [eventClass],
    };
  });
};

const ScheduleCalendar = () => {
  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
        }}
        locale="es"
        firstDay={0}
        height="auto"
        events={transformEvents(SCHEDULE)}
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
    </>
  );
};

export default ScheduleCalendar;
