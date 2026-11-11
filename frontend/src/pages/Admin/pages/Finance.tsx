import { useState } from "react";
import { getFinanceSummary, type Debtor, type PaymentMovement } from "../../../api/dashboard";
import { useReport } from "../useReport";
import KpiCard from "../ui/KpiCard";
import { BarList, ChartCard, ChartLegend, DonutChart, StackedBars } from "../ui/Charts";
import { COLORS } from "../ui/colors";
import DataTable, { type DataColumn } from "../ui/DataTable";
import { PageHeading, PageState, RangeSelector, type Range } from "../ui/PageParts";
import { BanknotesIcon, CartIcon, CheckCircleIcon, GiftIcon, ReceiptIcon, ShieldIcon, HandHeartIcon } from "../icons";
import { formatCOP, formatCompactCOP, formatDateTime, formatNumber, formatPercent, formatRegNum, formatShortDay, getChange } from "../format";

const incomeSeries = [
  { key: "soldados", name: "Soldados", color: COLORS.finanzas },
  { key: "servidores", name: "Servidores", color: COLORS.finanzas2 },
  { key: "merch", name: "Merch", color: COLORS.info },
];

const KIND_LABELS: Record<PaymentMovement["kind"], string> = { pago: "Pago", subsidio: "Subsidio", merch: "Merch" };

const debtorColumns: DataColumn<Debtor>[] = [
  { key: "num", label: "#", className: "cellStrong", render: (d) => formatRegNum(d.registrationNumber), value: (d) => formatRegNum(d.registrationNumber) },
  { key: "name", label: "Nombre", render: (d) => d.name, value: (d) => d.name },
  {
    key: "group",
    label: "Tipo",
    render: (d) => <span className={`typeTag ${d.group}`}>{d.group === "soldados" ? "Soldado" : "Servidor"}</span>,
    value: (d) => (d.group === "soldados" ? "Soldado" : "Servidor"),
  },
  { key: "paid", label: "Pagado", align: "right", render: (d) => formatCOP(d.paid), value: (d) => d.paid },
  { key: "subsidy", label: "Subsidio", align: "right", className: "cellMuted", render: (d) => formatCOP(d.subsidy), value: (d) => d.subsidy },
  { key: "due", label: "Falta", align: "right", className: "cellNegative", render: (d) => formatCOP(d.due), value: (d) => d.due },
  {
    key: "status",
    label: "Estado",
    render: (d) => <span className={`statusPill ${d.paid + d.subsidy > 0 ? "parcial" : "sinPago"}`}>{d.paid + d.subsidy > 0 ? "Abono" : "Sin pago"}</span>,
    value: (d) => (d.paid + d.subsidy > 0 ? "Abono" : "Sin pago"),
  },
];

const movementColumns: DataColumn<PaymentMovement>[] = [
  { key: "date", label: "Fecha", className: "cellMuted", render: (m) => formatDateTime(m.date), value: (m) => formatDateTime(m.date) },
  { key: "person", label: "Persona", render: (m) => m.person, value: (m) => m.person },
  {
    key: "kind",
    label: "Concepto",
    render: (m) => (
      <span className={`typeTag ${m.kind === "pago" ? m.group : m.kind}`}>
        {KIND_LABELS[m.kind]} · {m.group === "soldados" ? "Soldado" : "Servidor"}
      </span>
    ),
    value: (m) => `${KIND_LABELS[m.kind]} ${m.group}`,
  },
  {
    key: "delta",
    label: "Movimiento",
    align: "right",
    render: (m) => <span className={m.delta >= 0 ? "cellPositive" : "cellNegative"}>{`${m.delta >= 0 ? "+" : "−"}${formatCOP(Math.abs(m.delta))}`}</span>,
    value: (m) => m.delta,
  },
  { key: "amount", label: "Total de la persona", align: "right", render: (m) => formatCOP(m.amount), value: (m) => m.amount },
  { key: "by", label: "Registró", className: "cellMuted", render: (m) => m.by, value: (m) => m.by },
];

