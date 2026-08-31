import { useState } from "react";
import { ExcelIcon } from "../../../assets/icons";

export type ExportColumn = { id: string; label: string };

type Props = {
  columns: ExportColumn[];
  defaultSelected: string[];
  rowCount: number;
  onCancel: () => void;
  onExport: (selectedIds: string[]) => void;
};

const ExportModal: React.FC<Props> = ({ columns, defaultSelected, rowCount, onCancel, onExport }) => {
  const [selected, setSelected] = useState<Set<string>>(new Set(defaultSelected));

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(columns.map((c) => c.id)));
  const selectNone = () => setSelected(new Set());

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modalCard">
        <div className="modalHead">
          <h3 className="modalHeadWithIcon">
            <ExcelIcon className="w-5 h-5" />
            Exportar a Excel
          </h3>
          <button type="button" className="modalClose" onClick={onCancel}>
            ✕
          </button>
        </div>
        <div className="modalBody" style={{ whiteSpace: "normal" }}>
          <p>
            Elige qué columnas incluir ({rowCount} registro{rowCount === 1 ? "" : "s"}):
          </p>

          <div className="exportSelectAll">
            <button type="button" className="linkBtn" onClick={selectAll}>
              Marcar todas
            </button>
            <button type="button" className="linkBtn" onClick={selectNone}>
              Desmarcar todas
            </button>
          </div>

          <div className="exportColumnList">
            {columns.map((col) => (
              <label key={col.id} className="exportColumnItem">
                <input
                  type="checkbox"
                  checked={selected.has(col.id)}
                  onChange={() => toggle(col.id)}
                />
                {col.label}
              </label>
            ))}
          </div>
        </div>
        <div className="modalActions">
          <button type="button" className="btnGhost" onClick={onCancel}>
            Cancelar
          </button>
          <button
            type="button"
            className="btnPrimary"
            disabled={selected.size === 0}
            onClick={() => onExport(columns.filter((c) => selected.has(c.id)).map((c) => c.id))}
          >
            Descargar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
