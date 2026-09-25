import { API_URL, authedRequest } from "./http";

export type EventTag = "Reunión" | "Retiro" | "Formación" | "Otro";

export type EventRecord = {
  _id: string;
  title: string;
  dateISO: string;
  start?: string;
  end?: string;
  endDateISO?: string;
  location?: string;
  tag?: EventTag;
  description?: string;
  isOpen?: boolean;
  createdAt: string;
};

export type EventInput = Omit<EventRecord, "_id" | "createdAt">;

export const listPublicEvents = async (): Promise<EventRecord[]> => {
  const res = await fetch(`${API_URL}/api/events/public`);
  const data = await res.json().catch(() => []);
  if (!res.ok) {
    const msg = typeof data?.message === "string" ? data.message : "Error de solicitud";
    throw new Error(msg);
  }
  return data as EventRecord[];
};

export const listEvents = () => authedRequest<EventRecord[]>("/api/events");

export const createEvent = (payload: EventInput) =>
  authedRequest<EventRecord>("/api/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateEvent = (id: string, payload: Partial<EventInput>) =>
  authedRequest<EventRecord>(`/api/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteEvent = (id: string) =>
  authedRequest<{ ok: true }>(`/api/events/${id}`, { method: "DELETE" });
