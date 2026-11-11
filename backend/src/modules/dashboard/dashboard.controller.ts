import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/errors.js";
import { dayKeyExpr, getPeriod, parseRange, toDayKey } from "../../utils/dates.js";
import { Soldado } from "../users/soldados/soldado.model.js";
import { Servidor } from "../users/servidores/servidor.model.js";
import { Event } from "../events/event.model.js";
import { getSettings } from "../settings/settings.service.js";
import { getDailyTraffic, getTraffic } from "../analytics/analytics.controller.js";
import { getPaymentMovements } from "../finance/paymentHistory.js";
import { groupTotals } from "../finance/finance.controller.js";

type Gendered = { gender?: string };

const genderCount = (rows: Gendered[]) => {
  const result = { hombres: 0, mujeres: 0, otros: 0 };
  for (const r of rows) {
    if (r.gender === "Hombre" || r.gender === "Masculino") result.hombres += 1;
    else if (r.gender === "Mujer" || r.gender === "Femenino") result.mujeres += 1;
    else result.otros += 1;
  }
  return result;
};

/** Inscripciones por día ("YYYY-MM-DD" → cantidad) de una colección. */
const dailyRegistrations = async (Model: typeof Soldado | typeof Servidor, from: Date, to: Date) => {
  const rows = await (Model as typeof Soldado).aggregate<{ _id: string; count: number }>([
    { $match: { createdAt: { $gte: from, $lt: to } } },
    { $group: { _id: dayKeyExpr, count: { $sum: 1 } } },
  ]);
  return new Map(rows.map((r) => [r._id, r.count]));
};

const countBetween = (Model: typeof Soldado | typeof Servidor, from: Date, to: Date) =>
  (Model as typeof Soldado).countDocuments({ createdAt: { $gte: from, $lt: to } });

