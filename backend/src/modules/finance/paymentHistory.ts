import { Log } from "../activityLog/log.model.js";

// No hay una colección de pagos: cada cambio de un monto queda en el registro de actividad como
// «Editó "paymentAmount" de Nombre Apellido (ROL): "100000" → "200000"». De ahí sale el historial
// de movimientos (cuánto entró cada día), incluido lo que se registró antes de este reporte.

export type PaymentKind = "pago" | "subsidio" | "merch";
export type PaymentGroup = "soldados" | "servidores";

export type PaymentMovement = {
  date: Date;
  group: PaymentGroup;
  kind: PaymentKind;
  person: string;
  delta: number; // Positivo = entró dinero; negativo = corrección hacia abajo
  amount: number; // Monto acumulado de la persona después del cambio
  by: string;
};

const KIND_BY_FIELD: Record<string, PaymentKind> = {
  paymentAmount: "pago",
  subsidyAmount: "subsidio",
  merchPaymentAmount: "merch",
};

const SUMMARY_RE = /^Editó "(paymentAmount|subsidyAmount|merchPaymentAmount)" de (.+) \(([A-Z_]+)\): "([\d.]*)" → "([\d.]*)"$/;

export const getPaymentMovements = async (from?: Date, to?: Date): Promise<PaymentMovement[]> => {
  const createdAt: Record<string, Date> = {};
  if (from) createdAt.$gte = from;
  if (to) createdAt.$lt = to;
  const logs = await Log.find({
    action: { $in: ["EDITAR_SOLDADO", "EDITAR_SERVIDOR"] },
    summary: { $regex: /^Editó "(paymentAmount|subsidyAmount|merchPaymentAmount)"/ },
    ...(from || to ? { createdAt } : {}),
  })
    .sort({ createdAt: -1 })
    .lean();

  const movements: PaymentMovement[] = [];
  for (const log of logs) {
    const match = SUMMARY_RE.exec(log.summary);
    if (!match) continue;
    const [, field, person, , oldRaw, newRaw] = match;
    const oldValue = Number(oldRaw || 0);
    const newValue = Number(newRaw || 0);
    if (!Number.isFinite(oldValue) || !Number.isFinite(newValue) || oldValue === newValue) continue;
    movements.push({
      date: log.createdAt as Date,
      group: log.action === "EDITAR_SOLDADO" ? "soldados" : "servidores",
      kind: KIND_BY_FIELD[field],
      person,
      delta: newValue - oldValue,
      amount: newValue,
      by: log.userName,
    });
  }
  return movements;
};
