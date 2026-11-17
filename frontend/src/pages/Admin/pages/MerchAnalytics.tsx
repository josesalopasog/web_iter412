import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import { PageLoader } from "../../../components/Spinner";
import type { Order } from "../../../api/orders";
import { COLORS as SHIRT_COLORS, COLOR_LABEL, PRODUCT_LABEL, STATUS_INFO, describeItem, formatOrderNumber, isActive } from "../../../orders/catalog";
import { useOrders } from "./orders/useOrders";
import { useAdminData } from "../AdminData";
import KpiCard from "../ui/KpiCard";
import { BarList, ChartCard, ChartLegend, DonutChart } from "../ui/Charts";
import { COLORS } from "../ui/colors";
import DataTable, { type DataColumn } from "../ui/DataTable";
import { PageHeading, Segmented } from "../ui/PageParts";
import { BanknotesIcon, CartIcon, CheckCircleIcon, ClipboardIcon, GearIcon, ReceiptIcon, SparklesIcon, UsersIcon } from "../icons";
import { formatCOP, formatNumber, formatPercent } from "../format";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

type Unit = {
  personId: string;
  person: string;
  phone: string;
  category: "Camisetas" | "Busos y chaquetas" | "Accesorios";
  item: string;
  color: string;
  gender: string;
  size: string;
  special: boolean;
};

type SupplierLine = { key: string; category: Unit["category"]; item: string; gender: string; size: string; count: number; special: boolean };

type Person = {
  _id: string;
  order: string;
  name: string;
  phone: string;
  units: number;
  total: number;
  paid: number;
  due: number;
  status: "completo" | "parcial" | "sinPago";
  detail: string;
};

const CATEGORY_ORDER: Unit["category"][] = ["Camisetas", "Busos y chaquetas", "Accesorios"];
const SIZE_ORDER = ["S", "M", "L"];
const SHIRT_COLOR_HEX: Record<string, string> = { BLANCA: "#cbd5e1", VERDE: "#16a34a", AZUL: "#2563eb", NEGRA: "#000000" };

/** Cada prenda pedida, una por unidad (una camiseta por cada unidad de cada línea). */
const unitsOf = (o: Order): Unit[] => {
  const base = { personId: o._id, person: `${o.customer.firstNames} ${o.customer.lastNames}`, phone: o.customer.phone ?? "" };
  const units: Unit[] = [];
  for (const item of o.items) {
    const category: Unit["category"] =
      item.product === "CAMISETA" ? "Camisetas" : item.product === "BUSO_CERRADO" || item.product === "CHAQUETA_ABIERTA" ? "Busos y chaquetas" : "Accesorios";
    const sized = category !== "Accesorios";
    const special = sized && item.size === "OTRO";
    const unit: Unit = {
      ...base,
      category,
      item: item.product === "CAMISETA" ? `Camiseta ${(COLOR_LABEL[item.color] ?? item.color).toLowerCase()}` : PRODUCT_LABEL[item.product],
      color: item.color,
      gender: sized ? (item.cut === "MUJER" ? "Mujer" : "Hombre") : "Unisex",
      size: sized ? (special ? (item.sizeOther || "Especial").toUpperCase() : item.size || "M") : "Única",
      special,
    };
    for (let i = 0; i < item.quantity; i++) units.push(unit);
  }
  return units;
};

type OrderScope = "porEncargar" | "activas" | "todas";
const ORDER_SCOPES: { value: OrderScope; label: string; match: (o: Order) => boolean }[] = [
  { value: "activas", label: "Activas", match: (o) => isActive(o.status) },
  { value: "porEncargar", label: "Por encargar", match: (o) => o.status === "RECIBIDO" || o.status === "CONFIRMADO" },
  { value: "todas", label: "Todas", match: (o) => o.status !== "CANCELADO" },
];

