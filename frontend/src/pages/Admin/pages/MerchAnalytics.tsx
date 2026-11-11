import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import { PageLoader } from "../../../components/Spinner";
import type { ServidorRecord } from "../../../api/adminUsers";
import { MERCH_LABELS, SHIRT_COLORS, asStringArray, computeOrderTotal, isHombre, isMujer } from "../../Dashboard/ui/merchPricing";
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
const SHIRT_COLOR_HEX: Record<string, string> = { BLANCA: "#cbd5e1", VERDE: "#16a34a", AZUL: "#2563eb" };

const genderOf = (r: ServidorRecord) => (isHombre(r.gender) ? "Hombre" : isMujer(r.gender) ? "Mujer" : "Otro");
const sizeOf = (size: unknown, other: unknown) =>
  size === "OTRO" ? { size: String(other || "Especial").toUpperCase(), special: true } : { size: String(size || "M"), special: false };

/** Cada prenda pedida, una por fila (una camiseta por cada color elegido). */
const unitsOf = (r: ServidorRecord): Unit[] => {
  const base = { personId: r._id, person: `${r.firstNames} ${r.lastNames}`, phone: String(r.phone ?? ""), gender: genderOf(r) };
  const units: Unit[] = [];
  if (r.needsShirt === "SI") {
    const { size, special } = sizeOf(r.shirtSize, r.shirtSizeOther);
    const colors = asStringArray(r.shirtColors);
    for (const code of colors.length ? colors : ["BLANCA"]) {
      const label = SHIRT_COLORS.find((c) => c.code === code)?.label ?? code;
      units.push({ ...base, category: "Camisetas", item: `Camiseta ${label.toLowerCase()}`, color: code, size, special });
    }
  }
  for (const code of asStringArray(r.merchItems)) {
    if (code === "BUSO_CERRADO" || code === "CHAQUETA_ABIERTA") {
      const { size, special } = sizeOf(r.merchSize, r.merchSizeOther);
      units.push({ ...base, category: "Busos y chaquetas", item: MERCH_LABELS[code], color: "", size, special });
    } else if (MERCH_LABELS[code]) {
      units.push({ ...base, category: "Accesorios", item: MERCH_LABELS[code], color: "", gender: "Unisex", size: "Única", special: false });
    }
  }
  return units;
};

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
  const canEditMerch = user?.role === "SUPERADMIN" || user?.role === "TREASURER" || user?.role === "ADMIN";

  const { units, people, lines } = useMemo(() => {
    const allUnits: Unit[] = [];
    const allPeople: Person[] = [];
    for (const r of data.servidores) {
      const u = unitsOf(r);
      if (!u.length) continue;
      allUnits.push(...u);
      const total = computeOrderTotal(r, s);
      const paid = Number(r.merchPaymentAmount) || 0;
      const counts = new Map<string, number>();
      for (const x of u) {
        const label = `${x.item}${x.size !== "Única" ? ` ${x.size}` : ""}`;
        counts.set(label, (counts.get(label) ?? 0) + 1);
      }
      allPeople.push({
        _id: r._id,
        name: `${r.firstNames} ${r.lastNames}`,
        phone: String(r.phone ?? ""),
        units: u.length,
        total,
        paid,
        due: Math.max(0, total - paid),
        status: total > 0 && paid >= total ? "completo" : paid > 0 ? "parcial" : "sinPago",
        detail: [...counts.entries()].map(([k, n]) => (n > 1 ? `${n}× ${k}` : k)).join(", "),
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
  }, [data.servidores, s]);

  if (data.isLoading) return <PageLoader variant="inline" label="Cargando datos" />;

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
    { done: due === 0, text: due ? `Cobrar ${formatCOP(due)} a ${people.filter((p) => p.due > 0).length} servidores antes de pagar al proveedor.` : "Todo el merch está pagado." },
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
        subtitle="Lo que hay que encargar al proveedor, por prenda, corte y talla, y cómo van los pagos."
      >
        {canEditMerch && (
          <Link to="/dashboard/pedido/precios" className="toolbarButton">
            <GearIcon /> Precios
          </Link>
        )}
        <Link to="/dashboard/pedido/tabla" className="toolbarButton primary">
          <CartIcon /> Ver pedidos
        </Link>
      </PageHeading>

      <div className="kpiGrid">
        <KpiCard tone="info" label="Servidores con pedido" icon={UsersIcon} value={formatNumber(people.length)} detail={`de ${formatNumber(data.servidores.length)} servidores`} />
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
        <KpiCard tone="info" label="Por cobrar" icon={ReceiptIcon} value={formatCOP(due)} detail={`${people.filter((p) => p.due > 0).length} servidores con saldo`} />
        <KpiCard tone="info" label="Pedidos pagados" icon={CheckCircleIcon} value={formatNumber(statusCount("completo"))} detail={`${statusCount("parcial")} con abono · ${statusCount("sinPago")} sin pago`} />
        <KpiCard tone="info"
          label="Ticket promedio"
          icon={ClipboardIcon}
          value={formatCOP(people.length ? total / people.length : 0)}
          detail={`${(people.length ? units.length / people.length : 0).toFixed(1).replace(".", ",")} prendas por servidor`}
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

      <ChartCard title="Pagos por servidor" subtitle="Quién debe su merch, de mayor a menor saldo">
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
