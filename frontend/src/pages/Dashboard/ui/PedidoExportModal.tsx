import { ExcelIcon } from "../../../assets/icons";

export type PedidoExportRow = { label: string; count: number };

type Props = {
  items: PedidoExportRow[];
  onCancel: () => void;
  onExport: () => void;
};

const PedidoExportModal: React.FC<Props> = ({ items, onCancel, onExport }) => {
  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modalCard">
        <div className="modalHead">
          <h3 className="modalHeadWithIcon">
            <ExcelIcon className="w-5 h-5" />
            Exportar resumen de pedido
          </h3>
          <button type="button" className="modalClose" onClick={onCancel}>
            ✕
          </button>
        </div>
        <div className="modalBody" style={{ whiteSpace: "normal" }}>
          <p>Así se va a ver el resumen descargado:</p>

          <div className="exportPreviewScroll">
            <table className="dataTable exportPreviewTable">
              <thead>
                <tr>
                  <th>Ítem</th>
                  <th>Descripción</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.label}>
                    <td>{i + 1}</td>
                    <td>{item.label}</td>
                    <td>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="modalActions">
          <button type="button" className="btnGhost" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="btnPrimary" onClick={onExport}>
            Descargar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PedidoExportModal;
