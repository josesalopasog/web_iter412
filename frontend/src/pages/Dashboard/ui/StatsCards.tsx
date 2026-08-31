type Props = {
  view: "soldados" | "servidores";
  total: number;
  hombres: number;
  mujeres: number;
};

const StatsCards: React.FC<Props> = ({ view, total, hombres, mujeres }) => {
  const totalLabel = view === "soldados" ? "Total soldados" : "Total servidores";

  return (
    <div className="statsGrid">
      <div className="statCard total">
        <div className="statLabel">{totalLabel}</div>
        <div className="statValue">{total}</div>
      </div>
      <div className="statCard hombres">
        <div className="statLabel">Hombres</div>
        <div className="statValue">{hombres}</div>
      </div>
      <div className="statCard mujeres">
        <div className="statLabel">Mujeres</div>
        <div className="statValue">{mujeres}</div>
      </div>
    </div>
  );
};

export default StatsCards;
