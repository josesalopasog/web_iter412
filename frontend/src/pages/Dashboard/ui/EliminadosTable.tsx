import { useState } from "react";
import type { EliminadoRecord } from "../../../api/adminUsers";
import ViewDropdown from "./ViewDropdown";
import type { View } from "./ViewDropdown";

type Props = {
  rows: EliminadoRecord[];
  onViewChange: (view: View) => void;
  onRestore: (id: string) => Promise<void>;
};

const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
};

const EliminadosTable: React.FC<Props> = ({ rows, onViewChange, onRestore }) => {
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const handleRestore = async (id: string) => {
    setRestoringId(id);
    try {
      await onRestore(id);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Error al restaurar");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="tableSection">
      <div className="tableSectionHead">
        <div className="tableSectionHeadLeft">
          <ViewDropdown view="eliminados" showEliminados onChange={onViewChange} />
          <span className="tableCount">{rows.length} registros</span>
        </div>
      </div>

      <div className="tableScroll">
        {rows.length === 0 ? (
          <p className="emptyState">No hay registros eliminados.</p>
        ) : (
          <table className="dataTable">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Nombre</th>
                <th># original</th>
                <th>Eliminado por</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id}>
                  <td>{r.originalCollection === "soldados" ? "Soldado" : "Servidor"}</td>
                  <td>
                    {String(r.data.firstNames ?? "")} {String(r.data.lastNames ?? "")}
                  </td>
                  <td>{String(r.registrationNumber).padStart(3, "0")}</td>
                  <td>
                    {r.deletedBy.firstNames} {r.deletedBy.lastNames}
                  </td>
                  <td>{formatDate(r.deletedAt)}</td>
                  <td>
                    <button
                      type="button"
                      className="btnGhost"
                      disabled={restoringId === r._id}
                      onClick={() => handleRestore(r._id)}
                    >
                      {restoringId === r._id ? "Restaurando..." : "Restaurar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EliminadosTable;
