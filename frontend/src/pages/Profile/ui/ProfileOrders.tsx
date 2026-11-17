import { useEffect, useState } from "react";
import { cancelMyOrder, createMyOrder, listMyOrders, updateMyOrder } from "../../../api/orders";
import type { Order, OrderItemInput } from "../../../api/orders";
import { getMerchPrices } from "../../../api/settings";
import type { MerchPrices } from "../../../api/settings";
import OrderItemsEditor from "../../../orders/OrderItemsEditor";
import StatusPill from "../../../orders/StatusPill";
import {
  STATUS_FLOW,
  STATUS_INFO,
  describeItem,
  formatOrderNumber,
  isActive,
  itemValid,
  newItem,
  paymentStateOf,
} from "../../../orders/catalog";
import { formatCOP } from "../../Admin/format";
import { usePublicSettings } from "../../../hooks/usePublicSettings";

type Props = {
  /** Género del servidor: define el corte por defecto de camisetas y busos. */
  gender?: string;
};

const PRICE_LABELS: { key: keyof MerchPrices; label: string }[] = [
  { key: "shirtPrice", label: "Camiseta" },
  { key: "busoChaquetaPrice", label: "Buso o chaqueta" },
  { key: "canguroPrice", label: "Canguro" },
  { key: "tulaPrice", label: "Tula" },
  { key: "cachuchaPrice", label: "Cachucha" },
];

const dateOf = (iso: string) => new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });

/**
 * Merch en el perfil: arriba se crea una orden nueva (prendas, colores, tallas) y debajo se ven las
 * órdenes activas con su estado, lo pagado y lo que falta. Mientras están "Recibidas" se pueden
 * editar o cancelar; después las administra el equipo de merch.
 */