const supplierColumns: DataColumn<SupplierLine>[] = [
  { key: "category", label: "Categoría", className: "cellMuted", render: (l) => l.category, value: (l) => l.category },
  { key: "item", label: "Prenda", className: "cellStrong", render: (l) => l.item, value: (l) => l.item },
  { key: "gender", label: "Corte", render: (l) => l.gender, value: (l) => l.gender },
  {
    key: "size",
    label: "Talla",
    render: (l) => (l.special ? <span className="statusPill parcial">{l.size} · especial</span> : l.size),
    value: (l) => (l.special ? `${l.size} (especial)` : l.size),
  },
  { key: "count", label: "Cantidad", align: "right", className: "cellStrong", render: (l) => formatNumber(l.count), value: (l) => l.count },
];

const STATUS_LABEL = { completo: "Pagado", parcial: "Abono", sinPago: "Sin pago" } as const;

const personColumns: DataColumn<Person>[] = [
  { key: "order", label: "Orden", className: "cellStrong", render: (p) => p.order, value: (p) => p.order },
  { key: "name", label: "Servidor", className: "cellStrong", render: (p) => p.name, value: (p) => p.name },
  { key: "phone", label: "Teléfono", className: "cellMuted", render: (p) => p.phone || "-", value: (p) => p.phone },
  { key: "detail", label: "Pedido", className: "cellWrap", render: (p) => p.detail, value: (p) => p.detail },
  { key: "total", label: "Total", align: "right", render: (p) => formatCOP(p.total), value: (p) => p.total },
  { key: "paid", label: "Pagado", align: "right", render: (p) => formatCOP(p.paid), value: (p) => p.paid },
  { key: "due", label: "Debe", align: "right", className: "cellNegative", render: (p) => (p.due ? formatCOP(p.due) : "—"), value: (p) => p.due },
  { key: "status", label: "Estado", render: (p) => <span className={`statusPill ${p.status}`}>{STATUS_LABEL[p.status]}</span>, value: (p) => STATUS_LABEL[p.status] },
];

const specialColumns: DataColumn<Unit>[] = [
  { key: "person", label: "Servidor", className: "cellStrong", render: (u) => u.person, value: (u) => u.person },
  { key: "phone", label: "Teléfono", className: "cellMuted", render: (u) => u.phone || "-", value: (u) => u.phone },
  { key: "item", label: "Prenda", render: (u) => u.item, value: (u) => u.item },
  { key: "gender", label: "Corte", render: (u) => u.gender, value: (u) => u.gender },
  { key: "size", label: "Talla escrita", render: (u) => <span className="statusPill parcial">{u.size}</span>, value: (u) => u.size },
];

type Scope = "todos" | "Camisetas" | "Busos y chaquetas" | "Accesorios";

