import { useCallback, useEffect, useState } from "react";
import { listEvents } from "../../../../api/events";
import type { EventRecord } from "../../../../api/events";

/** Eventos del cronograma (reuniones, retiros, formaciones). */
export const useEvents = () => {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(
    () =>
      listEvents()
        .then((data) => {
          setEvents(data);
          setError(null);
        })
        .catch((err: unknown) => setError(err instanceof Error ? err.message : "Error cargando el cronograma"))
        .finally(() => setIsLoading(false)),
    []
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return { events, setEvents, isLoading, error, reload };
};

export const sortEvents = (events: EventRecord[]) =>
  [...events].sort((a, b) => a.dateISO.localeCompare(b.dateISO) || (a.start ?? "").localeCompare(b.start ?? ""));

export const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const formatEventDate = (iso: string) => {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
};

export const eventDateLabel = (e: EventRecord) =>
  e.endDateISO ? `${formatEventDate(e.dateISO)} - ${formatEventDate(e.endDateISO)}` : formatEventDate(e.dateISO);

export const eventTimeLabel = (e: EventRecord) => (e.start ? `${e.start}${e.end ? ` - ${e.end}` : ""}` : "-");
