import { Types } from "mongoose";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/errors.js";
import { createLog } from "../activityLog/createLog.js";
import { getSettings } from "../settings/settings.service.js";
import { Servidor } from "../users/servidores/servidor.model.js";
import { Order, ORDER_STATUSES } from "./order.model.js";
import type { OrderStatus } from "./order.model.js";
import { createOrderDoc, describeItems, formatOrderNumber, parseItems, priceItems } from "./order.service.js";

const isStatus = (value: unknown): value is OrderStatus =>
  typeof value === "string" && (ORDER_STATUSES as readonly string[]).includes(value);

const cleanText = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

const userName = (user: { firstNames: string; lastNames: string }) => `${user.firstNames} ${user.lastNames}`.trim();

const findOrder = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) throw new ApiError(404, "Orden no encontrada");
  const order = await Order.findById(id);
  if (!order) throw new ApiError(404, "Orden no encontrada");
  return order;
};

const customerOf = (s: any) => ({
  firstNames: s.firstNames,
  lastNames: s.lastNames,
  gender: s.gender,
  phone: s.phone,
  email: s.email,
  role: s.role,
});

/* ======================= Perfil del servidor ======================= */

/** GET /api/orders/mine: las órdenes del servidor con sesión (más recientes primero). */
export const listMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ servidorId: req.user!.sub }).select("-adminNotes").sort({ orderNumber: -1 }).lean();
  res.json(orders);
});

/** POST /api/orders/mine { items, notes }: crea una orden nueva. */
export const createMyOrder = asyncHandler(async (req, res) => {
  const settings = await getSettings();
  if (settings.merchOrdersOpen === false) throw new ApiError(403, "Pronto podrás solicitar tu merch. Por ahora no estamos recibiendo órdenes.");
  const servidor = await Servidor.findById(req.user!.sub).lean();
  if (!servidor) throw new ApiError(404, "No encontrado");
  const open = await Order.countDocuments({ servidorId: servidor._id, status: { $nin: ["ENTREGADO", "CANCELADO"] } });
  if (open >= 5) throw new ApiError(400, "Tienes 5 órdenes activas. Edita una de ellas en vez de crear otra.");

  const items = parseItems(req.body?.items);
  const priced = priceItems(items, settings);
  const order = await createOrderDoc({
    servidorId: servidor._id,
    customer: customerOf(servidor),
    items: priced.items,
    total: priced.total,
    notes: cleanText(req.body?.notes, 300),
    status: "RECIBIDO",
    history: [{ status: "RECIBIDO", at: new Date(), by: userName(req.user!) }],
  });

  await createLog(req.user!, "CREAR_ORDEN", `Creó la orden ${formatOrderNumber(order.orderNumber)}: ${describeItems(priced.items)}`);
  res.status(201).json(order);
});

/** PATCH /api/orders/mine/:id { items?, notes? }: solo mientras está en RECIBIDO. */
export const updateMyOrder = asyncHandler(async (req, res) => {
  const order = await findOrder(String(req.params.id));
  if (String(order.servidorId) !== req.user!.sub) throw new ApiError(404, "Orden no encontrada");
  if (order.status !== "RECIBIDO") {
    throw new ApiError(400, "Esta orden ya fue confirmada; para cambiarla escríbele al equipo de merch");
  }
  if (req.body?.items !== undefined) {
    const priced = priceItems(parseItems(req.body.items), await getSettings());
    if (priced.total < order.paidAmount) {
      throw new ApiError(400, "El nuevo total quedaría por debajo de lo que ya pagaste; habla con el equipo de merch");
    }
    order.set("items", priced.items);
    order.total = priced.total;
  }
  if (req.body?.notes !== undefined) order.notes = cleanText(req.body.notes, 300);
  await order.save();

  await createLog(req.user!, "EDITAR_ORDEN", `Editó la orden ${formatOrderNumber(order.orderNumber)}: ${describeItems(order.items)}`);
  const result = order.toObject();
  delete (result as any).adminNotes;
  res.json(result);
});

/** POST /api/orders/mine/:id/cancel: solo en RECIBIDO y sin pagos. */
export const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await findOrder(String(req.params.id));
  if (String(order.servidorId) !== req.user!.sub) throw new ApiError(404, "Orden no encontrada");
  if (order.status !== "RECIBIDO") throw new ApiError(400, "Esta orden ya fue confirmada; para cancelarla escríbele al equipo de merch");
  if (order.paidAmount > 0) throw new ApiError(400, "Esta orden ya tiene pagos; para cancelarla escríbele al equipo de merch");
  order.status = "CANCELADO";
  order.history.push({ status: "CANCELADO", at: new Date(), by: userName(req.user!) });
  await order.save();
  await createLog(req.user!, "CANCELAR_ORDEN", `Canceló su orden ${formatOrderNumber(order.orderNumber)}`);
  res.json(order);
});

/* ======================= Dashboard ======================= */

/** GET /api/orders?status=: todas las órdenes (más recientes primero). */
export const listOrders = asyncHandler(async (req, res) => {
  const filter = isStatus(req.query.status) ? { status: req.query.status } : {};
  const orders = await Order.find(filter).sort({ orderNumber: -1 }).lean();
  res.json(orders);
});

/** GET /api/orders/:id */
export const getOrder = asyncHandler(async (req, res) => {
  res.json(await findOrder(String(req.params.id)));
});

