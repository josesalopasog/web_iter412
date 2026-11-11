import { Link, useNavigate } from "react-router-dom";
import { PageLoader } from "../../../components/Spinner";
import PedidoTable from "../../Dashboard/ui/PedidoTable";
import { useAdminData } from "../AdminData";
import { PageHeading } from "../ui/PageParts";
import { ChartBarIcon } from "../icons";

// Tabla del pedido de merch de los servidores (camisetas, busos, tulas...), editable como siempre.
const Pedido = () => {
  const navigate = useNavigate();
  const data = useAdminData();

  if (data.isLoading) return <PageLoader variant="inline" label="Cargando datos" />;

  return (
    <div className="adPage">
      <PageHeading
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Pedido" }, { label: "Pedidos de merch" }]}
        title="Pedidos de merch"
        subtitle="Camisetas, busos, chaquetas, tulas, gorras y canguros que pidió cada servidor."
      >
        <Link to="/dashboard/pedido" className="toolbarButton">
          <ChartBarIcon /> Ver analítica
        </Link>
      </PageHeading>
      <PedidoTable
        rows={data.servidores}
        settings={data.settings}
        onEditField={data.editServidor}
        onResetMerch={data.resetMerch}
        onOpenSettings={() => navigate("/dashboard/pedido/precios")}
      />
    </div>
  );
};

export default Pedido;
