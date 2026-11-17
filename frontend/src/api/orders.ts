import { authedRequest } from "./http";

// Órdenes de merch: el servidor las crea desde su perfil y el equipo las administra en el dashboard.
export type OrderProduct = "CAMISETA" | "BUSO_CERRADO" | "CHAQUETA_ABIERTA" | "CANGURO" | "TULA" | "GORRA";
export type OrderStatus = "RECIBIDO" | "CONFIRMADO" | "ENCARGADO" | "LISTO" | "ENTREGADO" | "CANCELADO";

export type OrderItemInput = {
  product: OrderProduct;
  color: string;
  cut: string;
  size: string;
  sizeOther: string;
  quantity: number;
};

export type OrderItem = OrderItemInput & { unitPrice: number; lineTotal: number };

export type Order = {
  _id: string;
  orderNumber: number;
  servidorId: string;
  customer: { firstNames: string; lastNames: string; gender: string; phone: string; email: string; role: string };
  items: OrderItem[];
  total: number;
  paidAmount: number;
  status: OrderStatus;
  notes: string;
  adminNotes?: string;
  history: { status: OrderStatus; at: string; by: string }[];
  createdAt: string;
  updatedAt: string;
};

const json = (method: string, body?: unknown) => ({ method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });

/* Perfil */
export const listMyOrders = () => authedRequest<Order[]>("/api/orders/mine");
export const createMyOrder = (items: OrderItemInput[], notes: string) =>
  authedRequest<Order>("/api/orders/mine", json("POST", { items, notes }));
export const updateMyOrder = (id: string, items: OrderItemInput[], notes: string) =>
  authedRequest<Order>(`/api/orders/mine/${id}`, json("PATCH", { items, notes }));
export const cancelMyOrder = (id: string) => authedRequest<Order>(`/api/orders/mine/${id}/cancel`, json("POST"));

/* Dashboard */
export const listOrders = () => authedRequest<Order[]>("/api/orders");
export const createOrder = (servidorId: string, items: OrderItemInput[], notes: string, adminNotes: string) =>
  authedRequest<Order>("/api/orders", json("POST", { servidorId, items, notes, adminNotes }));
export const updateOrder = (id: string, changes: { items?: OrderItemInput[]; notes?: string; adminNotes?: string }) =>
  authedRequest<Order>(`/api/orders/${id}`, json("PATCH", changes));
export const updateOrderStatus = (id: string, status: OrderStatus) =>
  authedRequest<Order>(`/api/orders/${id}/status`, json("PATCH", { status }));
export const bulkUpdateOrderStatus = (ids: string[], status: OrderStatus) =>
  authedRequest<Order[]>("/api/orders/bulk-status", json("POST", { ids, status }));
export const updateOrderPayment = (id: string, paidAmount: number) =>
  authedRequest<Order>(`/api/orders/${id}/payment`, json("PATCH", { paidAmount }));
export const deleteOrder = (id: string) => authedRequest<{ ok: true }>(`/api/orders/${id}`, json("DELETE"));
