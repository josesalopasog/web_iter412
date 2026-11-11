import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/errors.js";
import { TIMEZONE, dayKeyExpr, getPeriod, parseRange } from "../../utils/dates.js";
import { PageView } from "./pageView.model.js";

// Secciones del sitio que se agrupan como una sola página (p. ej. cada /participante/... distinto).
const normalizePath = (path: string) => {
  const clean = path.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  if (clean.startsWith("/participante/")) return "/participante";
  return clean;
};

/** POST /api/analytics/track: guarda una visita (público, sin sesión). */
export const trackPageView = asyncHandler(async (req, res) => {
  const { path, visitorId } = (req.body ?? {}) as { path?: unknown; visitorId?: unknown };
  if (typeof path !== "string" || !path.startsWith("/") || path.length > 200) {
    throw new ApiError(400, "Ruta inválida");
  }
  await PageView.create({
    path: normalizePath(path),
    visitorId: typeof visitorId === "string" ? visitorId.slice(0, 64) : "",
  });
  res.status(204).end();
});

/** Vistas y visitantes únicos entre dos fechas. */
export const getTraffic = async (from: Date, to: Date) => {
  const [totals] = await PageView.aggregate<{ views: number; visitors: number }>([
    { $match: { createdAt: { $gte: from, $lt: to } } },
    { $group: { _id: null, views: { $sum: 1 }, visitors: { $addToSet: "$visitorId" } } },
    { $set: { visitors: { $size: "$visitors" } } },
  ]);
  return totals ?? { views: 0, visitors: 0 };
};

/** Vistas y visitantes por día ("YYYY-MM-DD" → datos). */
export const getDailyTraffic = async (from: Date, to: Date) => {
  const daily = await PageView.aggregate<{ _id: string; views: number; visitors: number }>([
    { $match: { createdAt: { $gte: from, $lt: to } } },
    { $group: { _id: dayKeyExpr, views: { $sum: 1 }, visitors: { $addToSet: "$visitorId" } } },
    { $set: { visitors: { $size: "$visitors" } } },
  ]);
  return new Map(daily.map((d) => [d._id, d]));
};

/** GET /api/analytics/summary?range=7|30|90: tráfico del sitio. */
export const getAnalyticsSummary = asyncHandler(async (req, res) => {
  const range = parseRange(req.query.range);
  if (!range) throw new ApiError(400, "range debe ser 7, 30 o 90");
  const { today, firstDay, from, to, previousFrom, days } = getPeriod(range);
  const inRange = { $match: { createdAt: { $gte: from, $lt: to } } };

  const [current, previous, byDay, byHour, byWeekday, topPages, sections] = await Promise.all([
    getTraffic(from, to),
    getTraffic(previousFrom, from),
    getDailyTraffic(from, to),
    PageView.aggregate<{ _id: number; views: number }>([
      inRange,
      { $group: { _id: { $hour: { date: "$createdAt", timezone: TIMEZONE } }, views: { $sum: 1 } } },
    ]),
    PageView.aggregate<{ _id: number; views: number }>([
      inRange, // 1 = domingo ... 7 = sábado
      { $group: { _id: { $dayOfWeek: { date: "$createdAt", timezone: TIMEZONE } }, views: { $sum: 1 } } },
    ]),
    PageView.aggregate<{ _id: string; views: number; visitors: number }>([
      inRange,
      { $group: { _id: "$path", views: { $sum: 1 }, visitors: { $addToSet: "$visitorId" } } },
      { $set: { visitors: { $size: "$visitors" } } },
      { $sort: { views: -1 } },
      { $limit: 10 },
    ]),
    PageView.aggregate<{ _id: boolean; views: number }>([
      inRange, // Sitio público vs. páginas internas (dashboard, perfil...)
      {
        $group: {
          _id: { $regexMatch: { input: "$path", regex: /^\/(dashboard|profile|password|participante)/ } },
          views: { $sum: 1 },
        },
      },
    ]),
  ]);

  const hours = new Map(byHour.map((h) => [h._id, h.views]));
  const weekdays = new Map(byWeekday.map((w) => [w._id, w.views]));

  res.json({
    range,
    from: firstDay,
    to: today,
    kpis: {
      views: { value: current.views, previous: previous.views },
      visitors: { value: current.visitors, previous: previous.visitors },
      viewsPerVisitor: {
        value: current.visitors ? current.views / current.visitors : 0,
        previous: previous.visitors ? previous.views / previous.visitors : 0,
      },
    },
    series: days.map((date) => ({ date, views: byDay.get(date)?.views ?? 0, visitors: byDay.get(date)?.visitors ?? 0 })),
    byHour: Array.from({ length: 24 }, (_, hour) => ({ hour, views: hours.get(hour) ?? 0 })),
    byWeekday: [2, 3, 4, 5, 6, 7, 1].map((day) => ({ day, views: weekdays.get(day) ?? 0 })), // Lunes primero
    topPages: topPages.map((p) => ({ path: p._id, views: p.views, visitors: p.visitors })),
    sections: {
      public: sections.find((s) => !s._id)?.views ?? 0,
      internal: sections.find((s) => s._id)?.views ?? 0,
    },
  });
});