const ProfileOrders = ({ gender }: Props) => {
  const defaultCut = gender === "Mujer" || gender === "Femenino" ? "MUJER" : "HOMBRE";
  const [prices, setPrices] = useState<MerchPrices | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [draft, setDraft] = useState<OrderItemInput[]>([]);
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showPast, setShowPast] = useState(false);
  // El equipo puede cerrar la creación de órdenes (Pedido de merch → Ajustes).
  const ordersClosed = usePublicSettings().merchOrdersOpen === false;

  const load = () =>
    listMyOrders()
      .then(setOrders)
      .catch(() => setOrders([]));

  useEffect(() => {
    getMerchPrices().then(setPrices).catch(() => setPrices(null));
    load();
  }, []);

  const startNew = () => {
    setEditingId(null);
    setDraft([newItem(defaultCut)]);
    setNotes("");
    setError(null);
    setMessage(null);
  };

  const startEdit = (order: Order) => {
    setEditingId(order._id);
    setDraft(order.items.map(({ product, color, cut, size, sizeOther, quantity }) => ({ product, color, cut, size, sizeOther, quantity })));
    setNotes(order.notes ?? "");
    setError(null);
    setMessage(null);
    document.getElementById("merch")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const closeEditor = () => {
    setDraft([]);
    setEditingId(null);
    setNotes("");
  };

  const save = async () => {
    if (!draft.length) return setError("Agrega al menos una prenda.");
    if (!draft.every(itemValid)) return setError("Escribe la talla especial de las prendas marcadas en rojo.");
    setSaving(true);
    setError(null);
    try {
      const saved = editingId ? await updateMyOrder(editingId, draft, notes) : await createMyOrder(draft, notes);
      setMessage(
        editingId
          ? `Orden ${formatOrderNumber(saved.orderNumber)} actualizada.`
          : `¡Listo! Creamos tu orden ${formatOrderNumber(saved.orderNumber)}. Te avisaremos cuando cambie de estado.`
      );
      closeEditor();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la orden");
    } finally {
      setSaving(false);
    }
  };

  const cancel = async (order: Order) => {
    if (!window.confirm(`¿Cancelar la orden ${formatOrderNumber(order.orderNumber)}?`)) return;
    try {
      await cancelMyOrder(order._id);
      if (editingId === order._id) closeEditor();
      setMessage(`Orden ${formatOrderNumber(order.orderNumber)} cancelada.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cancelar la orden");
    }
  };

  const active = (orders ?? []).filter((o) => isActive(o.status));
  const past = (orders ?? []).filter((o) => !isActive(o.status));
  const editorOpen = draft.length > 0;

  return (
    <div id="merch" className="profileSection merchSection" data-tour="merch">
      <h3>Merch 👕</h3>
      <p className="voiceIntro">
        Crea una orden con la ropa del retiro que quieras: camisetas, busos, chaquetas, tulas, gorras y canguros. Aquí mismo
        verás su estado y cuánto llevas pagado.
      </p>

      {prices && (
        <div className="merchPrices">
          {PRICE_LABELS.map((p) => (
            <span key={p.key} className="merchPrice">
              {p.label} <strong>{formatCOP(prices[p.key])}</strong>
            </span>
          ))}
        </div>
      )}

      {message && <p className="testimonyMessage">{message}</p>}

      {editorOpen ? (
        <div className="ordCard">
          <div className="ordCardHead">
            <span className="ordCardNumber">
              {editingId
                ? `Editar orden ${formatOrderNumber(orders?.find((o) => o._id === editingId)?.orderNumber ?? 0)}`
                : "Nueva orden"}
            </span>
          </div>
          <OrderItemsEditor items={draft} onChange={setDraft} prices={prices} defaultCut={defaultCut} />
          <label className="ordField">
            <span>Nota para el equipo (opcional)</span>
            <textarea
              className="ordTextarea"
              maxLength={300}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: la talla especial es XL ancha"
            />
          </label>
          {error && <p className="ordError">{error}</p>}
          <div className="ordEditorFoot">
            <button type="button" className="toolbarButton" onClick={closeEditor} disabled={saving}>
              Cancelar
            </button>
            <button type="button" className="toolbarButton primary" onClick={save} disabled={saving || !draft.length}>
              {saving ? "Guardando…" : editingId ? "Guardar cambios" : "Crear orden"}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <button type="button" className="toolbarButton primary" onClick={startNew} disabled={ordersClosed}>
            + Crear orden
          </button>
          {ordersClosed && (
            <p className="serviceStatusLocked ordLocked" role="status">
              🔒 Pronto podrás solicitar tu merch. Por ahora no estamos recibiendo órdenes nuevas.
            </p>
          )}
          {error && <p className="ordError">{error}</p>}
        </div>
      )}

      <div className="ordSubhead">
        <h4>Tus órdenes activas</h4>
        {past.length > 0 && (
          <button type="button" className="ordLinkButton" onClick={() => setShowPast((v) => !v)}>
            {showPast ? "Ocultar anteriores" : `Ver anteriores (${past.length})`}
          </button>
        )}
      </div>

      {orders === null ? (
        <p className="ordHint">Cargando…</p>
      ) : active.length === 0 ? (
        <p className="ordHint">No tienes órdenes activas.</p>
      ) : (
        <div className="ordCards">
          {active.map((o) => (
            <OrderCard key={o._id} order={o} onEdit={() => startEdit(o)} onCancel={() => cancel(o)} />
          ))}
        </div>
      )}

      {showPast && past.length > 0 && (
        <div className="ordCards">
          {past.map((o) => (
            <OrderCard key={o._id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
};

const OrderCard = ({ order, onEdit, onCancel }: { order: Order; onEdit?: () => void; onCancel?: () => void }) => {
  const due = Math.max(0, order.total - order.paidAmount);
  const pay = paymentStateOf(order);
  const editable = order.status === "RECIBIDO";
  const step = STATUS_FLOW.indexOf(order.status);
  return (
    <article className="ordCard">
      <div className="ordCardHead">
        <span className="ordCardNumber ordNumber">
          <span className="ordDot" style={{ "--st": STATUS_INFO[order.status].color } as React.CSSProperties} aria-hidden="true" />
          Orden {formatOrderNumber(order.orderNumber)}
        </span>
        <StatusPill status={order.status} />
        <span className="ordCardDate">{dateOf(order.createdAt)}</span>
        {(onEdit || onCancel) && editable && (
          <span className="ordCardActions">
            {onEdit && (
              <button type="button" className="toolbarButton" onClick={onEdit}>
                Editar
              </button>
            )}
            {onCancel && order.paidAmount === 0 && (
              <button type="button" className="toolbarButton" onClick={onCancel}>
                Cancelar
              </button>
            )}
          </span>
        )}
      </div>

      {order.status !== "CANCELADO" && (
        <ol className="ordSteps" aria-label="Estado de la orden">
          {STATUS_FLOW.map((s, i) => (
            <li key={s} className={`${i <= step ? "is-done" : ""}${i === step ? " is-current" : ""}`}>
              {STATUS_INFO[s].label}
            </li>
          ))}
        </ol>
      )}
      <p className="ordCardNote">{STATUS_INFO[order.status].hint}</p>

      <ul className="ordCardItems">
        {order.items.map((item, i) => (
          <li key={i}>
            <span>{describeItem(item)}</span>
            <span>{formatCOP(item.lineTotal)}</span>
          </li>
        ))}
      </ul>

      {order.notes && <p className="ordCardNote">Tu nota: {order.notes}</p>}

      {order.status !== "CANCELADO" && (
        <div className="ordCardMoney">
          <span>
            Total <strong>{formatCOP(order.total)}</strong>
          </span>
          <span>
            Pagado <strong>{formatCOP(order.paidAmount)}</strong>
          </span>
          <span className={pay === "PAGADO" ? "isPaid" : "isDue"}>
            {pay === "PAGADO" ? (
              "¡Orden pagada!"
            ) : (
              <>
                Falta <strong>{formatCOP(due)}</strong>
              </>
            )}
          </span>
        </div>
      )}
    </article>
  );
};

export default ProfileOrders;
