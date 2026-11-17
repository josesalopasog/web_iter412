import type { MerchPrices } from "../api/settings";
import type { Order, OrderItemInput, OrderProduct, OrderStatus } from "../api/orders";

// Catálogo, precios y estados de las órdenes de merch (lo usan el perfil y el dashboard).
export const PRODUCTS: { code: OrderProduct; label: string; emoji: string }[] = [
  { code: "CAMISETA", label: "Camiseta", emoji: "👕" },
  { code: "BUSO_CERRADO", label: "Buso cerrado", emoji: "🧥" },
  { code: "CHAQUETA_ABIERTA", label: "Chaqueta abierta", emoji: "🧥" },
  { code: "CANGURO", label: "Canguro", emoji: "👝" },
  { code: "TULA", label: "Tula", emoji: "🎒" },
  { code: "GORRA", label: "Cachucha", emoji: "🧢" },
];

export const PRODUCT_LABEL = Object.fromEntries(PRODUCTS.map((p) => [p.code, p.label])) as Record<OrderProduct, string>;

export const COLORS = [
  { code: "BLANCA", label: "Blanca", hex: "#e5e7eb" },
  { code: "VERDE", label: "Verde", hex: "#16a34a" },
  { code: "AZUL", label: "Azul", hex: "#2563eb" },
  { code: "NEGRA", label: "Negra", hex: "#000000" },
];
export const COLOR_LABEL: Record<string, string> = Object.fromEntries(COLORS.map((c) => [c.code, c.label]));

export const CUTS = [
  { code: "HOMBRE", label: "Hombre" },
  { code: "MUJER", label: "Mujer" },
];
export const SIZES = ["S", "M", "L", "OTRO"];

export const SIZED = new Set<OrderProduct>(["CAMISETA", "BUSO_CERRADO", "CHAQUETA_ABIERTA"]);

const PRICE_FIELD: Record<OrderProduct, keyof MerchPrices> = {
  CAMISETA: "shirtPrice",
  BUSO_CERRADO: "busoChaquetaPrice",
  CHAQUETA_ABIERTA: "busoChaquetaPrice",
  CANGURO: "canguroPrice",
  TULA: "tulaPrice",
  GORRA: "cachuchaPrice",
};

/** Mismo cálculo que el backend (el total real lo fija el servidor al guardar). */
export const unitPriceOf = (item: OrderItemInput, prices: MerchPrices) =>
  (prices[PRICE_FIELD[item.product]] ?? 0) + (SIZED.has(item.product) && item.size === "OTRO" ? prices.extraSizePrice : 0);

export const totalOf = (items: OrderItemInput[], prices: MerchPrices) =>
  items.reduce((sum, item) => sum + unitPriceOf(item, prices) * item.quantity, 0);

export const newItem = (cut = "HOMBRE"): OrderItemInput => ({ product: "CAMISETA", color: "BLANCA", cut, size: "M", sizeOther: "", quantity: 1 });

/** Deja solo los campos que aplican a la prenda elegida. */
export const normalizeItem = (item: OrderItemInput): OrderItemInput => {
  const sized = SIZED.has(item.product);
  return {
    product: item.product,
    color: item.product === "CAMISETA" ? item.color || "BLANCA" : "",
    cut: sized ? item.cut || "HOMBRE" : "",
    size: sized ? item.size || "M" : "",
    sizeOther: sized && item.size === "OTRO" ? item.sizeOther : "",
    quantity: Math.min(10, Math.max(1, Math.round(item.quantity) || 1)),
  };
};

export const itemValid = (item: OrderItemInput) => !SIZED.has(item.product) || item.size !== "OTRO" || item.sizeOther.trim() !== "";

export const describeItem = (item: OrderItemInput) => {
  const parts = [PRODUCT_LABEL[item.product]];
  if (item.color) parts.push(COLOR_LABEL[item.color]?.toLowerCase() ?? item.color);
  if (item.cut) parts.push(item.cut === "MUJER" ? "mujer" : "hombre");
  if (item.size) parts.push(`talla ${item.size === "OTRO" ? item.sizeOther || "especial" : item.size}`);
  return `${item.quantity > 1 ? `${item.quantity}× ` : ""}${parts.join(" ")}`;
};

export const describeOrder = (order: Pick<Order, "items">) => order.items.map(describeItem).join(", ");

export const formatOrderNumber = (n: number) => `#${String(n).padStart(4, "0")}`;

export const unitsOf = (order: Pick<Order, "items">) => order.items.reduce((s, i) => s + i.quantity, 0);

/* ---------- Estados ---------- */
export const STATUS_FLOW: OrderStatus[] = ["RECIBIDO", "CONFIRMADO", "ENCARGADO", "LISTO", "ENTREGADO"];
export const ALL_STATUSES: OrderStatus[] = [...STATUS_FLOW, "CANCELADO"];

export const STATUS_INFO: Record<OrderStatus, { label: string; color: string; hint: string }> = {
  RECIBIDO: { label: "Recibida", color: "#0b7fbd", hint: "La recibimos. Aún puedes editarla o cancelarla." },
  CONFIRMADO: { label: "Confirmada", color: "#7c3aed", hint: "El equipo la revisó y entra en el próximo pedido al proveedor." },
  ENCARGADO: { label: "Encargada", color: "#d97706", hint: "Ya se pidió al proveedor." },
  LISTO: { label: "Lista para entregar", color: "#059669", hint: "¡Llegó! Recógela con el equipo de merch." },
  ENTREGADO: { label: "Entregada", color: "#6b7280", hint: "Ya la recibiste." },
  CANCELADO: { label: "Cancelada", color: "#dc2626", hint: "Esta orden no se hará." },
};

export const isActive = (status: OrderStatus) => status !== "ENTREGADO" && status !== "CANCELADO";

/* ---------- Pago ---------- */
export type PaymentState = "PAGADO" | "ABONO" | "SIN_PAGO";
export const paymentStateOf = (o: Pick<Order, "total" | "paidAmount">): PaymentState =>
  o.total > 0 && o.paidAmount >= o.total ? "PAGADO" : o.paidAmount > 0 ? "ABONO" : "SIN_PAGO";
export const PAYMENT_INFO: Record<PaymentState, { label: string; pill: string }> = {
  PAGADO: { label: "Pagado", pill: "completo" },
  ABONO: { label: "Abono", pill: "parcial" },
  SIN_PAGO: { label: "Sin pago", pill: "sinPago" },
};
