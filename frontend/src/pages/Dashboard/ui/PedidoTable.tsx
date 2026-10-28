import { useState } from "react";
import type { ServidorRecord } from "../../../api/adminUsers";
import type { AppSettings } from "../../../api/settings";
import type { ColumnDef } from "./columnDefs";
import {
  ArrowLeftIcon,
  GearIcon,
  TrashIcon,
  ExcelIcon,
  ColumnCollapseIcon,
  ColumnExpandIcon,
} from "../../../assets/icons";
import type { View } from "./ViewDropdown";
import EditableCell from "./EditableCell";
import PaymentCell from "./PaymentCell";
import PillsCell from "./PillsCell";
import SizeValue from "./SizeValue";
import PendingChangesModal from "./PendingChangesModal";
import type { PendingChange } from "./PendingChangesModal";
import PedidoStatsCards from "./PedidoStatsCards";
import MerchSettingsModal from "./MerchSettingsModal";
import ConfirmResetMerchModal from "./ConfirmResetMerchModal";
import PedidoExportModal from "./PedidoExportModal";
import { downloadXlsx } from "./exportXlsx";
import { formatCOP } from "./paymentConfig";
import {
  MERCH_CATALOG,
  MERCH_OPTIONS,
  SHIRT_COLORS,
  SIZE_OTHER_FIELD,
  asStringArray,
  computeOrderTotal,
  computeMerchCatalogCounts,
  saveShirtColors,
  saveMerchItems,
} from "./merchPricing";
import PedidoButton from "./PedidoButton";

type Props = {
  rows: ServidorRecord[];
  settings: AppSettings;
  canEditSettings: boolean;
  onViewChange: (view: View) => void;
  onEditField: (id: string, field: string, value: unknown) => Promise<void>;
  onResetMerch: (id: string) => Promise<void>;
  onSettingsSaved: (updated: AppSettings) => void;
};

type PendingEdit = {
  rowId: string;
  field: string;
  rowLabel: string;
  fieldLabel: string;
  oldValue: string;
  newValue: string;
};

type EditableFieldId = "firstNames" | "lastNames" | "phone" | "shirtSize" | "merchSize";

const PEDIDO_COLUMNS: ColumnDef[] = [
  { id: "firstNames", label: "Nombres", type: "text", editable: true },
  { id: "lastNames", label: "Apellidos", type: "text", editable: true },
  { id: "phone", label: "Teléfono", type: "text", editable: true },
  { id: "shirtSize", label: "Talla", type: "select", options: ["S", "M", "L", "OTRO"], editable: true },
  { id: "merchSize", label: "Talla merch", type: "select", options: ["S", "M", "L", "OTRO"], editable: true },
];

const findColumn = (id: EditableFieldId) => PEDIDO_COLUMNS.find((c) => c.id === id)!;

const renderFieldValue = (id: EditableFieldId, row: ServidorRecord): string => {
  const value = row[id];
  return value != null ? String(value) : "";
};

const requestedMerch = (row: ServidorRecord) =>
  row.needsShirt === "SI" || asStringArray(row.merchItems).some((item) => item !== "NINGUNA");

