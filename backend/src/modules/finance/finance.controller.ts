import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/errors.js";
import { getPeriod, parseRange, toDayKey } from "../../utils/dates.js";
import { Soldado } from "../users/soldados/soldado.model.js";
import { Servidor } from "../users/servidores/servidor.model.js";
import { computeMerchMax } from "../users/servidores/servidor.controller.js";
import { getSettings } from "../settings/settings.service.js";
import { getPaymentMovements } from "./paymentHistory.js";

type Person = {
  _id: unknown;
  firstNames: string;
  lastNames: string;
  registrationNumber: number;
  gender?: string;
  paymentAmount?: number;
  subsidyAmount?: number;
};

type MerchInput = Parameters<typeof computeMerchMax>[0];

const sum = <T>(rows: T[], pick: (row: T) => number) => rows.reduce((total, row) => total + (pick(row) || 0), 0);

/** Totales de un grupo: lo esperado, lo pagado, el subsidio y cuántos van al día. */
export const groupTotals = (rows: Person[], price: number) => {
  const paid = sum(rows, (r) => r.paymentAmount ?? 0);
  const subsidy = sum(rows, (r) => r.subsidyAmount ?? 0);
  const expected = rows.length * price;
  const status = { completo: 0, parcial: 0, sinPago: 0 };
  for (const r of rows) {
    const covered = (r.paymentAmount ?? 0) + (r.subsidyAmount ?? 0);
    if (price > 0 && covered >= price) status.completo += 1;
    else if (covered > 0) status.parcial += 1;
    else status.sinPago += 1;
  }
  return { count: rows.length, price, expected, paid, subsidy, due: Math.max(0, expected - paid - subsidy), status };
};

/** Personas a las que les falta por pagar. */
const debtorsOf = (rows: Person[], price: number, group: "soldados" | "servidores") =>
  rows
    .map((r) => ({
      _id: String(r._id),
      group,
      name: `${r.firstNames} ${r.lastNames}`,
      registrationNumber: r.registrationNumber,
      paid: r.paymentAmount ?? 0,
      subsidy: r.subsidyAmount ?? 0,
      due: Math.max(0, price - (r.paymentAmount ?? 0) - (r.subsidyAmount ?? 0)),
    }))
    .filter((r) => r.due > 0);

/** GET /api/finance/summary?range=7|30|90: dinero del retiro (inscripciones, subsidio y merch). */
export const getFinanceSummary = asyncHandler(async (req, res) => {
  const range = parseRange(req.query.range);
  if (!range) throw new ApiError(400, "range debe ser 7, 30 o 90");
  const { today, firstDay, from, to, previousFrom, days } = getPeriod(range);

  const [settings, soldados, servidores, movements] = await Promise.all([
    getSettings(),
    Soldado.find().select("firstNames lastNames registrationNumber gender paymentAmount subsidyAmount").lean(),
    Servidor.find()
      .select(
        "firstNames lastNames registrationNumber gender paymentAmount subsidyAmount merchPaymentAmount needsShirt shirtSize shirtColors merchItems merchSize serviceStatus"
      )
      .lean(),
    getPaymentMovements(previousFrom, to),
  ]);

  // Igual que en la tabla: por defecto solo cuentan los servidores activos para el retiro.
  const activeServidores = servidores.filter((s) => (s.serviceStatus ?? "ACTIVO") === "ACTIVO");
  const soldadoTotals = groupTotals(soldados as Person[], settings.soldadoPrice);
  const servidorTotals = groupTotals(activeServidores as Person[], settings.servidorPrice);

  const merchMaxes = servidores.map((s) => computeMerchMax(s as MerchInput, settings));
  const merchExpected = sum(merchMaxes, (m) => m);
  const merchPaid = sum(servidores, (s) => s.merchPaymentAmount ?? 0);
  const merchOrders = merchMaxes.filter((m) => m > 0).length;

  const subsidyUsed = sum(soldados, (s) => s.subsidyAmount ?? 0) + sum(servidores, (s) => s.subsidyAmount ?? 0);

  // Dinero que entró (pagos y merch; el subsidio no es dinero recibido).
  const income = (list: typeof movements) => sum(list.filter((m) => m.kind !== "subsidio"), (m) => m.delta);
  const current = movements.filter((m) => m.date >= from);
  const previous = movements.filter((m) => m.date < from);

  const byDay = new Map<string, { soldados: number; servidores: number; merch: number; subsidio: number }>();
  for (const m of current) {
    const key = toDayKey(m.date);
    const day = byDay.get(key) ?? { soldados: 0, servidores: 0, merch: 0, subsidio: 0 };
    if (m.kind === "merch") day.merch += m.delta;
    else if (m.kind === "subsidio") day.subsidio += m.delta;
    else day[m.group] += m.delta;
    byDay.set(key, day);
  }

  const expectedTotal = soldadoTotals.expected + servidorTotals.expected;
  const paidTotal = soldadoTotals.paid + servidorTotals.paid;
  const subsidyTotal = soldadoTotals.subsidy + servidorTotals.subsidy;

  res.json({
    range,
    from: firstDay,
    to: today,
    settings: {
      soldadoPrice: settings.soldadoPrice,
      servidorPrice: settings.servidorPrice,
      subsidyCap: settings.subsidyCap,
    },
    kpis: {
      income: { value: income(current), previous: income(previous) },
      paid: paidTotal,
      expected: expectedTotal,
      due: soldadoTotals.due + servidorTotals.due,
      collectionRate: expectedTotal ? Math.min(1, (paidTotal + subsidyTotal) / expectedTotal) : 0,
      subsidy: { used: subsidyUsed, cap: settings.subsidyCap },
      merch: { expected: merchExpected, paid: merchPaid, orders: merchOrders },
      movements: current.filter((m) => m.kind !== "subsidio" && m.delta > 0).length,
    },
    soldados: soldadoTotals,
    servidores: servidorTotals,
    series: days.map((date) => ({
      date,
      soldados: byDay.get(date)?.soldados ?? 0,
      servidores: byDay.get(date)?.servidores ?? 0,
      merch: byDay.get(date)?.merch ?? 0,
      subsidio: byDay.get(date)?.subsidio ?? 0,
    })),
    debtors: [
      ...debtorsOf(soldados as Person[], settings.soldadoPrice, "soldados"),
      ...debtorsOf(activeServidores as Person[], settings.servidorPrice, "servidores"),
    ].sort((a, b) => b.due - a.due),
    recentMovements: current.slice(0, 300).map((m) => ({ ...m, date: m.date.toISOString() })),
  });
});
