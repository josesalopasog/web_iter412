import { useState } from "react";
import type { ServidorRecord } from "../../../api/adminUsers";
import type { AppSettings } from "../../../api/settings";
import { GearIcon, TrashIcon, ExcelIcon } from "../../../assets/icons";
import ViewDropdown from "./ViewDropdown";
import type { View } from "./ViewDropdown";
import PaymentCell from "./PaymentCell";
import PedidoStatsCards from "./PedidoStatsCards";
import MerchSettingsModal from "./MerchSettingsModal";
import ConfirmResetMerchModal from "./ConfirmResetMerchModal";
import PedidoExportModal from "./PedidoExportModal";
import { downloadXlsx } from "./exportXlsx";
import { formatCOP } from "./paymentConfig";
import { MERCH_LABELS, MERCH_CATALOG, asStringArray, computeOrderTotal, computeMerchCatalogCounts } from "./merchPricing";

type Props = {
  rows: ServidorRecord[];
  showEliminados: boolean;
  settings: AppSettings;
  token: string;
  canEditSettings: boolean;
  onViewChange: (view: View) => void;
  onEditField: (id: string, field: string, value: string) => Promise<void>;
  onResetMerch: (id: string) => Promise<void>;
  onSettingsSaved: (updated: AppSettings) => void;
};

const formatSize = (
  row: ServidorRecord,
  sizeField: "shirtSize" | "merchSize",
  otherField: "shirtSizeOther" | "merchSizeOther"
) => {
  const size = row[sizeField];
  if (size === "OTRO") {
    const other = row[otherField];
    return typeof other === "string" && other ? other : "Otro";
  }
  return typeof size === "string" && size ? size : "-";
};

const formatCamiseta = (row: ServidorRecord) => {
  if (row.needsShirt !== "SI") return "-";
  return asStringArray(row.shirtColors).join(", ") || "-";
};

const formatMerchItems = (items: unknown) => {
  const labels = asStringArray(items)
    .filter((item) => item !== "NINGUNA")
    .map((item) => MERCH_LABELS[item] ?? item);
  return labels.length > 0 ? labels.join(", ") : "-";
};

const requestedMerch = (row: ServidorRecord) =>
  row.needsShirt === "SI" || asStringArray(row.merchItems).some((item) => item !== "NINGUNA");

const PedidoTable: React.FC<Props> = ({
  rows,
  showEliminados,
  settings,
  token,
  canEditSettings,
  onViewChange,
  onEditField,
  onResetMerch,
  onSettingsSaved,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [resetTarget, setResetTarget] = useState<{ id: string; name: string } | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const pedidoRows = rows.filter(requestedMerch);

  const confirmReset = async () => {
    if (!resetTarget) return;
    setIsResetting(true);
    try {
      await onResetMerch(resetTarget.id);
      setResetTarget(null);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Error al borrar el pedido");
    } finally {
      setIsResetting(false);
    }
  };

  const catalogCounts = computeMerchCatalogCounts(rows);
  const exportItems = MERCH_CATALOG.map((label, i) => ({ label, count: catalogCounts[i] ?? 0 }));

  const handleExport = () => {
    const rowsForSheet = exportItems.map((item, i) => [String(i + 1), item.label, String(item.count)]);
    downloadXlsx("resumen-pedido.xlsx", "Pedido", ["Ítem", "Descripción", "Cantidad"], rowsForSheet);
    setShowExport(false);
  };

  return (
    <>
      <PedidoStatsCards rows={rows} settings={settings} />

      <div className="tableSection">
        <div className="tableSectionHead">
          <div className="tableSectionHeadLeft">
            <ViewDropdown view="pedido" showEliminados={showEliminados} onChange={onViewChange} />
            <span className="tableCount">{pedidoRows.length} registros</span>
            <button
              type="button"
              className="btnGhost settingsBtn"
              title="Precios de merch"
              onClick={() => setShowSettings(true)}
            >
              <GearIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="tableSectionHeadRight">
            <button
              type="button"
              className="btnGhost exportBtn"
              title="Exportar resumen a Excel"
              onClick={() => setShowExport(true)}
            >
              <ExcelIcon className="w-4 h-4" />
              <span className="exportBtnLabel">Exportar</span>
            </button>
          </div>
        </div>

        <div className="tableScroll">
          {pedidoRows.length === 0 ? (
            <p className="emptyState">Nadie ha solicitado merch todavía.</p>
          ) : (
            <table className="dataTable">
              <thead>
                <tr>
                  <th>Nombres</th>
                  <th>Apellidos</th>
                  <th>Teléfono</th>
                  <th>Camiseta</th>
                  <th>Talla</th>
                  <th>Merch solicitado</th>
                  <th>Talla merch</th>
                  <th>Pago</th>
                  <th>Restante</th>
                  <th>Borrar</th>
                </tr>
              </thead>
              <tbody>
                {pedidoRows.map((r) => {
                  const orderTotal = computeOrderTotal(r, settings);
                  const paid = r.merchPaymentAmount ?? 0;
                  return (
                  <tr key={r._id}>
                    <td>{r.firstNames}</td>
                    <td>{r.lastNames}</td>
                    <td>{r.phone}</td>
                    <td>{formatCamiseta(r)}</td>
                    <td>{formatSize(r, "shirtSize", "shirtSizeOther")}</td>
                    <td>{formatMerchItems(r.merchItems)}</td>
                    <td>{formatSize(r, "merchSize", "merchSizeOther")}</td>
                    <td>
                      <PaymentCell
                        amount={paid}
                        max={orderTotal}
                        onChange={(amount) => onEditField(r._id, "merchPaymentAmount", String(amount))}
                      />
                    </td>
                    <td>{formatCOP(Math.max(0, orderTotal - paid))}</td>
                    <td>
                      <button
                        type="button"
                        className="rowDeleteBtn"
                        title="Borrar pedido de merch"
                        onClick={() => setResetTarget({ id: r._id, name: `${r.firstNames} ${r.lastNames}` })}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showSettings && (
        <MerchSettingsModal
          settings={settings}
          token={token}
          canEdit={canEditSettings}
          onSaved={onSettingsSaved}
          onClose={() => setShowSettings(false)}
        />
      )}

      {resetTarget && (
        <ConfirmResetMerchModal
          name={resetTarget.name}
          isResetting={isResetting}
          onCancel={() => setResetTarget(null)}
          onConfirm={confirmReset}
        />
      )}

      {showExport && (
        <PedidoExportModal
          items={exportItems}
          onCancel={() => setShowExport(false)}
          onExport={handleExport}
        />
      )}
    </>
  );
};

export default PedidoTable;