// Dinero del retiro: lo recaudado, lo que falta, subsidio, merch y quién debe.
const Finance = () => {
  const [range, setRange] = useState<Range>(30);
  const { data, isLoading, error } = useReport(getFinanceSummary, range);

  return (
    <div className="adPage">
      <PageHeading
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Finanzas" }]}
        title="Finanzas"
        subtitle={
          <>
            Pagos de inscripción, subsidio y merch
            {data && ` · movimientos del ${formatShortDay(data.from)} al ${formatShortDay(data.to)}`}.
          </>
        }
      >
        <RangeSelector value={range} onChange={setRange} />
      </PageHeading>

      <PageState isLoading={isLoading} error={error} />

      {data && (
        <>
          <div className="kpiGrid">
            <KpiCard tone="finanzas"
              label="Ingresos del periodo"
              icon={BanknotesIcon}
              value={formatCOP(data.kpis.income.value)}
              change={getChange(data.kpis.income)}
              detail={`${formatNumber(data.kpis.movements)} abonos · vs. ${range} días anteriores`}
            />
            <KpiCard tone="finanzas"
              label="Recaudado (inscripciones)"
              icon={CheckCircleIcon}
              value={formatCOP(data.kpis.paid)}
              progress={data.kpis.collectionRate}
              detail={`${formatPercent(data.kpis.collectionRate)} cubierto con subsidio · meta ${formatCOP(data.kpis.expected)}`}
            />
            <KpiCard tone="finanzas" label="Falta por recaudar" icon={ReceiptIcon} value={formatCOP(data.kpis.due)} detail={`${formatNumber(data.debtors.length)} personas con saldo`} />
            <KpiCard tone="finanzas"
              label="Subsidio"
              icon={GiftIcon}
              value={formatCOP(data.kpis.subsidy.used)}
              progress={data.kpis.subsidy.cap ? data.kpis.subsidy.used / data.kpis.subsidy.cap : 0}
              detail={`quedan ${formatCOP(Math.max(0, data.kpis.subsidy.cap - data.kpis.subsidy.used))} de ${formatCOP(data.kpis.subsidy.cap)}`}
            />
            <KpiCard tone="finanzas"
              label="Soldados"
              icon={ShieldIcon}
              value={formatCOP(data.soldados.paid)}
              progress={data.soldados.expected ? (data.soldados.paid + data.soldados.subsidy) / data.soldados.expected : 0}
              detail={`falta ${formatCOP(data.soldados.due)} · ${formatNumber(data.soldados.count)} × ${formatCOP(data.soldados.price)}`}
            />
            <KpiCard tone="finanzas"
              label="Servidores activos"
              icon={HandHeartIcon}
              value={formatCOP(data.servidores.paid)}
              progress={data.servidores.expected ? (data.servidores.paid + data.servidores.subsidy) / data.servidores.expected : 0}
              detail={`falta ${formatCOP(data.servidores.due)} · ${formatNumber(data.servidores.count)} × ${formatCOP(data.servidores.price)}`}
            />
            <KpiCard tone="info"
              label="Merch pagado"
              icon={CartIcon}
              value={formatCOP(data.kpis.merch.paid)}
              progress={data.kpis.merch.expected ? data.kpis.merch.paid / data.kpis.merch.expected : 0}
              detail={`de ${formatCOP(data.kpis.merch.expected)} · ${formatNumber(data.kpis.merch.orders)} pedidos`}
            />
            <KpiCard tone="info"
              label="Merch por cobrar"
              icon={ReceiptIcon}
              value={formatCOP(Math.max(0, data.kpis.merch.expected - data.kpis.merch.paid))}
              detail="Camisetas, busos, tulas, gorras y canguros"
            />
          </div>

          <div className="pageGrid pageGridMain">
            <ChartCard title="Ingresos por día" subtitle="Abonos registrados (inscripción y merch)" headline={formatCOP(data.kpis.income.value)}>
              <ChartLegend
                items={incomeSeries.map((s) => ({
                  label: s.name,
                  color: s.color,
                  value: formatCOP(data.series.reduce((sum, d) => sum + Number(d[s.key as "soldados"]), 0)),
                }))}
              />
              <StackedBars data={data.series} series={incomeSeries} format={formatCOP} axisFormat={formatCompactCOP} label="Ingresos por día" height={260} />
            </ChartCard>
            <ChartCard title="Composición del recaudo" subtitle="Inscripciones de soldados y servidores activos">
              <DonutChart
                emptyText="Aún no hay inscritos."
                centerLabel="meta"
                centerValue={formatCompactCOP(data.kpis.expected)}
                format={formatCOP}
                items={[
                  { label: "Pagado soldados", value: data.soldados.paid, color: COLORS.finanzas },
                  { label: "Pagado servidores", value: data.servidores.paid, color: COLORS.finanzas2 },
                  { label: "Subsidio", value: data.soldados.subsidy + data.servidores.subsidy, color: COLORS.subsidio },
                  { label: "Falta", value: data.kpis.due, color: COLORS.negativo },
                ]}
              />
            </ChartCard>
          </div>

          <div className="pageGrid pageGridHalf">
            <ChartCard title="Estado de pago de soldados" subtitle={`${formatNumber(data.soldados.count)} inscritos`}>
              <BarList
                emptyText="Aún no hay soldados."
                items={[
                  { label: "Pago completo", value: data.soldados.status.completo, display: formatNumber(data.soldados.status.completo), color: COLORS.positivo },
                  { label: "Abono", value: data.soldados.status.parcial, display: formatNumber(data.soldados.status.parcial), color: COLORS.parcial },
                  { label: "Sin pago", value: data.soldados.status.sinPago, display: formatNumber(data.soldados.status.sinPago), color: COLORS.negativo },
                ]}
              />
            </ChartCard>
            <ChartCard title="Estado de pago de servidores" subtitle={`${formatNumber(data.servidores.count)} activos`}>
              <BarList
                emptyText="Aún no hay servidores activos."
                items={[
                  { label: "Pago completo", value: data.servidores.status.completo, display: formatNumber(data.servidores.status.completo), color: COLORS.positivo },
                  { label: "Abono", value: data.servidores.status.parcial, display: formatNumber(data.servidores.status.parcial), color: COLORS.parcial },
                  { label: "Sin pago", value: data.servidores.status.sinPago, display: formatNumber(data.servidores.status.sinPago), color: COLORS.negativo },
                ]}
              />
            </ChartCard>
          </div>

          <ChartCard title="Saldos pendientes" subtitle="Quién debe y cuánto, de mayor a menor">
            <DataTable
              id="saldos-pendientes"
              rows={data.debtors}
              columns={debtorColumns}
              getRowId={(d) => d._id}
              tabs={[
                { value: "todos", label: "Todos" },
                { value: "soldados", label: "Soldados", match: (d) => d.group === "soldados", dot: COLORS.soldados },
                { value: "servidores", label: "Servidores", match: (d) => d.group === "servidores", dot: COLORS.servidores },
                { value: "sinPago", label: "Sin pago", match: (d) => d.paid + d.subsidy === 0, dot: COLORS.negativo },
              ]}
              searchPlaceholder="Buscar por nombre o #"
              emptyText="¡Todos están al día!"
              pageSize={10}
            />
          </ChartCard>

          <ChartCard title="Movimientos recientes" subtitle="Últimos cambios de pago, subsidio y merch del periodo">
            <DataTable
              id="movimientos"
              rows={data.recentMovements}
              columns={movementColumns}
              getRowId={(m) => `${m.date}-${m.person}-${m.kind}`}
              searchPlaceholder="Buscar movimiento"
              emptyText="No hubo movimientos en este periodo."
              pageSize={10}
            />
          </ChartCard>
        </>
      )}
    </div>
  );
};

export default Finance;
