import mongoose, { Schema } from "mongoose";

// Órdenes de ropa (merch) de los servidores. Cada orden tiene número consecutivo, prendas,
// total calculado con los precios vigentes, lo pagado y un estado para administrarla.
export const ORDER_PRODUCTS = ["CAMISETA", "BUSO_CERRADO", "CHAQUETA_ABIERTA", "CANGURO", "TULA", "GORRA"] as const;
export const ORDER_COLORS = ["BLANCA", "VERDE", "AZUL", "NEGRA"] as const;
export const ORDER_CUTS = ["HOMBRE", "MUJER"] as const;
export const ORDER_SIZES = ["S", "M", "L", "OTRO"] as const;

/**
 * RECIBIDO: el servidor la creó; aún puede editarla o cancelarla.
 * CONFIRMADO: el equipo la revisó; ya no se puede editar desde el perfil.
 * ENCARGADO: se pidió al proveedor.
 * LISTO: llegó y está lista para entregar.
 * ENTREGADO: el servidor la recibió.
 * CANCELADO: no se hará.
 */
export const ORDER_STATUSES = ["RECIBIDO", "CONFIRMADO", "ENCARGADO", "LISTO", "ENTREGADO", "CANCELADO"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

const OrderItemSchema = new Schema(
  {
    product: { type: String, enum: ORDER_PRODUCTS, required: true },
    color: { type: String, default: "" },
    cut: { type: String, default: "" },
    size: { type: String, default: "" },
    sizeOther: { type: String, default: "", trim: true, maxlength: 40 },
    quantity: { type: Number, required: true, min: 1, max: 10 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    orderNumber: { type: Number, required: true, unique: true },
    servidorId: { type: Schema.Types.ObjectId, ref: "Servidor", required: true, index: true },
    // Copia de los datos de contacto al crear la orden (por si el servidor se elimina después).
    customer: {
      firstNames: { type: String, default: "" },
      lastNames: { type: String, default: "" },
      gender: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
      role: { type: String, default: "SERVIDOR" },
    },
    items: { type: [OrderItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, required: true, default: 0, min: 0 },
    status: { type: String, enum: ORDER_STATUSES, required: true, default: "RECIBIDO", index: true },
    notes: { type: String, default: "", trim: true, maxlength: 300 },
    adminNotes: { type: String, default: "", trim: true, maxlength: 500 },
    history: {
      type: [{ status: String, at: Date, by: String, _id: false }],
      default: [],
    },
    migratedFromLegacy: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "orders" }
);

export const Order = mongoose.model("Order", OrderSchema);