const PedidoTable: React.FC<Props> = ({
  rows,
  settings,
  canEditSettings,
  onViewChange,
  onEditField,
  onResetMerch,
  onSettingsSaved,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showPaymentCols, setShowPaymentCols] = useState(false);
  const [resetTarget, setResetTarget] = useState<{ id: string; name: string } | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [pendingEdits, setPendingEdits] = useState<Record<string, PendingEdit>>({});
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);

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

  const handleCommitEdit = (row: ServidorRecord, col: ColumnDef, newValue: string) => {
    const key = `${row._id}::${col.id}`;
    const oldValue = renderFieldValue(col.id as EditableFieldId, row);

    setPendingEdits((prev) => {
      if (newValue === oldValue) {
        const rest = { ...prev };
        delete rest[key];
        return rest;
      }
      return {
        ...prev,
        [key]: {
          rowId: row._id,
          field: col.id,
          rowLabel: `${row.firstNames} ${row.lastNames}`,
          fieldLabel: col.label,
          oldValue,
          newValue,
        },
      };
    });
  };

  const pendingList = Object.values(pendingEdits);
  const cancelAllPending = () => setPendingEdits({});

  const confirmSaveAll = async () => {
    setIsSavingAll(true);
    try {
      for (const edit of pendingList) {
        await onEditField(edit.rowId, edit.field, edit.newValue);
      }
      setPendingEdits({});
      setShowConfirmSave(false);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Error al guardar los cambios");
    } finally {
      setIsSavingAll(false);
    }
  };

  const changesForModal: PendingChange[] = pendingList.map((e) => ({
    key: `${e.rowId}::${e.field}`,
    rowLabel: e.rowLabel,
    fieldLabel: e.fieldLabel,
    oldDisplay: e.oldValue,
    newDisplay: e.newValue,
  }));

  return (
    <>
      {/* Barra de acciones del pedido, arriba de las cards. */}
      <div className="tableSectionHead pedidoToolbar">
        <div className="tableSectionHeadLeft">
          <button
            type="button"
            className="btnGhost exportBtn"
            title="Volver a servidores"
            onClick={() => onViewChange("servidores")}
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="exportBtnLabel">Volver</span>
          </button>
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
          <PedidoButton active onClick={() => onViewChange("servidores")} />
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

      <PedidoStatsCards rows={rows} settings={settings} />

      <div className="tableSection">
        <div className="tableScroll">
          <table className="dataTable">
            <thead>
              <tr>
                <th className={`paymentColCell${showPaymentCols ? "" : " collapsed"}`}>
                  <div className={`colCollapseInner colCollapseInnerSmall${showPaymentCols ? "" : " collapsed"}`} />
                </th>
                <th className={`paymentColCell${showPaymentCols ? "" : " collapsed"}`}>
                  <div className={`colCollapseInner${showPaymentCols ? "" : " collapsed"}`}>Pago</div>
                </th>
                <th className={`paymentColCell${showPaymentCols ? "" : " collapsed"}`}>
                  <div className={`colCollapseInner${showPaymentCols ? "" : " collapsed"}`}>Restante</div>
                </th>
                <th className="colDivider">
                  <button
                    type="button"
                    className="colDividerToggle"
                    onClick={() => setShowPaymentCols((s) => !s)}
                    title={showPaymentCols ? "Ocultar columnas de pago" : "Mostrar columnas de pago"}
                  >
                    {showPaymentCols ? (
                      <ColumnCollapseIcon className="w-4 h-4" />
                    ) : (
                      <ColumnExpandIcon className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th>Teléfono</th>
                <th>Camiseta</th>
                <th>Talla</th>
                <th>Merch solicitado</th>
                <th>Talla merch</th>
              </tr>
            </thead>
            <tbody>
              {pedidoRows.length === 0 ? (
                <tr>
                  <td className="emptyState" colSpan={11}>
                    Nadie ha solicitado merch todavía.
                  </td>
                </tr>
              ) : (
                pedidoRows.map((r) => {
                  const orderTotal = computeOrderTotal(r, settings);
                  const paid = r.merchPaymentAmount ?? 0;

                  const editCell = (id: EditableFieldId) => {
                    const col = findColumn(id);
                    const key = `${r._id}::${id}`;
                    const pending = pendingEdits[key];
                    const otherField = SIZE_OTHER_FIELD[id];
                    return (
                      <EditableCell
                        key={id}
                        column={col}
                        value={pending ? pending.newValue : renderFieldValue(id, r)}
                        isDirty={Boolean(pending)}
                        canEdit
                        onCommit={(value) => handleCommitEdit(r, col, value)}
                        renderValue={
                          otherField
                            ? (value) => (
                                <SizeValue
                                  value={value}
                                  otherAnswer={String(r[otherField] ?? "")}
                                  documentNumber={String(r.documentNumber ?? "")}
                                  otherField={otherField}
                                />
                              )
                            : undefined
                        }
                      />
                    );
                  };

                  return (
                    <tr key={r._id}>
                      <td className={`paymentColCell${showPaymentCols ? "" : " collapsed"}`}>
                        <div
                          className={`colCollapseInner colCollapseInnerSmall${showPaymentCols ? "" : " collapsed"}`}
                        >
                          <button
                            type="button"
                            className="rowDeleteBtn"
                            title="Borrar pedido de merch"
                            onClick={() => setResetTarget({ id: r._id, name: `${r.firstNames} ${r.lastNames}` })}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className={`paymentColCell${showPaymentCols ? "" : " collapsed"}`}>
                        <div className={`colCollapseInner${showPaymentCols ? "" : " collapsed"}`}>
                          <PaymentCell
                            amount={paid}
                            max={orderTotal}
                            onChange={(amount) => onEditField(r._id, "merchPaymentAmount", String(amount))}
                          />
                        </div>
                      </td>
                      <td className={`paymentColCell${showPaymentCols ? "" : " collapsed"}`}>
                        <div className={`colCollapseInner${showPaymentCols ? "" : " collapsed"}`}>
                          {formatCOP(Math.max(0, orderTotal - paid))}
                        </div>
                      </td>
                      <td className="colDivider"></td>
                      {editCell("firstNames")}
                      {editCell("lastNames")}
                      {editCell("phone")}
                      <PillsCell
                        value={asStringArray(r.shirtColors)}
                        options={SHIRT_COLORS}
                        onChange={(next) => saveShirtColors(r, next, onEditField)}
                      />
                      {editCell("shirtSize")}
                      <PillsCell
                        value={asStringArray(r.merchItems).filter((item) => item !== "NINGUNA")}
                        options={MERCH_OPTIONS}
                        onChange={(next) => saveMerchItems(r, next, onEditField)}
                      />
                      {editCell("merchSize")}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pendingList.length > 0 && (
        <div className="pendingBar">
          <span>{pendingList.length} cambio(s) sin guardar</span>
          <div className="pendingBarActions">
            <button type="button" className="btnGhost" onClick={cancelAllPending}>
              Cancelar
            </button>
            <button type="button" className="btnPrimary" onClick={() => setShowConfirmSave(true)}>
              Guardar cambios
            </button>
          </div>
        </div>
      )}

      {showSettings && (
        <MerchSettingsModal
          settings={settings}
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

      {showConfirmSave && (
        <PendingChangesModal
          changes={changesForModal}
          isSaving={isSavingAll}
          onCancel={() => setShowConfirmSave(false)}
          onConfirm={confirmSaveAll}
        />
      )}
    </>
  );
};

export default PedidoTable;
