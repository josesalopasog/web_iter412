import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import { PageLoader } from "../../../components/Spinner";
import { bulkUpdateOrderStatus, deleteOrder, updateOrderPayment, updateOrderStatus } from "../../../api/orders";
import type { Order, OrderStatus } from "../../../api/orders";
import {
  ALL_STATUSES,
  PAYMENT_INFO,
  STATUS_INFO,
  describeOrder,
  formatOrderNumber,
  isActive,
  paymentStateOf,
  unitsOf,
} from "../../../orders/catalog";
import "../../../orders/orders.css";
import PaymentCell from "../../Dashboard/ui/PaymentCell";
import { downloadXlsx } from "../../Dashboard/ui/exportXlsx";
import { useAdminData } from "../AdminData";
import KpiCard from "../ui/KpiCard";
import { TablePagination } from "../ui/DataTable";
import { PageHeading, Segmented } from "../ui/PageParts";
import { BanknotesIcon, CartIcon, ChartBarIcon, CheckCircleIcon, ClipboardIcon, DownloadIcon, GearIcon, SearchIcon, TrashIcon } from "../icons";
import { formatCOP, formatNumber } from "../format";
import OrderModal from "./orders/OrderModal";
import { useOrders } from "./orders/useOrders";

type Tab = "ACTIVAS" | OrderStatus | "DEBEN" | "TODAS";
const PAGE_SIZE = 20;

const normalize = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const nameOf = (o: Order) => `${o.customer.firstNames} ${o.customer.lastNames}`.trim();
const matchesTab = (o: Order, tab: Tab) =>
  tab === "TODAS"
    ? true
    : tab === "ACTIVAS"
      ? isActive(o.status)
      : tab === "DEBEN"
        ? o.status !== "CANCELADO" && o.paidAmount < o.total
        : o.status === tab;

