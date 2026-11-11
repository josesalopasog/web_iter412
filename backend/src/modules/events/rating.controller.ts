import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/errors.js";
import { Event } from "./event.model.js";
import { Rating } from "./rating.model.js";
import { todayISO } from "./event.controller.js";

// Solo las reuniones y formaciones se califican (el retiro y "otros" no).
const RATABLE_TAGS = ["Reunión", "Formación"];

/**
 * GET /api/events/ratings/mine
 * Eventos del calendario para el servidor, con su calificación (si ya calificó) y si ya se puede
 * calificar (el día del evento o después).
 */
export const listMyRatings = asyncHandler(async (req, res) => {
  const [events, mine] = await Promise.all([
    Event.find().sort({ dateISO: 1, start: 1 }).lean(),
    Rating.find({ userId: req.user!.sub }).lean(),
  ]);
  const byEvent = new Map(mine.map((r) => [String(r.eventId), r]));
  const today = todayISO();
  res.json({
    today,
    events: events.map((e) => {
      const rating = byEvent.get(String(e._id));
      return {
        _id: String(e._id),
        title: e.title,
        dateISO: e.dateISO,
        endDateISO: e.endDateISO ?? "",
        start: e.start ?? "",
        end: e.end ?? "",
        location: e.location ?? "",
        tag: e.tag,
        description: e.description ?? "",
        isOpen: e.isOpen,
        ratable: RATABLE_TAGS.includes(String(e.tag)) && e.dateISO <= today,
        myRating: rating ? { stars: rating.stars, comment: rating.comment ?? "" } : null,
      };
    }),
  });
});

/** PUT /api/events/:id/rating  { stars: 1-5, comment?: string } */
export const rateEvent = asyncHandler(async (req, res) => {
  const { stars, comment } = (req.body ?? {}) as { stars?: unknown; comment?: unknown };
  const value = Number(stars);
  if (!Number.isInteger(value) || value < 1 || value > 5) throw new ApiError(400, "La calificación debe ser de 1 a 5 estrellas");
  if (comment !== undefined && (typeof comment !== "string" || comment.length > 300)) {
    throw new ApiError(400, "El comentario puede tener máximo 300 caracteres");
  }

  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, "Evento no encontrado");
  if (!RATABLE_TAGS.includes(String(event.tag))) throw new ApiError(400, "Este evento no se califica");
  if (event.dateISO > todayISO()) throw new ApiError(400, "Podrás calificar la reunión el día que se haga");

  const user = req.user!;
  const rating = await Rating.findOneAndUpdate(
    { eventId: event._id, userId: user.sub },
    {
      stars: value,
      comment: typeof comment === "string" ? comment.trim() : "",
      userName: `${user.firstNames} ${user.lastNames}`,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.json({ stars: rating.stars, comment: rating.comment ?? "" });
});

/**
 * GET /api/events/ratings/summary (admins)
 * Promedio, votos y estrellas por evento, más los comentarios recientes.
 */
export const getRatingsSummary = asyncHandler(async (_req, res) => {
  const [events, ratings] = await Promise.all([
    Event.find({ tag: { $in: RATABLE_TAGS } }).lean(),
    Rating.find().sort({ updatedAt: -1 }).lean(),
  ]);
  const eventsById = new Map(events.map((e) => [String(e._id), e]));

  const grouped = new Map<string, { stars: [number, number, number, number, number]; votes: number; total: number }>();
  for (const r of ratings) {
    const key = String(r.eventId);
    if (!eventsById.has(key)) continue;
    const g = grouped.get(key) ?? { stars: [0, 0, 0, 0, 0] as [number, number, number, number, number], votes: 0, total: 0 };
    g.stars[r.stars - 1] += 1;
    g.votes += 1;
    g.total += r.stars;
    grouped.set(key, g);
  }

  res.json({
    events: [...grouped.entries()].map(([id, g]) => {
      const e = eventsById.get(id)!;
      return {
        eventId: id,
        title: e.title,
        dateISO: e.dateISO,
        votes: g.votes,
        average: g.total / g.votes,
        stars: g.stars,
        comments: ratings
          .filter((r) => String(r.eventId) === id && r.comment)
          .slice(0, 5)
          .map((r) => ({ author: r.userName, stars: r.stars, text: r.comment })),
      };
    }),
  });
});
