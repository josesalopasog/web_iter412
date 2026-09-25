import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/errors.js";
import { createLog } from "../activityLog/createLog.js";
import { Event } from "./event.model.js";
import { EVENT_TAGS } from "./event.types.js";
import type { EventDTO } from "./event.types.js";

const isEmpty = (v: unknown) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");

const isValidISODate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

const isValidTime = (v: unknown): v is string => typeof v === "string" && /^\d{2}:\d{2}$/.test(v);

// Hora local del servidor (no UTC), para que coincida con cómo se interpretan dateISO/start/end
// más abajo (new Date("YYYY-MM-DDTHH:MM:00") sin "Z" = hora local).
const todayISO = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// Momento en el que un evento deja de ser vigente: el final de su día (o de su end/endDateISO, si los tiene).
const effectiveEndMs = (event: { dateISO: string; endDateISO?: string; end?: string }) => {
  const dateISO = event.endDateISO || event.dateISO;
  const time = event.end || "23:59";
  return new Date(`${dateISO}T${time}:00`).getTime();
};

// Los eventos que ya pasaron se eliminan solos: no hay que revisarlos ni archivarlos a mano.
const purgePastEvents = async () => {
  const now = Date.now();
  const events = await Event.find().select("dateISO endDateISO end");
  const expiredIds = events.filter((e) => effectiveEndMs(e) < now).map((e) => e._id);
  if (expiredIds.length) {
    await Event.deleteMany({ _id: { $in: expiredIds } });
  }
};

const validateEventBody = (body: Partial<EventDTO>, { partial = false }: { partial?: boolean } = {}) => {
  if (!partial || body.title !== undefined) {
    if (isEmpty(body.title)) throw new ApiError(400, "El título es obligatorio");
  }
  if (!partial || body.dateISO !== undefined) {
    if (!isValidISODate(body.dateISO)) throw new ApiError(400, "Fecha inválida");
    if (body.dateISO! < todayISO()) throw new ApiError(400, "No se puede programar un evento en el pasado");
  }
  if (body.endDateISO && !isValidISODate(body.endDateISO)) {
    throw new ApiError(400, "Fecha de fin inválida");
  }
  if (body.endDateISO && body.endDateISO < todayISO()) {
    throw new ApiError(400, "La fecha de fin no puede ser en el pasado");
  }
  if (body.start && !isValidTime(body.start)) throw new ApiError(400, "Hora de inicio inválida");
  if (body.end && !isValidTime(body.end)) throw new ApiError(400, "Hora de fin inválida");
  if (body.tag !== undefined && !EVENT_TAGS.includes(body.tag as (typeof EVENT_TAGS)[number])) {
    throw new ApiError(400, "Etiqueta inválida");
  }
};

export const listPublicEvents = asyncHandler(async (_req, res) => {
  await purgePastEvents();
  const events = await Event.find().sort({ dateISO: 1, start: 1 });
  res.json(events);
});

export const listEvents = asyncHandler(async (_req, res) => {
  await purgePastEvents();
  const events = await Event.find().sort({ dateISO: 1, start: 1 });
  res.json(events);
});

export const createEvent = asyncHandler(async (req, res) => {
  const body = req.body as Partial<EventDTO>;
  validateEventBody(body);

  const event = await Event.create({
    title: body.title,
    dateISO: body.dateISO,
    start: body.start || "",
    end: body.end || "",
    endDateISO: body.endDateISO || "",
    location: body.location || "",
    tag: body.tag || "Reunión",
    description: body.description || "",
    isOpen: body.isOpen === undefined ? true : Boolean(body.isOpen),
  });

  await createLog(req.user!, "CREAR_EVENTO", `Creó el evento "${event.title}" (${event.dateISO})`);

  res.status(201).json(event);
});

export const updateEvent = asyncHandler(async (req, res) => {
  const body = req.body as Partial<EventDTO>;
  validateEventBody(body, { partial: true });

  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, "Evento no encontrado");

  const fields: (keyof EventDTO)[] = [
    "title",
    "dateISO",
    "start",
    "end",
    "endDateISO",
    "location",
    "tag",
    "description",
    "isOpen",
  ];
  for (const field of fields) {
    if (body[field] !== undefined) (event as any)[field] = body[field];
  }

  await event.save();

  await createLog(req.user!, "EDITAR_EVENTO", `Editó el evento "${event.title}" (${event.dateISO})`);

  res.json(event);
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, "Evento no encontrado");

  await event.deleteOne();

  await createLog(req.user!, "ELIMINAR_EVENTO", `Eliminó el evento "${event.title}" (${event.dateISO})`);

  res.json({ ok: true });
});
