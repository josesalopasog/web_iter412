import { useState } from "react";
import type { EliminadoRecord } from "../../../api/adminUsers";
import { PageLoader } from "../../../components/Spinner";
import { useAdminData } from "../AdminData";
import { ChartCard } from "../ui/Charts";
import { COLORS } from "../ui/colors";
import DataTable, { type DataColumn } from "../ui/DataTable";
import { PageHeading } from "../ui/PageParts";
import { formatDateTime, formatRegNum } from "../format";

const nameOf = (r: EliminadoRecord) => `${String(r.data.firstNames ?? "")} ${String(r.data.lastNames ?? "")}`.trim();

const columns: DataColumn<EliminadoRecord>[] = [
  {
    key: "type",
    label: "Tipo",
    render: (r) => <span className={`typeTag ${r.originalCollection}`}>{r.originalCollection === "soldados" ? "Soldado" : "Servidor"}</span>,
    value: (r) => (r.originalCollection === "soldados" ? "Soldado" : "Servidor"),
  },
  { key: "name", label: "Nombre", className: "cellStrong", render: nameOf, value: nameOf },
  { key: "doc", label: "Documento", className: "cellMuted", render: (r) => String(r.data.documentNumber ?? "-"), value: (r) => String(r.data.documentNumber ?? "") },
  { key: "num", label: "# original", render: (r) => formatRegNum(r.registrationNumber), value: (r) => formatRegNum(r.registrationNumber) },
  {
    key: "by",
    label: "Eliminado por",
    render: (r) => `${r.deletedBy.firstNames} ${r.deletedBy.lastNames}`,
    value: (r) => `${r.deletedBy.firstNames} ${r.deletedBy.lastNames}`,
  },
  { key: "date", label: "Fecha", className: "cellMuted", render: (r) => formatDateTime(r.deletedAt), value: (r) => formatDateTime(r.deletedAt) },
];

// Eliminados (antes una vista dentro de la tabla): se pueden restaurar con su número original.
const Deleted = () => {
  const data = useAdminData();
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const handleRestore = async (id: string) => {
    setRestoringId(id);
    try {
      await data.restore(id);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Error al restaurar");
    } finally {
      setRestoringId(null);
    }
  };

  if (data.isLoading) return <PageLoader variant="inline" label="Cargando datos" />;

  return (
    <div className="adPage">
      <PageHeading
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Gestión" }, { label: "Eliminados" }]}
        title="Eliminados"
        subtitle="Soldados y servidores eliminados del dashboard. Al restaurarlos vuelven a su lista."
      />
      <ChartCard title="Registros eliminados" subtitle={`${data.eliminados.length} en total`}>
        <DataTable
          id="eliminados"
          rows={data.eliminados}
          columns={columns}
          getRowId={(r) => r._id}
          tabs={[
            { value: "todos", label: "Todos" },
            { value: "soldados", label: "Soldados", match: (r) => r.originalCollection === "soldados", dot: COLORS.soldados },
            { value: "servidores", label: "Servidores", match: (r) => r.originalCollection === "servidores", dot: COLORS.servidores },
          ]}
          searchPlaceholder="Buscar por nombre o documento"
          emptyText="No hay registros eliminados."
          actions={(r) => (
            <button type="button" className="toolbarButton" disabled={restoringId === r._id} onClick={() => handleRestore(r._id)}>
              {restoringId === r._id ? "Restaurando..." : "Restaurar"}
            </button>
          )}
        />
      </ChartCard>
    </div>
  );
};

export default Deleted;
