import { ApiError } from "../../utils/errors.js";
import { getSettings } from "../settings/settings.service.js";
import type { SettingsDoc } from "../settings/settings.service.js";
import { Servidor } from "../users/servidores/servidor.model.js";
import { Order, ORDER_COLORS, ORDER_CUTS, ORDER_PRODUCTS, ORDER_SIZES } from "./order.model.js";

type Product = (typeof ORDER_PRODUCTS)[number];

const PRICE_FIELD: Record<Product, "shirtPrice" | "busoChaquetaPrice" | "canguroPrice" | "tulaPrice" | "cachuchaPrice"> = {
  CAMISETA: "shirtPrice",
  BUSO_CERRADO: "busoChaquetaPrice",
  CHAQUETA_ABIERTA: "busoChaquetaPrice",
  CANGURO: "canguroPrice",
  TULA: "tulaPrice",
  GORRA: "cachuchaPrice",
};

/** Prendas con corte (hombre/mujer) y talla; las demás son talla única. */
export const SIZED_PRODUCTS = new Set<Product>(["CAMISETA", "BUSO_CERRADO", "CHAQUETA_ABIERTA"]);

export const PRODUCT_LABELS: Record<Product, string> = {
  CAMISETA: "Camiseta",
  BUSO_CERRADO: "Buso cerrado",
  CHAQUETA_ABIERTA: "Chaqueta abierta",
  CANGURO: "Canguro",
  TULA: "Tula",
  GORRA: "Cachucha",
};

export type OrderItemInput = {
  product: Product;
  color: string;
  cut: string;
  size: string;
  sizeOther: string;
  quantity: number;
};

const includes = <T extends string>(list: readonly T[], value: unknown): value is T =>
  typeof value === "string" && (list as readonly string[]).includes(value);

/** Valida las prendas que llegan del cliente y las deja limpias (sin campos que no aplican). */
export const parseItems = (raw: unknown): OrderItemInput[] => {
  if (!Array.isArray(raw) || raw.length === 0) throw new ApiError(400, "Agrega al menos una prenda a la orden");
  if (raw.length > 20) throw new ApiError(400, "Una orden puede tener máximo 20 líneas");
  return raw.map((item: any, i) => {
    const n = i + 1;
    if (!includes(ORDER_PRODUCTS, item?.product)) throw new ApiError(400, `Prenda ${n}: elige qué prenda quieres`);
    const product = item.product as Product;
    const quantity = Number(item.quantity ?? 1);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) throw new ApiError(400, `Prenda ${n}: la cantidad va de 1 a 10`);
    const sized = SIZED_PRODUCTS.has(product);
    let color = "";
    if (product === "CAMISETA") {
      if (!includes(ORDER_COLORS, item.color)) throw new ApiError(400, `Prenda ${n}: elige el color de la camiseta`);
      color = item.color;
    }
    let cut = "";
    let size = "";
    let sizeOther = "";
    if (sized) {
      if (!includes(ORDER_CUTS, item.cut)) throw new ApiError(400, `Prenda ${n}: elige el corte (hombre o mujer)`);
      if (!includes(ORDER_SIZES, item.size)) throw new ApiError(400, `Prenda ${n}: elige la talla`);
      cut = item.cut;
      size = item.size;
      if (size === "OTRO") {
        sizeOther = typeof item.sizeOther === "string" ? item.sizeOther.trim().slice(0, 40) : "";
        if (!sizeOther) throw new ApiError(400, `Prenda ${n}: escribe la talla especial (por ejemplo XL)`);
      }
    }
    return { product, color, cut, size, sizeOther, quantity };
  });
};

/** Precio de cada línea con los precios vigentes (talla especial lleva recargo por unidad). */
export const priceItems = (items: OrderItemInput[], settings: SettingsDoc) => {
  const priced = items.map((item) => {
    const base = Number(settings[PRICE_FIELD[item.product]]) || 0;
    const extra = SIZED_PRODUCTS.has(item.product) && item.size === "OTRO" ? Number(settings.extraSizePrice) || 0 : 0;
    const unitPrice = base + extra;
    return { ...item, unitPrice, lineTotal: unitPrice * item.quantity };
  });
  return { items: priced, total: priced.reduce((s, i) => s + i.lineTotal, 0) };
};

/** Siguiente número de orden (1, 2, 3...). */
export const nextOrderNumber = async () => {
  const last = await Order.findOne().sort({ orderNumber: -1 }).select("orderNumber").lean();
  return (last?.orderNumber ?? 0) + 1;
};

/** Crea la orden reintentando si dos se crean al mismo tiempo y chocan en el número. */
export const createOrderDoc = async (data: Record<string, unknown>) => {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await Order.create({ ...data, orderNumber: await nextOrderNumber() });
    } catch (error: any) {
      if (error?.code !== 11000) throw error;
    }
  }
  throw new ApiError(409, "No se pudo asignar el número de orden, intenta de nuevo");
};

export const formatOrderNumber = (n: number) => `#${String(n).padStart(4, "0")}`;