// Órdenes de merch: cada servidor las crea desde su perfil; aquí se confirman, se cobran, se
// marcan como encargadas al proveedor, listas y entregadas.
const Pedido = () => {
  const { user } = useAuth();
  const data = useAdminData();
  const { orders, isLoading, error, upsert, remove } = useOrders();
  const isSuperAdmin = user?.role === "SUPERADMIN";

  const [tab, setTab] = useState<Tab>("ACTIVAS");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<OrderStatus>("CONFIRMADO");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [modal, setModal] = useState<{ order: Order | null } | null>(null);

  const filtered = useMemo(() => {
    const q = normalize(search.trim());
    return orders.filter(
      (o) =>
        matchesTab(o, tab) &&
        (!q ||
          normalize(`${formatOrderNumber(o.orderNumber)} ${o.orderNumber} ${nameOf(o)} ${o.customer.phone} ${describeOrder(o)}`).includes(q))
    );
  }, [orders, tab, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const selectedRows = filtered.filter((o) => selected.has(o._id));
  const allOnPageSelected = pageRows.length > 0 && pageRows.every((o) => selected.has(o._id));

  const live = orders.filter((o) => o.status !== "CANCELADO");
  const totalValue = live.reduce((s, o) => s + o.total, 0);
  const totalPaid = live.reduce((s, o) => s + o.paidAmount, 0);
  const count = (status: OrderStatus) => orders.filter((o) => o.status === status).length;

  const run = async (fn: () => Promise<void>) => {
    setActionError(null);
    try {
      await fn();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo guardar");
    }
  };

  const changeStatus = (o: Order, status: OrderStatus) => run(async () => upsert(await updateOrderStatus(o._id, status)));

  const applyBulk = () =>
    run(async () => {
      setBusy(true);
      try {
        upsert(await bulkUpdateOrderStatus([...selected].filter((id) => filtered.some((o) => o._id === id)), bulkStatus));
        setSelected(new Set());
      } finally {
        setBusy(false);
      }
    });

  const removeOrder = (o: Order) => {
    if (!window.confirm(`¿Eliminar definitivamente la orden ${formatOrderNumber(o.orderNumber)}? Si solo no se hará, mejor cámbiala a "Cancelada".`)) return;
    run(async () => {
      await deleteOrder(o._id);
      remove(o._id);
    });
  };

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const togglePage = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const o of pageRows) {
        if (allOnPageSelected) next.delete(o._id);
        else next.add(o._id);
      }
      return next;
    });

  const exportRows = () =>
    downloadXlsx(
      "ordenes-merch.xlsx",
      "Órdenes",
      ["Orden", "Servidor", "Teléfono", "Correo", "Prendas", "Unidades", "Total", "Pagado", "Debe", "Pago", "Estado", "Nota", "Nota interna", "Fecha"],
      filtered.map((o) => [
        formatOrderNumber(o.orderNumber),
        nameOf(o),
        o.customer.phone,
        o.customer.email,
        describeOrder(o),
        String(unitsOf(o)),
        String(o.total),
        String(o.paidAmount),
        String(Math.max(0, o.total - o.paidAmount)),
        PAYMENT_INFO[paymentStateOf(o)].label,
        STATUS_INFO[o.status].label,
        o.notes,
        o.adminNotes ?? "",
        new Date(o.createdAt).toLocaleDateString("es-CO"),
      ])
    );

  if (isLoading || data.isLoading) return <PageLoader variant="inline" label="Cargando órdenes" />;

  const tabs: { value: Tab; label: string; dot?: string; count: number }[] = [
    { value: "ACTIVAS", label: "Activas", count: orders.filter((o) => isActive(o.status)).length },
    ...ALL_STATUSES.map((s) => ({ value: s as Tab, label: STATUS_INFO[s].label, dot: STATUS_INFO[s].color, count: count(s) })),
    { value: "DEBEN", label: "Con saldo", dot: "#dc2626", count: orders.filter((o) => matchesTab(o, "DEBEN")).length },
    { value: "TODAS", label: "Todas", count: orders.length },
  ];

  return (
    <div className="adPage">
      <PageHeading
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Pedido" }, { label: "Órdenes" }]}
        title="Órdenes de merch"
        subtitle="Los servidores crean sus órdenes desde el perfil. Aquí se confirman, se cobran y se siguen hasta la entrega."
      >
        <Link to="/dashboard/pedido" className="toolbarButton">
          <ChartBarIcon /> Ver analítica
        </Link>
        <Link to="/dashboard/pedido/precios" className="toolbarButton">
          <GearIcon /> Ajustes
        </Link>
        <button type="button" className="toolbarButton primary" onClick={() => setModal({ order: null })}>
          + Nueva orden
        </button>
      </PageHeading>

      {(error || actionError) && <p className="loginError">{error || actionError}</p>}

      <div className="kpiGrid">
        <KpiCard tone="info" label="Órdenes activas" icon={CartIcon} value={formatNumber(tabs[0].count)} detail={`${formatNumber(orders.length)} en total`} />
        <KpiCard tone="info" label="Por confirmar" icon={ClipboardIcon} value={formatNumber(count("RECIBIDO"))} detail="Recibidas, aún editables por el servidor" />
        <KpiCard
          tone="info"
          label="Pagado"
          icon={BanknotesIcon}
          value={formatCOP(totalPaid)}
          progress={totalValue ? totalPaid / totalValue : 0}
          detail={`de ${formatCOP(totalValue)} · falta ${formatCOP(Math.max(0, totalValue - totalPaid))}`}
        />
        <KpiCard tone="info" label="Listas para entregar" icon={CheckCircleIcon} value={formatNumber(count("LISTO"))} detail={`${formatNumber(count("ENCARGADO"))} encargadas al proveedor`} />
      </div>

      <div className="chartCard">
        <div className="dataTableBlock">
          <Segmented
            label="Estado"
            value={tab}
            onChange={(value) => {
              setTab(value);
              setPage(1);
              setSelected(new Set());
            }}
            options={tabs}
          />

          <div className="tableToolbar">
            <label className="tableSearch">
              <SearchIcon />
              <input
                type="search"
                placeholder="Buscar orden, servidor, teléfono o prenda"
                aria-label="Buscar orden"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </label>
            <button type="button" className="toolbarButton" onClick={exportRows} disabled={!filtered.length}>
              <DownloadIcon /> Exportar
            </button>
          </div>

          {selectedRows.length > 0 && (
            <div className="ordBulkBar">
              <strong>{selectedRows.length} seleccionadas</strong>
              <span>Cambiar estado a</span>
              <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value as OrderStatus)}>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_INFO[s].label}
                  </option>
                ))}
              </select>
              <button type="button" className="toolbarButton primary" onClick={applyBulk} disabled={busy}>
                {busy ? "Aplicando…" : "Aplicar"}
              </button>
              <button type="button" className="ordLinkButton" onClick={() => setSelected(new Set())}>
                Quitar selección
              </button>
            </div>
          )}

          {filtered.length === 0 ? (
            <p className="pageEmpty tableEmpty">{orders.length === 0 ? "Aún no hay órdenes." : "No hay órdenes con estos filtros."}</p>
          ) : (
            <div className="adTableWrapper">
              <table className="adTable">
                <thead>
                  <tr>
                    <th>
                      <input type="checkbox" checked={allOnPageSelected} onChange={togglePage} aria-label="Seleccionar órdenes de esta página" />
                    </th>
                    <th>Orden</th>
                    <th>Servidor</th>
                    <th>Prendas</th>
                    <th className="alignRight">Total</th>
                    <th>Pagado</th>
                    <th>Pago</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th className="alignRight">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((o) => {
                    const pay = paymentStateOf(o);
                    return (
                      <tr key={o._id}>
                        <td>
                          <input type="checkbox" checked={selected.has(o._id)} onChange={() => toggle(o._id)} aria-label={`Seleccionar ${formatOrderNumber(o.orderNumber)}`} />
                        </td>
                        <td className="cellStrong">
                          <span className="ordNumber">
                            <span
                              className="ordDot"
                              style={{ "--st": STATUS_INFO[o.status].color } as React.CSSProperties}
                              title={STATUS_INFO[o.status].label}
                              aria-label={STATUS_INFO[o.status].label}
                            />
                            {formatOrderNumber(o.orderNumber)}
                          </span>
                        </td>
                        <td>
                          <span className="miniListMain">
                            <span className="miniListTitle">{nameOf(o)}</span>
                            <span className="miniListMeta">{o.customer.phone || "-"}</span>
                          </span>
                        </td>
                        <td className="ordTableItems" title={o.notes ? `Nota: ${o.notes}` : undefined}>
                          {describeOrder(o)}
                          {(o.notes || o.adminNotes) && <span className="miniListMeta"> · 📝</span>}
                        </td>
                        <td className="alignRight">{formatCOP(o.total)}</td>
                        <td>
                          {o.status === "CANCELADO" ? (
                            formatCOP(o.paidAmount)
                          ) : (
                            <PaymentCell
                              amount={o.paidAmount}
                              max={o.total}
                              onChange={async (amount) => upsert(await updateOrderPayment(o._id, amount))}
                            />
                          )}
                        </td>
                        <td>
                          <span className={`statusPill ${PAYMENT_INFO[pay].pill}`}>{PAYMENT_INFO[pay].label}</span>
                        </td>
                        <td>
                          <select
                            className="ordStatusSelect"
                            style={{ "--st": STATUS_INFO[o.status].color } as React.CSSProperties}
                            value={o.status}
                            onChange={(e) => changeStatus(o, e.target.value as OrderStatus)}
                            aria-label={`Estado de ${formatOrderNumber(o.orderNumber)}`}
                          >
                            {ALL_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {STATUS_INFO[s].label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="cellMuted">{new Date(o.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}</td>
                        <td className="alignRight">
                          <span className="ordCardActions" style={{ display: "inline-flex", gap: 6 }}>
                            <button type="button" className="toolbarButton" onClick={() => setModal({ order: o })}>
                              Ver / editar
                            </button>
                            {isSuperAdmin && (
                              <button type="button" className="adIconButton" title="Eliminar orden" onClick={() => removeOrder(o)}>
                                <TrashIcon />
                              </button>
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > PAGE_SIZE && (
            <TablePagination
              first={(currentPage - 1) * PAGE_SIZE + 1}
              last={Math.min(currentPage * PAGE_SIZE, filtered.length)}
              total={filtered.length}
              page={currentPage}
              pageCount={pageCount}
              onPage={setPage}
            />
          )}
        </div>
      </div>

      {modal && (
        <OrderModal
          order={modal.order}
          servidores={data.servidores}
          prices={data.settings}
          onClose={() => setModal(null)}
          onSaved={(saved) => {
            upsert(saved);
            setModal(null);
          }}
        />
      )}
    </div>
  );
};

export default Pedido;
