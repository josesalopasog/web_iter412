import { formatCOP } from "./paymentConfig";

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
};

const StatsCards: React.FC<Props> = ({
  view,
  total,
  hombres,
  mujeres,
  totalPaid,
  totalDue,
  totalSubsidy,
  hombresPaid,
  hombresDue,
  hombresSubsidy,
  mujeresPaid,
  mujeresDue,
  mujeresSubsidy,
}) => {
  const totalLabel = view === "soldados" ? "Total soldados" : "Total servidores";

  return (
    <div className="statsGrid">
      <div className="statCard total">
        <div className="statLabel">{totalLabel}</div>
        <div className="statValue">{total}</div>
        <div className="statPaymentRow">
          <span>Pagado {formatCOP(totalPaid)}</span>
          <span>Subsidiado {formatCOP(totalSubsidy)}</span>
          <span>Falta {formatCOP(totalDue)}</span>
        </div>
      </div>
      <div className="statCard hombres">
        <div className="statLabel">Hombres</div>
        <div className="statValue">{hombres}</div>
        <div className="statPaymentRow">
          <span>Pagado {formatCOP(hombresPaid)}</span>
          <span>Subsidiado {formatCOP(hombresSubsidy)}</span>
          <span>Falta {formatCOP(hombresDue)}</span>
        </div>
      </div>
      <div className="statCard mujeres">
        <div className="statLabel">Mujeres</div>
        <div className="statValue">{mujeres}</div>
        <div className="statPaymentRow">
          <span>Pagado {formatCOP(mujeresPaid)}</span>
          <span>Subsidiado {formatCOP(mujeresSubsidy)}</span>
          <span>Falta {formatCOP(mujeresDue)}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