/**
 * GET /api/dashboard/summary?range=7|30|90
 * Resumen general del retiro: inscripciones, pagos y visitas de soldados y servidores juntos.
 */
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const range = parseRange(req.query.range);
  if (!range) throw new ApiError(400, "range debe ser 7, 30 o 90");
  const { today, firstDay, from, to, previousFrom, days } = getPeriod(range);

  const [
    settings,
    soldados,
    servidores,
    soldadosNew,
    soldadosPrev,
    servidoresNew,
    servidoresPrev,
    soldadosDaily,
    servidoresDaily,
    traffic,
    trafficPrev,
    trafficDaily,
    movements,
    upcomingEvents,
  ] = await Promise.all([
    getSettings(),
    Soldado.find()
      .select("firstNames lastNames registrationNumber gender city paymentAmount subsidyAmount createdAt")
      .sort({ createdAt: -1 })
      .lean(),
    Servidor.find()
      .select("firstNames lastNames registrationNumber gender city role paymentAmount subsidyAmount merchPaymentAmount serviceStatus createdAt")
      .sort({ createdAt: -1 })
      .lean(),
    countBetween(Soldado, from, to),
    countBetween(Soldado, previousFrom, from),
    countBetween(Servidor, from, to),
    countBetween(Servidor, previousFrom, from),
    dailyRegistrations(Soldado, from, to),
    dailyRegistrations(Servidor, from, to),
    getTraffic(from, to),
    getTraffic(previousFrom, from),
    getDailyTraffic(from, to),
    getPaymentMovements(previousFrom, to),
    Event.find({ $or: [{ dateISO: { $gte: today } }, { endDateISO: { $gte: today } }] })
      .sort({ dateISO: 1, start: 1 })
      .limit(5)
      .lean(),
  ]);

  const activeServidores = servidores.filter((s) => (s.serviceStatus ?? "ACTIVO") === "ACTIVO");
  const soldadoTotals = groupTotals(soldados, settings.soldadoPrice);
  const servidorTotals = groupTotals(activeServidores, settings.servidorPrice);

  // Dinero recibido (pagos de inscripción y de merch) en el periodo y en el anterior.
  const isIncome = (m: (typeof movements)[number]) => m.kind !== "subsidio";
  const incomeOf = (list: typeof movements) => list.filter(isIncome).reduce((total, m) => total + m.delta, 0);
  const current = movements.filter((m) => m.date >= from);
  const previous = movements.filter((m) => m.date < from);
  const paymentsByDay = new Map<string, { soldados: number; servidores: number }>();
  for (const m of current) {
    if (m.kind !== "pago") continue;
    const key = toDayKey(m.date);
    const day = paymentsByDay.get(key) ?? { soldados: 0, servidores: 0 };
    day[m.group] += m.delta;
    paymentsByDay.set(key, day);
  }

  const statusCount = { ACTIVO: 0, INACTIVO: 0, SANTISIMO_NOCTURNO: 0 };
  for (const s of servidores) statusCount[(s.serviceStatus ?? "ACTIVO") as keyof typeof statusCount] += 1;

  const retreatDate = new Date(Date.UTC(settings.retreatYear, settings.retreatMonth - 1, settings.fridayDate));
  const todayDate = new Date(`${today}T00:00:00Z`);
  const daysToRetreat = Math.round((retreatDate.getTime() - todayDate.getTime()) / 86_400_000);

  const recentRegistrations = [
    ...soldados.slice(0, 8).map((s) => ({ ...s, group: "soldados" as const })),
    ...servidores.slice(0, 8).map((s) => ({ ...s, group: "servidores" as const })),
  ]
    .sort((a, b) => new Date(b.createdAt as Date).getTime() - new Date(a.createdAt as Date).getTime())
    .slice(0, 8)
    .map((r) => ({
      _id: String(r._id),
      group: r.group,
      name: `${r.firstNames} ${r.lastNames}`,
      registrationNumber: r.registrationNumber,
      gender: r.gender ?? "",
      city: r.city ?? "",
      paid: r.paymentAmount ?? 0,
      subsidy: r.subsidyAmount ?? 0,
      price: r.group === "soldados" ? settings.soldadoPrice : settings.servidorPrice,
      createdAt: r.createdAt,
    }));

  res.json({
    range,
    from: firstDay,
    to: today,
    retreat: {
      number: settings.retreatNumber,
      friday: settings.fridayDate,
      sunday: settings.sundayDate,
      month: settings.retreatMonth,
      year: settings.retreatYear,
      daysToRetreat,
    },
    kpis: {
      soldados: { total: soldados.length, value: soldadosNew, previous: soldadosPrev },
      servidores: { total: servidores.length, active: activeServidores.length, value: servidoresNew, previous: servidoresPrev },
      registrations: { value: soldadosNew + servidoresNew, previous: soldadosPrev + servidoresPrev },
      income: { value: incomeOf(current), previous: incomeOf(previous) },
      collected: soldadoTotals.paid + servidorTotals.paid,
      expected: soldadoTotals.expected + servidorTotals.expected,
      due: soldadoTotals.due + servidorTotals.due,
      subsidy: { used: soldadoTotals.subsidy + servidorTotals.subsidy, cap: settings.subsidyCap },
      pageViews: { value: traffic.views, previous: trafficPrev.views, visitors: traffic.visitors },
    },
    series: days.map((date) => ({
      date,
      soldados: soldadosDaily.get(date) ?? 0,
      servidores: servidoresDaily.get(date) ?? 0,
      pagosSoldados: paymentsByDay.get(date)?.soldados ?? 0,
      pagosServidores: paymentsByDay.get(date)?.servidores ?? 0,
      views: trafficDaily.get(date)?.views ?? 0,
      visitors: trafficDaily.get(date)?.visitors ?? 0,
    })),
    gender: { soldados: genderCount(soldados), servidores: genderCount(activeServidores) },
    paymentStatus: { soldados: soldadoTotals, servidores: servidorTotals },
    servidoresByStatus: statusCount,
    upcomingEvents: upcomingEvents.map((e) => ({
      _id: String(e._id),
      title: e.title,
      dateISO: e.dateISO,
      endDateISO: e.endDateISO ?? "",
      start: e.start ?? "",
      end: e.end ?? "",
      location: e.location ?? "",
      tag: e.tag,
    })),
    recentRegistrations,
  });
});
