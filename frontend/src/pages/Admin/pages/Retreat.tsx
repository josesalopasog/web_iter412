import { useAuth } from "../../../auth/AuthContext";
import { PageLoader } from "../../../components/Spinner";
import RetreatSettingsForm from "../../Dashboard/ui/RetreatSettingsForm";
import { useAdminData } from "../AdminData";
import { PageHeading } from "../ui/PageParts";

// Ajustes del retiro (antes un pop up): número, fechas, precios y plazos de pago.
const Retreat = () => {
  const { user } = useAuth();
  const data = useAdminData();
  const canEdit = user?.role === "SUPERADMIN" || user?.role === "TREASURER";

  if (data.isLoading) return <PageLoader variant="inline" label="Cargando datos" />;

  return (
    <div className="adPage">
      <PageHeading
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Gestión" }, { label: "Ajustes del retiro" }]}
        title="Ajustes del retiro"
        subtitle={
          canEdit
            ? "Cambia los valores y guarda: se reflejan en la página principal y en las tablas."
            : "Solo un SUPERADMIN o TESORERO puede editar estos valores."
        }
      />
      <div data-tour="settings">
        <RetreatSettingsForm settings={data.settings} canEdit={canEdit} totalSubsidyUsed={data.totalSubsidyUsed} onSaved={data.setSettings} />
      </div>
    </div>
  );
};

export default Retreat;