/*--- Matriz de tallas: columnas apiladas por talla para cada prenda ---*/
const SizeMatrix = ({ lines }: { lines: SupplierLine[] }) => {
  const sizes = [...new Set(lines.map((l) => l.size))].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a);
    const ib = SIZE_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
  });
  const rows = new Map<string, Record<string, string | number>>();
  for (const l of lines) {
    const key = `${l.item} ${l.gender === "Unisex" ? "" : l.gender.toLowerCase()}`.trim();
    const row = rows.get(key) ?? { name: key };
    row[l.size] = Number(row[l.size] ?? 0) + l.count;
    rows.set(key, row);
  }
  const palette = ["#a3dcf7", "#5cc0f0", "#1a9be0", "#0b6fa8", "#075985", "#bde9fc", "#9ca3af"];
  const data = [...rows.values()];
  if (!data.length) return <p className="pageEmpty">Aún no hay prendas pedidas.</p>;
  return (
    <>
      <ChartLegend items={sizes.map((s, i) => ({ label: `Talla ${s}`, color: palette[i % palette.length] }))} />
      <div className="chartArea" role="img" aria-label="Prendas por talla">
        <ResponsiveContainer width="100%" height={Math.max(220, data.length * 34)}>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid horizontal={false} stroke="var(--ad-border)" />
            <XAxis type="number" allowDecimals={false} tick={{ fill: "var(--ad-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={170} tick={{ fill: "var(--ad-text)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: "var(--ad-hover)" }} contentStyle={{ borderRadius: 8, borderColor: "var(--ad-border)", fontSize: 12 }} />
            {sizes.map((s, i) => (
              <Bar key={s} dataKey={s} name={`Talla ${s}`} stackId="t" fill={palette[i % palette.length]} maxBarSize={20} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

// Analítica del pedido de merch: lista de compra para el proveedor, tallas, pagos y pendientes.
const MerchAnalytics = () => {
  const { user } = useAuth();
  const data = useAdminData();
  const s = data.settings;
  const [scope, setScope] = useState<Scope>("todos");
  const [orderScope, setOrderScope] = useState<OrderScope>("activas");
  const { orders, isLoading: ordersLoading } = useOrders();
  const scopedOrders = useMemo(
    () => orders.filter(ORDER_SCOPES.find((x) => x.value === orderScope)!.match),
    [orders, orderScope]
  );
  const canEditMerch = user?.role === "SUPERADMIN" || user?.role === "TREASURER" || user?.role === "ADMIN";

  const { units, people, lines } = useMemo(() => {
    const allUnits: Unit[] = [];
    const allPeople: Person[] = [];
    for (const o of scopedOrders) {
      const u = unitsOf(o);
      if (!u.length) continue;
      allUnits.push(...u);
      allPeople.push({
        _id: o._id,
        order: formatOrderNumber(o.orderNumber),
        name: `${o.customer.firstNames} ${o.customer.lastNames}`,
        phone: o.customer.phone ?? "",
        units: u.length,
        total: o.total,
        paid: o.paidAmount,
        due: Math.max(0, o.total - o.paidAmount),
        status: o.total > 0 && o.paidAmount >= o.total ? "completo" : o.paidAmount > 0 ? "parcial" : "sinPago",
        detail: `${o.items.map(describeItem).join(", ")} · ${STATUS_INFO[o.status].label.toLowerCase()}`,
      });
    }
    const grouped = new Map<string, SupplierLine>();
    for (const u of allUnits) {
      const key = `${u.category}|${u.item}|${u.gender}|${u.size}`;
      const line = grouped.get(key) ?? { key, category: u.category, item: u.item, gender: u.gender, size: u.size, count: 0, special: u.special };
      line.count += 1;
      grouped.set(key, line);
    }
    const sorted = [...grouped.values()].sort(
      (a, b) =>
        CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) ||
        a.item.localeCompare(b.item) ||
        a.gender.localeCompare(b.gender) ||
        (SIZE_ORDER.indexOf(a.size) === -1 ? 99 : SIZE_ORDER.indexOf(a.size)) - (SIZE_ORDER.indexOf(b.size) === -1 ? 99 : SIZE_ORDER.indexOf(b.size))
    );
    return { units: allUnits, people: allPeople.sort((a, b) => b.due - a.due), lines: sorted };
  }, [scopedOrders]);

  if (data.isLoading || ordersLoading) return <PageLoader variant="inline" label="Cargando datos" />;

  const total = people.reduce((sum, p) => sum + p.total, 0);
  const paid = people.reduce((sum, p) => sum + p.paid, 0);
  const due = Math.max(0, total - paid);
  const specials = units.filter((u) => u.special);
  const byCategory = (c: Unit["category"]) => units.filter((u) => u.category === c).length;
  const statusCount = (st: Person["status"]) => people.filter((p) => p.status === st).length;
  const scopedLines = scope === "todos" ? lines : lines.filter((l) => l.category === scope);
  const shirtsByColor = SHIRT_COLORS.map((c) => ({ ...c, count: units.filter((u) => u.color === c.code).length }));
  const sizeTotals = (category: Unit["category"]) => {
    const m = new Map<string, number>();
    for (const u of units) if (u.category === category) m.set(u.size, (m.get(u.size) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };
  const topShirtSize = sizeTotals("Camisetas")[0];
  const topOuterSize = sizeTotals("Busos y chaquetas")[0];

  // Lo que conviene revisar antes de hacer el pedido.
  const checklist = [
    { done: specials.length === 0, text: specials.length ? `Confirmar ${specials.length} tallas especiales con el proveedor (recargo de ${formatCOP(s.extraSizePrice)} c/u).` : "No hay tallas especiales." },
    { done: due === 0, text: due ? `Cobrar ${formatCOP(due)} a ${people.filter((p) => p.due > 0).length} órdenes antes de pagar al proveedor.` : "Todo el merch está pagado." },
    { done: statusCount("sinPago") === 0, text: `${statusCount("sinPago")} servidores no han abonado nada a su pedido.` },
    { done: true, text: `Recaudado ${formatPercent(total ? paid / total : 0)} del valor total del pedido.` },
    ...(topShirtSize ? [{ done: true, text: `La talla de camiseta más pedida es la ${topShirtSize[0]} (${topShirtSize[1]}).` }] : []),
    ...(topOuterSize ? [{ done: true, text: `En busos y chaquetas la talla más pedida es la ${topOuterSize[0]} (${topOuterSize[1]}).` }] : []),
  ];

  return (
    <div className="adPage">
      <PageHeading
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Pedido" }, { label: "Analítica del pedido" }]}
        title="Analítica del pedido de merch"
        subtitle="Lo que hay que encargar al proveedor, por prenda, corte y talla, y cómo van los pagos de las órdenes."
      >
        <Segmented
          label="Órdenes"
          value={orderScope}
          onChange={setOrderScope}
          options={ORDER_SCOPES.map((x) => ({ value: x.value, label: x.label, count: orders.filter(x.match).length }))}
        />
        {canEditMerch && (
          <Link to="/dashboard/pedido/precios" className="toolbarButton">
            <GearIcon /> Ajustes
          </Link>
        )}
        <Link to="/dashboard/pedido/tabla" className="toolbarButton primary">
          <CartIcon /> Ver órdenes
        </Link>
      </PageHeading>

      <div className="kpiGrid">
        <KpiCard tone="info" label="Órdenes" icon={UsersIcon} value={formatNumber(people.length)} detail={`${formatNumber(new Set(scopedOrders.map((o) => o.servidorId)).size)} servidores`} />
        <KpiCard tone="info"
          label="Prendas a encargar"
          icon={CartIcon}
          value={formatNumber(units.length)}
          detail={`${byCategory("Camisetas")} camisetas · ${byCategory("Busos y chaquetas")} busos/chaquetas · ${byCategory("Accesorios")} accesorios`}
        />
        <KpiCard tone="info" label="Valor del pedido" icon={ReceiptIcon} value={formatCOP(total)} detail="Precio de venta a los servidores" />
        <KpiCard tone="info"
          label="Tallas especiales"
          icon={SparklesIcon}
          value={formatNumber(specials.length)}
          detail={specials.length ? "Revisar medidas antes de pedir" : "Ninguna"}
        />
        <KpiCard tone="info" label="Pagado" icon={BanknotesIcon} value={formatCOP(paid)} progress={total ? paid / total : 0} detail={`${formatPercent(total ? paid / total : 0)} del pedido`} />
        <KpiCard tone="info" label="Por cobrar" icon={ReceiptIcon} value={formatCOP(due)} detail={`${people.filter((p) => p.due > 0).length} órdenes con saldo`} />
        <KpiCard tone="info" label="Pedidos pagados" icon={CheckCircleIcon} value={formatNumber(statusCount("completo"))} detail={`${statusCount("parcial")} con abono · ${statusCount("sinPago")} sin pago`} />
        <KpiCard tone="info"
          label="Ticket promedio"
          icon={ClipboardIcon}
          value={formatCOP(people.length ? total / people.length : 0)}
          detail={`${(people.length ? units.length / people.length : 0).toFixed(1).replace(".", ",")} prendas por orden`}
        />
      </div>

      <div className="pageGrid pageGridMain">
        <ChartCard
          title="Lista de compra para el proveedor"
          subtitle="Cantidades exactas por prenda, corte y talla. Exporta a Excel para enviarla."
          actions={
            <Segmented
              label="Categoría"
              value={scope}
              onChange={setScope}
              options={[
                { value: "todos", label: "Todo", count: units.length },
                ...CATEGORY_ORDER.map((c) => ({ value: c, label: c, count: byCategory(c) })),
              ]}
            />
          }
        >
          <DataTable
            key={scope}
            id="lista-de-compra-merch"
            rows={scopedLines}
            columns={supplierColumns}
            getRowId={(l) => l.key}
            searchPlaceholder="Buscar prenda o talla"
            emptyText="Nadie ha pedido merch todavía."
            pageSize={20}
          />
        </ChartCard>
        <ChartCard title="Antes de hacer el pedido" subtitle="Lo que conviene revisar">
          <ul className="insights">
            {checklist.map((c, i) => (
              <li key={i}>
                <span className={`insightDot ${c.done ? "up" : "down"}`} />
                <span>{c.text}</span>
              </li>
            ))}
          </ul>
        </ChartCard>
      </div>

      <div className="pageGrid pageGridMain">
        <ChartCard title="Prendas por talla" subtitle="Cada barra es una prenda y corte; los colores son las tallas">
          <SizeMatrix lines={lines} />
        </ChartCard>
        <ChartCard title="Estado de pago del merch" subtitle={`${people.length} pedidos`}>
          <DonutChart
            emptyText="Aún no hay pedidos."
            centerLabel="pedidos"
            centerValue={formatNumber(people.length)}
            format={formatNumber}
            items={[
              { label: "Pagado", value: statusCount("completo"), color: COLORS.positivo },
              { label: "Abono", value: statusCount("parcial"), color: COLORS.parcial },
              { label: "Sin pago", value: statusCount("sinPago"), color: COLORS.negativo },
            ]}
          />
        </ChartCard>
      </div>

      <div className="pageGrid pageGridThird">
        <ChartCard title="Camisetas por color">
          <BarList
            emptyText="Nadie pidió camiseta."
            items={shirtsByColor.map((c) => ({ label: c.label, value: c.count, display: formatNumber(c.count), color: SHIRT_COLOR_HEX[c.code] }))}
          />
        </ChartCard>
        <ChartCard title="Prendas por tipo">
          <DonutChart
            emptyText="Aún no hay prendas."
            centerLabel="prendas"
            centerValue={formatNumber(units.length)}
            format={formatNumber}
            items={CATEGORY_ORDER.map((c, i) => ({ label: c, value: byCategory(c), color: [COLORS.info, COLORS.info2, COLORS.info3][i] }))}
          />
        </ChartCard>
        <ChartCard title="Hombre vs. mujer" subtitle="Camisetas, busos y chaquetas">
          <BarList
            emptyText="Sin datos."
            items={["Hombre", "Mujer"].map((g) => {
              const n = units.filter((u) => u.gender === g).length;
              return { label: g, value: n, display: formatNumber(n), color: g === "Hombre" ? COLORS.hombres : COLORS.mujeres };
            })}
          />
        </ChartCard>
      </div>

      {specials.length > 0 && (
        <ChartCard title="Tallas especiales" subtitle="Lo que cada servidor escribió: confirma la medida antes de encargar">
          <DataTable
            id="tallas-especiales"
            rows={specials}
            columns={specialColumns}
            getRowId={(u) => `${u.personId}-${u.item}`}
            searchPlaceholder="Buscar servidor"
            emptyText="No hay tallas especiales."
          />
        </ChartCard>
      )}

      <ChartCard title="Pagos por orden" subtitle="Quién debe su merch, de mayor a menor saldo">
        <DataTable
          id="pagos-merch"
          rows={people}
          columns={personColumns}
          getRowId={(p) => p._id}
          tabs={[
            { value: "debe", label: "Con saldo", match: (p) => p.due > 0, dot: COLORS.negativo },
            { value: "sinPago", label: "Sin pago", match: (p) => p.status === "sinPago", dot: COLORS.negativo },
            { value: "completo", label: "Pagados", match: (p) => p.status === "completo", dot: COLORS.positivo },
            { value: "todos", label: "Todos" },
          ]}
          searchPlaceholder="Buscar servidor o teléfono"
          emptyText="Nadie ha pedido merch todavía."
          pageSize={10}
        />
      </ChartCard>

    </div>
  );
};

export default MerchAnalytics;
