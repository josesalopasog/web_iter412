import { useMemo } from "react";
import { useAuth } from "../../../auth/AuthContext";
import { PageLoader } from "../../../components/Spinner";
import MerchSettingsForm from "../../Dashboard/ui/MerchSettingsForm";
import { computeOrderTotal } from "../../Dashboard/ui/merchPricing";
import { useAdminData } from "../AdminData";
import KpiCard from "../ui/KpiCard";
import { PageHeading } from "../ui/PageParts";
import { BanknotesIcon, CartIcon, ReceiptIcon } from "../icons";
import { formatCOP, formatNumber } from "../format";

// Precios de merch (antes un pop up en la tabla del pedido).
const MerchPrices = () => {
  const { user } = useAuth();
  const data = useAdminData();
  const canEdit = user?.role === "SUPERADMIN" || user?.role === "TREASURER" || user?.role === "ADMIN";

  const orders = useMemo(
    () => data.servidores.map((r) => ({ total: computeOrderTotal(r, data.settings), paid: Number(r.merchPaymentAmount) || 0 })).filter((o) => o.total > 0),
    [data.servidores, data.settings]
  );
  const total = orders.reduce((sum, o) => sum + o.total, 0);
  const paid = orders.reduce((sum, o) => sum + o.paid, 0);

  if (data.isLoading) return <PageLoader variant="inline" label="Cargando datos" />;

  return (
    <div className="adPage">
      <PageHeading
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Pedido de merch" }, { label: "Precios" }]}
        title="Precios de merch"
        subtitle={canEdit ? "Al guardar, el total de cada pedido se recalcula con los precios nuevos." : "Solo un ADMIN, SUPERADMIN o TESORERO puede editar estos valores."}
      />

      <div className="kpiGrid kpiGridThree">
        <KpiCard tone="info" label="Pedidos" icon={CartIcon} value={formatNumber(orders.length)} detail="Servidores que pidieron algo" />
        <KpiCard tone="info" label="Valor del pedido" icon={ReceiptIcon} value={formatCOP(total)} detail="Con los precios actuales" />
        <KpiCard tone="info" label="Por cobrar" icon={BanknotesIcon} value={formatCOP(Math.max(0, total - paid))} progress={total ? paid / total : 0} detail={`pagado ${formatCOP(paid)}`} />
      </div>

      <MerchSettingsForm settings={data.settings} canEdit={canEdit} onSaved={data.setSettings} />
    </div>
  );
};

export default MerchPrices;
