import { useAuth } from "../../../auth/AuthContext";
import { PageLoader } from "../../../components/Spinner";
import MerchSettingsForm from "../../Dashboard/ui/MerchSettingsForm";
import { isActive } from "../../../orders/catalog";
import { useAdminData } from "../AdminData";
import KpiCard from "../ui/KpiCard";
import { PageHeading } from "../ui/PageParts";
import SwitchCard from "../ui/SwitchCard";
import { BanknotesIcon, CartIcon, ReceiptIcon } from "../icons";
import { formatCOP, formatNumber } from "../format";
import { useOrders } from "./orders/useOrders";

// Ajustes del merch: abrir o cerrar la creación de órdenes y los precios de cada prenda.
const MerchPrices = () => {
  const { user } = useAuth();
  const data = useAdminData();
  const { orders, isLoading } = useOrders();
  const canEdit = user?.role === "SUPERADMIN" || user?.role === "TREASURER" || user?.role === "ADMIN";

  const live = orders.filter((o) => o.status !== "CANCELADO");
  const total = live.reduce((sum, o) => sum + o.total, 0);
  const paid = live.reduce((sum, o) => sum + o.paidAmount, 0);

  if (data.isLoading || isLoading) return <PageLoader variant="inline" label="Cargando datos" />;

  return (
    <div className="adPage">
      <PageHeading
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Pedido de merch" }, { label: "Ajustes" }]}
        title="Ajustes del merch"
        subtitle={
          canEdit
            ? "Abre o cierra la creación de órdenes y cambia los precios. Las órdenes nuevas o editadas usan los precios actuales."
            : "Solo un ADMIN, SUPERADMIN o TESORERO puede cambiar estos ajustes."
        }
      />

      <div className="kpiGrid kpiGridThree">
        <KpiCard tone="info" label="Órdenes activas" icon={CartIcon} value={formatNumber(orders.filter((o) => isActive(o.status)).length)} detail={`${formatNumber(orders.length)} en total`} />
        <KpiCard tone="info" label="Valor de las órdenes" icon={ReceiptIcon} value={formatCOP(total)} detail="Sin contar las canceladas" />
        <KpiCard tone="info" label="Por cobrar" icon={BanknotesIcon} value={formatCOP(Math.max(0, total - paid))} progress={total ? paid / total : 0} detail={`pagado ${formatCOP(paid)}`} />
      </div>

      <SwitchCard
        switchKey="merchOrdersOpen"
        title="Creación de órdenes"
        subtitle="Si los servidores pueden crear órdenes de merch desde su perfil."
        label="Permitir que los servidores creen órdenes"
        onText="Activada: en el perfil aparece el botón «Crear orden»."
        offText={`Desactivada: en el perfil el botón aparece bloqueado con el aviso "Pronto podrás solicitar tu merch". Las órdenes que ya existen siguen igual.`}
        canEdit={canEdit}
        whoCanEdit="Solo un ADMIN, SUPERADMIN o TESORERO puede cambiarlo."
        confirmOn={{
          title: "¿Activar la creación de órdenes?",
          body: <p>Todos los servidores podrán crear órdenes de merch desde su perfil con los precios actuales.</p>,
        }}
        confirmOff={{
          title: "¿Desactivar la creación de órdenes?",
          body: (
            <p>
              Los servidores no podrán crear órdenes nuevas hasta que la vuelvas a activar. Las órdenes que ya existen no se
              tocan y se siguen administrando desde «Órdenes».
            </p>
          ),
        }}
      />

      <MerchSettingsForm settings={data.settings} canEdit={canEdit} onSaved={data.setSettings} />
    </div>
  );
};

export default MerchPrices;
