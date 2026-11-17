import { useMemo, useState } from "react";
import { createOrder, updateOrder } from "../../../../api/orders";
import type { Order, OrderItemInput } from "../../../../api/orders";
import type { MerchPrices } from "../../../../api/settings";
import type { ServidorRecord } from "../../../../api/adminUsers";
import OrderItemsEditor from "../../../../orders/OrderItemsEditor";
import StatusPill from "../../../../orders/StatusPill";
import { STATUS_INFO, formatOrderNumber, itemValid, newItem } from "../../../../orders/catalog";

type Props = {
  /** Orden a editar; sin orden se crea una nueva para el servidor elegido. */
  order: Order | null;
  servidores: ServidorRecord[];
  prices: MerchPrices;
  onClose: () => void;
  onSaved: (order: Order) => void;
};

const cutFor = (gender?: string) => (gender === "Mujer" || gender === "Femenino" ? "MUJER" : "HOMBRE");

// Crear o editar una orden desde el dashboard: prendas, nota del servidor, nota interna e historial.
const OrderModal = ({ order, servidores, prices, onClose, onSaved }: Props) => {
  const [servidorId, setServidorId] = useState(order?.servidorId ?? "");
  const [items, setItems] = useState<OrderItemInput[]>(
    order ? order.items.map(({ product, color, cut, size, sizeOther, quantity }) => ({ product, color, cut, size, sizeOther, quantity })) : [newItem()]
  );
  const [notes, setNotes] = useState(order?.notes ?? "");
  const [adminNotes, setAdminNotes] = useState(order?.adminNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedServidores = useMemo(
    () => [...servidores].sort((a, b) => `${a.firstNames} ${a.lastNames}`.localeCompare(`${b.firstNames} ${b.lastNames}`)),
    [servidores]
  );
  const selected = servidores.find((s) => s._id === servidorId);

  const save = async () => {
    if (!order && !servidorId) return setError("Elige el servidor de la orden.");
    if (!items.length) return setError("Agrega al menos una prenda.");
    if (!items.every(itemValid)) return setError("Escribe la talla especial de las prendas marcadas en rojo.");
    setSaving(true);
    setError(null);
    try {
      const saved = order ? await updateOrder(order._id, { items, notes, adminNotes }) : await createOrder(servidorId, items, notes, adminNotes);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la orden");
      setSaving(false);
    }
  };

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modalCard ordModalCard">
        <div className="modalHead">
          <h3>
            {order ? `Orden ${formatOrderNumber(order.orderNumber)} · ${order.customer.firstNames} ${order.customer.lastNames}` : "Nueva orden"}
          </h3>
          <button type="button" className="modalClose" onClick={onClose} disabled={saving}>
            ✕
          </button>
        </div>
        <div className="modalBody ordModalBody" style={{ whiteSpace: "normal" }}>
          {order ? (
            <p className="ordHint">
              <StatusPill status={order.status} /> {STATUS_INFO[order.status].hint} Al guardar, el total se recalcula con los precios
              actuales.
            </p>
          ) : (
            <label className="ordField">
              <span>Servidor</span>
              <select
                value={servidorId}
                onChange={(e) => {
                  setServidorId(e.target.value);
                  const s = servidores.find((x) => x._id === e.target.value);
                  setItems((list) => list.map((i) => (i.cut ? { ...i, cut: cutFor(s?.gender) } : i)));
                }}
              >
                <option value="">Elige un servidor…</option>
                {sortedServidores.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.firstNames} {s.lastNames}
                  </option>
                ))}
              </select>
            </label>
          )}

          <OrderItemsEditor items={items} onChange={setItems} prices={prices} defaultCut={cutFor(selected?.gender ?? order?.customer.gender)} />

          <label className="ordField">
            <span>Nota del servidor</span>
            <textarea className="ordTextarea" maxLength={300} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
          <label className="ordField">
            <span>Nota interna (solo la ve el equipo)</span>
            <textarea
              className="ordTextarea"
              maxLength={500}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Ej: entregar en la reunión del sábado"
            />
          </label>

          {order && order.history.length > 0 && (
            <div className="ordField">
              <span>Historial</span>
              <ul className="ordHistory">
                {order.history.map((h, i) => (
                  <li key={i}>
                    {new Date(h.at).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })} · {STATUS_INFO[h.status]?.label ?? h.status}
                    {h.by ? ` · ${h.by}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {error && <p className="ordError">{error}</p>}
        </div>
        <div className="modalActions">
          <button type="button" className="btnGhost" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="button" className="btnPrimary" onClick={save} disabled={saving}>
            {saving ? "Guardando…" : order ? "Guardar cambios" : "Crear orden"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