export const describeItems = (items: { product: string; color?: string; size?: string; sizeOther?: string; quantity: number }[]) =>
  items
    .map((i) => {
      const label = PRODUCT_LABELS[i.product as Product] ?? i.product;
      const color = i.color ? ` ${i.color.toLowerCase()}` : "";
      const size = i.size ? ` ${i.size === "OTRO" ? i.sizeOther || "especial" : i.size}` : "";
      return `${i.quantity > 1 ? `${i.quantity}× ` : ""}${label}${color}${size}`;
    })
    .join(", ");

const upper = (value: unknown) => (typeof value === "string" ? value.trim().toUpperCase() : "");

/** Prendas del pedido antiguo de un servidor (lo que tenía guardado en su registro). */
export const legacyItemsOf = (s: any): OrderItemInput[] => {
  const cut = s.gender === "Mujer" || s.gender === "Femenino" ? "MUJER" : "HOMBRE";
  const sizeOf = (size: unknown) => (includes(ORDER_SIZES, upper(size)) ? upper(size) : "M");
  const items: OrderItemInput[] = [];
  if (s.needsShirt === "SI") {
    // Igual que el cálculo antiguo: una camiseta por color elegido (mínimo una).
    const colors = (Array.isArray(s.shirtColors) ? s.shirtColors : []).map(upper).filter(Boolean);
    const shirtSize = sizeOf(s.shirtSize);
    for (const raw of colors.length ? colors : ["BLANCA"]) {
      items.push({
        product: "CAMISETA",
        color: includes(ORDER_COLORS, raw) ? raw : "BLANCA",
        cut,
        size: shirtSize,
        sizeOther: shirtSize === "OTRO" ? String(s.shirtSizeOther || "Especial").trim().slice(0, 40) : "",
        quantity: 1,
      });
    }
  }
  const merchSize = sizeOf(s.merchSize);
  for (const raw of Array.isArray(s.merchItems) ? s.merchItems : []) {
    const code = upper(raw);
    if (!includes(ORDER_PRODUCTS, code)) continue; // "NINGUNA" u otros valores sin precio
    const sized = SIZED_PRODUCTS.has(code);
    items.push({
      product: code,
      color: "",
      cut: sized ? cut : "",
      size: sized ? merchSize : "",
      sizeOther: sized && merchSize === "OTRO" ? String(s.merchSizeOther || "Especial").trim().slice(0, 40) : "",
      quantity: 1,
    });
  }
  return items;
};

/**
 * Una sola vez (al arrancar el backend en cada ambiente): pasa el pedido de merch que cada servidor
 * tenía guardado en su registro a una orden numerada, idéntica a lo que había:
 * - mismas prendas, colores y tallas, con el mismo cálculo de precio que el pedido antiguo;
 * - lo pagado exactamente igual (merchPaymentAmount);
 * - fecha de la orden = fecha en que el servidor se inscribió (cuando hizo el pedido);
 * - números de orden en el orden en que se inscribieron (#0001 es el pedido más antiguo).
 * Los campos viejos del servidor no se borran.
 */
export const migrateLegacyMerchOrders = async () => {
  const settings = await getSettings();
  if (settings.merchOrdersMigrated) return;

  const servidores = await Servidor.find({
    $or: [{ needsShirt: "SI" }, { merchItems: { $exists: true, $ne: [] } }, { merchPaymentAmount: { $gt: 0 } }],
  })
    .sort({ createdAt: 1, registrationNumber: 1 })
    .lean();

  let created = 0;
  for (const s of servidores as any[]) {
    if (await Order.exists({ servidorId: s._id, migratedFromLegacy: true })) continue; // por si se cortó a mitad
    const items = legacyItemsOf(s);
    const paid = Math.max(0, Number(s.merchPaymentAmount) || 0);
    if (!items.length) {
      if (paid > 0) console.warn(`⚠️ ${s.firstNames} ${s.lastNames} tiene $${paid} de merch pagado pero ninguna prenda: revisar a mano`);
      continue;
    }

    const priced = priceItems(items, settings);
    if (paid > priced.total) console.warn(`⚠️ ${s.firstNames} ${s.lastNames} pagó $${paid} de merch y su pedido vale $${priced.total}`);
    const at = s.createdAt ? new Date(s.createdAt) : new Date();
    const order = await createOrderDoc({
      servidorId: s._id,
      customer: {
        firstNames: s.firstNames,
        lastNames: s.lastNames,
        gender: s.gender,
        phone: s.phone,
        email: s.email,
        role: s.role,
      },
      items: priced.items,
      total: priced.total,
      paidAmount: paid,
      status: "RECIBIDO",
      history: [{ status: "RECIBIDO", at, by: "Pedido del formulario de inscripción" }],
      migratedFromLegacy: true,
    });
    // La orden lleva la fecha del pedido original, no la del día de la migración.
    await Order.collection.updateOne({ _id: order._id }, { $set: { createdAt: at } });
    created += 1;
  }

  settings.merchOrdersMigrated = true;
  await settings.save();
  if (created) console.log(`🧾 ${created} pedidos de merch pasados a órdenes`);
};
