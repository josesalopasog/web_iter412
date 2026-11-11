import { formatCOP } from "./paymentConfig";
import StatValue from "./StatValue";
import KpiCard from "../../Admin/ui/KpiCard";
import type { Tone } from "../../Admin/ui/KpiCard";
import { UsersIcon } from "../../Admin/icons";

type Props = {
  view: "soldados" | "servidores";
  total: number;
  hombres: number;
  mujeres: number;
  totalPaid: number;
  totalDue: number;
  totalSubsidy: number;
  hombresPaid: number;
  hombresDue: number;
  hombresSubsidy: number;
  mujeresPaid: number;
  mujeresDue: number;
  mujeresSubsidy: number;
  /** Inscripciones nuevas (aún no vistas) dentro de cada total: se animan con "+N". */
  added: { total: number; hombres: number; mujeres: number };
};

const PaymentRows = ({ paid, subsidy, due }: { paid: number; subsidy: number; due: number }) => (
  <span className="kpiPaymentRows">
    <span>
      Pagado <strong>{formatCOP(paid)}</strong>
    </span>
    <span>
      Subsidiado <strong>{formatCOP(subsidy)}</strong>
    </span>
    <span>
      Falta <strong>{formatCOP(due)}</strong>
    </span>
  </span>
);

// Tarjetas de total, hombres y mujeres (estilo de KpiCard, con el "+N" de inscripciones nuevas).
const StatsCards: React.FC<Props> = (p) => {
  const cards: { key: "total" | "hombres" | "mujeres"; label: string; tone: Tone; value: number; paid: number; subsidy: number; due: number }[] = [
    {
      key: "total",
      label: p.view === "soldados" ? "Total soldados" : "Total servidores",
      tone: "todos",
      value: p.total,
      paid: p.totalPaid,
      subsidy: p.totalSubsidy,
      due: p.totalDue,
    },
    { key: "hombres", label: "Hombres", tone: "hombres", value: p.hombres, paid: p.hombresPaid, subsidy: p.hombresSubsidy, due: p.hombresDue },
    { key: "mujeres", label: "Mujeres", tone: "mujeres", value: p.mujeres, paid: p.mujeresPaid, subsidy: p.mujeresSubsidy, due: p.mujeresDue },
  ];

  return (
    <div className="statsKpiGrid">
      {cards.map((c) => (
        <KpiCard
          key={c.key}
          label={c.label}
          tone={c.tone}
          icon={UsersIcon}
          value={<StatValue key={`${p.view}-${c.key}`} value={c.value} added={p.added[c.key]} />}
          progress={c.paid + c.subsidy + c.due > 0 ? (c.paid + c.subsidy) / (c.paid + c.subsidy + c.due) : 0}
          detail={<PaymentRows paid={c.paid} subsidy={c.subsidy} due={c.due} />}
        />
      ))}
    </div>
  );
};

export default StatsCards;