/** POST /api/orders { servidorId, items, notes, adminNotes }: crea una orden a nombre de un servidor. */
export const createOrder = asyncHandler(async (req, res) => {
  const servidorId = String(req.body?.servidorId ?? "");
  if (!Types.ObjectId.isValid(servidorId)) throw new ApiError(400, "Elige el servidor de la orden");
  const servidor = await Servidor.findById(servidorId).lean();
  if (!servidor) throw new ApiError(404, "Servidor no encontrado");

  const priced = priceItems(parseItems(req.body?.items), await getSettings());
  const order = await createOrderDoc({
    servidorId: servidor._id,
    customer: customerOf(servidor),
    items: priced.items,
    total: priced.total,
    notes: cleanText(req.body?.notes, 300),
    adminNotes: cleanText(req.body?.adminNotes, 500),
    status: "RECIBIDO",
    history: [{ status: "RECIBIDO", at: new Date(), by: userName(req.user!) }],
  });
  await createLog(
    req.user!,
    "CREAR_ORDEN",
    `Creó la orden ${formatOrderNumber(order.orderNumber)} de ${servidor.firstNames} ${servidor.lastNames}: ${describeItems(priced.items)}`
  );
  res.status(201).json(order);
});

/** PATCH /api/orders/:id { items?, notes?, adminNotes? }: el total se recalcula con los precios vigentes. */
export const updateOrder = asyncHandler(async (req, res) => {
  const order = await findOrder(String(req.params.id));
  const changes: string[] = [];
  if (req.body?.items !== undefined) {
    const priced = priceItems(parseItems(req.body.items), await getSettings());
    order.set("items", priced.items);
    order.total = priced.total;
    if (order.paidAmount > order.total) order.paidAmount = order.total;
    changes.push(`prendas: ${describeItems(priced.items)}`);
  }
  if (req.body?.notes !== undefined) {
    order.notes = cleanText(req.body.notes, 300);
    changes.push("nota del servidor");
  }
  if (req.body?.adminNotes !== undefined) {
    order.adminNotes = cleanText(req.body.adminNotes, 500);
    changes.push("nota interna");
  }
  if (!changes.length) throw new ApiError(400, "Nada para actualizar");
  await order.save();
  await createLog(req.user!, "EDITAR_ORDEN", `Editó la orden ${formatOrderNumber(order.orderNumber)} (${changes.join(", ")})`);
  res.json(order);
});

/**
 * Cambia el estado en una sola operación atómica (solo si es distinto) y devuelve la orden ya
 * actualizada: así un cambio de estado y un pago hechos casi al tiempo no se pisan.
 */
const setStatus = (id: unknown, status: OrderStatus, by: string) =>
  Order.findOneAndUpdate(
    { _id: id, status: { $ne: status } },
    { $set: { status }, $push: { history: { status, at: new Date(), by } } },
    { returnDocument: "after" }
  );

/** PATCH /api/orders/:id/status { status } */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body as { status?: unknown };
  if (!isStatus(status)) throw new ApiError(400, "Estado inválido");
  const order = await findOrder(String(req.params.id));
  const updated = await setStatus(order._id, status, userName(req.user!));
  if (!updated) return res.json(await Order.findById(order._id));
  await createLog(req.user!, "ESTADO_ORDEN", `Orden ${formatOrderNumber(order.orderNumber)}: ${order.status} → ${status}`);
  res.json(updated);
});

/** POST /api/orders/bulk-status { ids, status }: p. ej. marcar como encargadas todas las confirmadas. */
export const bulkUpdateOrderStatus = asyncHandler(async (req, res) => {
  const { ids, status } = req.body as { ids?: unknown; status?: unknown };
  if (!isStatus(status)) throw new ApiError(400, "Estado inválido");
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > 500 || !ids.every((id) => Types.ObjectId.isValid(String(id)))) {
    throw new ApiError(400, "Selecciona las órdenes");
  }
  const by = userName(req.user!);
  const changed = (await Promise.all(ids.map((id) => setStatus(String(id), status, by)))).filter(
    (o): o is NonNullable<typeof o> => Boolean(o)
  );
  const orders = await Order.find({ _id: { $in: ids } });
  if (changed.length) {
    await createLog(
      req.user!,
      "ESTADO_ORDEN",
      `Pasó ${changed.length} órdenes a ${status}: ${changed.map((o) => formatOrderNumber(o.orderNumber)).join(", ")}`
    );
  }
  res.json(orders);
});

/** PATCH /api/orders/:id/payment { paidAmount }: lo pagado (0 a total). */
export const updateOrderPayment = asyncHandler(async (req, res) => {
  const amount = Number(req.body?.paidAmount);
  const order = await findOrder(String(req.params.id));
  if (!Number.isFinite(amount) || amount < 0 || amount > order.total) {
    throw new ApiError(400, `El pago debe estar entre $0 y $${order.total.toLocaleString("es-CO")}`);
  }
  const previous = order.paidAmount;
  const paid = Math.round(amount);
  if (previous === paid) return res.json(order);
  const updated = await Order.findByIdAndUpdate(order._id, { $set: { paidAmount: paid } }, { returnDocument: "after" });

  // Mismo formato que los pagos de siempre: así Finanzas y el registro de actividad lo cuentan como merch.
  const c = order.customer as { firstNames?: string; lastNames?: string; role?: string } | undefined;
  await createLog(
    req.user!,
    "EDITAR_SERVIDOR",
    `Editó "merchPaymentAmount" de ${c?.firstNames ?? ""} ${c?.lastNames ?? ""} (${c?.role || "SERVIDOR"}): "${previous}" → "${paid}"`
  );
  res.json(updated);
});

/** DELETE /api/orders/:id: borra la orden (solo SUPERADMIN; normalmente basta con cancelarla). */
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await findOrder(String(req.params.id));
  await order.deleteOne();
  await createLog(
    req.user!,
    "ELIMINAR_ORDEN",
    `Eliminó la orden ${formatOrderNumber(order.orderNumber)} (${describeItems(order.items)})`
  );
  res.json({ ok: true });
});
