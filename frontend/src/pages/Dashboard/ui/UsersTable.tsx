import { useEffect, useMemo, useState } from "react";
import type { SoldadoRecord, ServidorRecord } from "../../../api/adminUsers";
import type { View } from "./ViewDropdown";
import ViewDropdown from "./ViewDropdown";
import EditableCell from "./EditableCell";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import PendingChangesModal from "./PendingChangesModal";
import type { PendingChange } from "./PendingChangesModal";
import RoleDropdown from "./RoleDropdown";
import ColumnPicker from "./ColumnPicker";
import type { ColumnOrderItem } from "./ColumnPicker";
import ExportModal from "./ExportModal";
import type { ExportColumn } from "./ExportModal";
import { downloadXlsx } from "./exportXlsx";
import SortableHeader from "./SortableHeader";
import type { SortDirection } from "./SortableHeader";
import FilterableHeader from "./FilterableHeader";
import PaymentCell from "./PaymentCell";
import PillsCell from "./PillsCell";
import DropupCell from "./DropupCell";
import { formatEnumLabel } from "../../Profile/ui/format";
import { asStringArray } from "./merchPricing";
import SubsidyCell from "./SubsidyCell";
import { formatCOP } from "./paymentConfig";
import {
  ExcelIcon,
  SearchIcon,
  TrashIcon,
  ColumnCollapseIcon,
  ColumnExpandIcon,
  GearIcon,
  DocumentIcon,
} from "../../../assets/icons";
import {
  SOLDADO_COLUMNS,
  SOLDADO_DEFAULT_VISIBLE,
  SERVIDOR_COLUMNS,
  SERVIDOR_DEFAULT_VISIBLE,
} from "./columnDefs";

type Props =
  | {
      view: "soldados";
      rows: SoldadoRecord[];
      currentUserRole: string;
      showEliminados: boolean;
      price: number;
      subsidyMax: number;
      totalSubsidyUsed: number;
      onViewChange: (view: View) => void;
      onEditField: (id: string, field: string, value: string) => Promise<void>;
      onDelete: (id: string) => Promise<void>;
      onOpenSettings: () => void;
    }
  | {
      view: "servidores";
      rows: ServidorRecord[];
      currentUserRole: string;
      showEliminados: boolean;
      price: number;
      subsidyMax: number;
      totalSubsidyUsed: number;
      onViewChange: (view: View) => void;
      onEditField: (id: string, field: string, value: unknown) => Promise<void>;
      onDelete: (id: string) => Promise<void>;
      onRoleChange: (id: string, role: string) => Promise<void>;
      onOpenSettings: () => void;
    };

type PendingEdit = {
  rowId: string;
  field: string;
  rowLabel: string;
  fieldLabel: string;
  oldValue: string;
  newValue: string;
};

const normalizeGender = (gender?: string): "Mujer" | "Hombre" | "Otro" | "" => {
  if (gender === "Mujer" || gender === "Femenino") return "Mujer";
  if (gender === "Hombre" || gender === "Masculino") return "Hombre";
  if (gender === "Otro") return "Otro";
  return "";
};

const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
};

const formatRegNum = (n: number | null | undefined) =>
  n == null || Number.isNaN(n) ? "s/n" : String(n).padStart(3, "0");

const loadColumnOrder = (
  storageKey: string,
  columns: typeof SOLDADO_COLUMNS,
  defaultVisible: string[]
): ColumnOrderItem[] => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const saved = JSON.parse(raw) as ColumnOrderItem[];
      const savedIds = new Set(saved.map((s) => s.id));
      const missing = columns.filter((c) => !savedIds.has(c.id)).map((c) => ({ id: c.id, visible: false }));
      return [...saved.filter((s) => columns.some((c) => c.id === s.id)), ...missing];
    }
  } catch {
    // ignore malformed storage
  }
  return columns.map((c) => ({ id: c.id, visible: defaultVisible.includes(c.id) }));
};

const UsersTable: React.FC<Props> = (props) => {
  const [showSearchRow, setShowSearchRow] = useState(false);
  const [columnSearch, setColumnSearch] = useState<Record<string, string>>({});
  const [showPaymentCols, setShowPaymentCols] = useState(false);

  const columns = props.view === "soldados" ? SOLDADO_COLUMNS : SERVIDOR_COLUMNS;
  const defaultVisible = props.view === "soldados" ? SOLDADO_DEFAULT_VISIBLE : SERVIDOR_DEFAULT_VISIBLE;
  const registrationNumberColumn: (typeof columns)[number] = {
    id: "registrationNumber",
    label: "N° Registro",
    type: "text",
    editable: true,
  };
  const storageKey = `dashboard_cols_${props.view}`;

  const visibleColumns = columns.filter(
    (c) => !c.hiddenUnless || c.hiddenUnless === props.currentUserRole
  );

  const [columnOrder, setColumnOrder] = useState<ColumnOrderItem[]>(() =>
    loadColumnOrder(storageKey, visibleColumns, defaultVisible)
  );

  const [pendingEdits, setPendingEdits] = useState<Record<string, PendingEdit>>({});
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: SortDirection } | null>(null);

  useEffect(() => {
    setColumnOrder(loadColumnOrder(storageKey, visibleColumns, defaultVisible));
    setPendingEdits({});
    setSortConfig(null);
    setColumnFilters({});
    setColumnSearch({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.view, props.currentUserRole]);

  const handleColumnOrderChange = (next: ColumnOrderItem[]) => {
    setColumnOrder(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const activeColumns = columnOrder
    .filter((o) => o.visible)
    .map((o) => visibleColumns.find((c) => c.id === o.id))
    .filter((c): c is (typeof columns)[number] => Boolean(c));

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    registrationNumber: number | undefined;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [columnFilters, setColumnFilters] = useState<Record<string, Set<string>>>({});

  const renderCellValue = (col: (typeof columns)[number], row: SoldadoRecord | ServidorRecord) => {
    if (col.id === "createdAt") return formatDate(String(row.createdAt ?? ""));
    if (col.id === "gender") return normalizeGender(row.gender as string | undefined) || "";
    if (col.id === "registrationNumber") return formatRegNum(row.registrationNumber);
    const value = row[col.id];
    if (Array.isArray(value)) return value.map((v) => formatEnumLabel(String(v))).join(", ");
    return value != null ? String(value) : "";
  };

  const getFilterSelected = (col: (typeof columns)[number]) =>
    columnFilters[col.id] ?? new Set(col.options ?? []);

  const setColumnFilter = (colId: string, selected: Set<string>) => {
    setColumnFilters((prev) => ({ ...prev, [colId]: selected }));
  };

  const setColumnSearchValue = (colId: string, value: string) => {
    setColumnSearch((prev) => ({ ...prev, [colId]: value }));
  };

  const exportColumns: ExportColumn[] = [
    { id: "registrationNumber", label: "N° Registro" },
    ...(props.view === "servidores" ? [{ id: "role", label: "Rol" }] : []),
    ...visibleColumns.filter((c) => c.id !== "password").map((c) => ({ id: c.id, label: c.label })),
    { id: "paymentAmount", label: "Pagado" },
    { id: "subsidyAmount", label: "Subsidiado" },
  ];

  const exportDefaultSelected = [
    "registrationNumber",
    ...(props.view === "servidores" ? ["role"] : []),
    ...activeColumns.map((c) => c.id),
  ];

  const filteredRows = useMemo(() => {
    let rows: (SoldadoRecord | ServidorRecord)[] = props.rows;

    const regNumQuery = columnSearch.registrationNumber?.trim().toLowerCase();
    if (regNumQuery) {
      rows = rows.filter((r) => formatRegNum(r.registrationNumber).toLowerCase().includes(regNumQuery));
    }

    const roleQuery = props.view === "servidores" ? columnSearch.role?.trim().toLowerCase() : "";
    if (roleQuery) {
      rows = rows.filter((r) => String((r as ServidorRecord).role ?? "").toLowerCase().includes(roleQuery));
    }

    for (const col of visibleColumns) {
      const query = columnSearch[col.id]?.trim().toLowerCase();
      if (query) {
        rows = rows.filter((r) => renderCellValue(col, r).toLowerCase().includes(query));
      }
      if (!col.filterable || !col.options) continue;
      const selected = columnFilters[col.id];
      if (!selected || selected.size === col.options.length) continue;
      rows = rows.filter((r) => selected.has(renderCellValue(col, r)));
    }
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.rows, columnSearch, columnFilters, visibleColumns]);

  const getSortValue = (key: string, row: SoldadoRecord | ServidorRecord): string | number => {
    if (key === "registrationNumber") return row.registrationNumber;
    if (key === "role") return String((row as ServidorRecord).role ?? "");
    if (key === "gender") return normalizeGender(row.gender as string | undefined) || "";
    const value = row[key];
    if (Array.isArray(value)) return value.join(", ");
    return value != null ? String(value) : "";
  };

  const sortedRows = useMemo(() => {
    if (!sortConfig) return filteredRows;
    const { key, direction } = sortConfig;
    const isNumeric =
      key === "registrationNumber" ||
      [...SOLDADO_COLUMNS, ...SERVIDOR_COLUMNS].find((c) => c.id === key)?.sortType === "numeric";

    const sorted = [...filteredRows].sort((a, b) => {
      const va = getSortValue(key, a);
      const vb = getSortValue(key, b);
      const cmp = isNumeric
        ? Number(va || 0) - Number(vb || 0)
        : String(va).localeCompare(String(vb), "es", { sensitivity: "base" });
      return direction === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [filteredRows, sortConfig]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await props.onDelete(deleteTarget.id);
      setDeleteTarget(null);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Error al eliminar");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangePayment = async (id: string, amount: number) => {
    await props.onEditField(id, "paymentAmount", String(amount));
  };

  const handleChangeSubsidy = async (row: SoldadoRecord | ServidorRecord, amount: number) => {
    await props.onEditField(row._id, "subsidyAmount", String(amount));

    const effectiveMax = Math.max(0, props.price - amount);
    const currentPayment = typeof row.paymentAmount === "number" ? row.paymentAmount : 0;
    if (currentPayment > effectiveMax) {
      await props.onEditField(row._id, "paymentAmount", String(effectiveMax));
    }
  };

  const editServidorField = props.view === "servidores" ? props.onEditField : null;

  const handleOpenAnswers = (row: SoldadoRecord | ServidorRecord) => {
    const documento = String(row.documentNumber ?? "").trim();
    if (!documento) {
      alert("Este registro no tiene número de documento");
      return;
    }
    window.open(`/participante/${props.view}/${encodeURIComponent(documento)}`, "_blank", "noopener");
  };

  const handleRequestDelete = (row: SoldadoRecord | ServidorRecord) => {
    setDeleteTarget({
      id: row._id,
      registrationNumber: row.registrationNumber,
      name: `${row.firstNames} ${row.lastNames}`,
    });
  };

  const exportValueFor = (colId: string, row: SoldadoRecord | ServidorRecord) => {
    if (colId === "registrationNumber") return formatRegNum(row.registrationNumber);
    if (colId === "role") return String((row as ServidorRecord).role ?? "");
    if (colId === "paymentAmount") return formatCOP(typeof row.paymentAmount === "number" ? row.paymentAmount : 0);
    if (colId === "subsidyAmount") return formatCOP(typeof row.subsidyAmount === "number" ? row.subsidyAmount : 0);
    const col = columns.find((c) => c.id === colId);
    return col ? renderCellValue(col, row) : "";
  };

  const handleExport = (selectedIds: string[]) => {
    const selectedCols = exportColumns.filter((c) => selectedIds.includes(c.id));
    const headers = selectedCols.map((c) => c.label);
    const rows = sortedRows.map((r) => selectedCols.map((c) => exportValueFor(c.id, r)));
    const sheetName = props.view === "soldados" ? "Soldados" : "Servidores";
    downloadXlsx(`${props.view}.xlsx`, sheetName, headers, rows);
    setShowExport(false);
  };

  const handleCommitEdit = (
    row: SoldadoRecord | ServidorRecord,
    col: (typeof columns)[number],
    newValue: string
  ) => {
    const key = `${row._id}::${col.id}`;
    const oldValue = renderCellValue(col, row);

    setPendingEdits((prev) => {
      if (col.id !== "password" && newValue === oldValue) {
        const { [key]: _removed, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [key]: {
          rowId: row._id,
          field: col.id,
          rowLabel: `#${formatRegNum(row.registrationNumber)} ${row.firstNames} ${row.lastNames}`,
          fieldLabel: col.label,
          oldValue: col.id === "password" ? "" : oldValue,
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
        await props.onEditField(edit.rowId, edit.field, edit.newValue);
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
    oldDisplay: e.field === "password" ? "(sin cambios)" : e.oldValue,
    newDisplay: e.field === "password" ? "(nueva contraseña)" : e.newValue,
  }));

  return (
    <div className="tableSection">
      <div className="tableSectionHead">
        <div className="tableSectionHeadLeft">
          <ViewDropdown view={props.view} showEliminados={props.showEliminados} onChange={props.onViewChange} />
          <ColumnPicker columns={visibleColumns} order={columnOrder} onChange={handleColumnOrderChange} />
          <button
            type="button"
            className="btnGhost settingsBtn"
            title="Ajustes del retiro"
            onClick={props.onOpenSettings}
          >
            <GearIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="tableSectionHeadRight">
          <button
            type="button"
            className="btnGhost exportBtn"
            title="Exportar a Excel"
            onClick={() => setShowExport(true)}
          >
            <ExcelIcon className="w-4 h-4" />
            <span className="exportBtnLabel">Exportar</span>
          </button>
          <button
            type="button"
            className={`btnGhost searchRowToggleBtn ${showSearchRow ? "active" : ""}`}
            title={showSearchRow ? "Ocultar fila de búsqueda" : "Buscar por columna"}
            onClick={() => setShowSearchRow((s) => !s)}
          >
            <SearchIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="tableScroll">
        <table className="dataTable">
          <thead>
              <tr>
                <th className={`paymentColCell${showPaymentCols ? "" : " collapsed"}`}>
                  <div className={`colCollapseInner colCollapseInnerSmall${showPaymentCols ? "" : " collapsed"}`} />
                </th>
                <th className={`paymentColCell${showPaymentCols ? "" : " collapsed"}`}>
                  <div className={`colCollapseInner colCollapseInnerSmall${showPaymentCols ? "" : " collapsed"}`} />
                </th>
                <th className={`paymentColCell${showPaymentCols ? "" : " collapsed"}`}>
                  <div className={`colCollapseInner${showPaymentCols ? "" : " collapsed"}`}>Pagado</div>
                </th>
                <th className={`paymentColCell${showPaymentCols ? "" : " collapsed"}`}>
                  <div className={`colCollapseInner${showPaymentCols ? "" : " collapsed"}`}>Subsidiado</div>
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
                <SortableHeader
                  label="#"
                  sortType="numeric"
                  active={sortConfig?.key === "registrationNumber" ? sortConfig.direction : null}
                  onSort={(direction) =>
                    setSortConfig(direction ? { key: "registrationNumber", direction } : null)
                  }
                />
                {props.view === "servidores" && (
                  <SortableHeader
                    label="Rol"
                    sortType="text"
                    active={sortConfig?.key === "role" ? sortConfig.direction : null}
                    onSort={(direction) => setSortConfig(direction ? { key: "role", direction } : null)}
                  />
                )}
                {activeColumns.map((col) => {
                  if (col.filterable && col.options) {
                    return (
                      <FilterableHeader
                        key={col.id}
                        label={col.label}
                        options={col.options}
                        selected={getFilterSelected(col)}
                        onChange={(selected) => setColumnFilter(col.id, selected)}
                      />
                    );
                  }
                  if (col.sortable === false) {
                    return <th key={col.id}>{col.label}</th>;
                  }
                  return (
                    <SortableHeader
                      key={col.id}
                      label={col.label}
                      sortType={col.sortType}
                      active={sortConfig?.key === col.id ? sortConfig.direction : null}
                      onSort={(direction) => setSortConfig(direction ? { key: col.id, direction } : null)}
                    />
                  );
                })}
              </tr>
              {showSearchRow && (
                <tr className="columnSearchRow">
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th>
                    <input
                      className="columnSearchInput"
                      placeholder="Buscar"
                      value={columnSearch.registrationNumber ?? ""}
                      onChange={(e) => setColumnSearchValue("registrationNumber", e.target.value)}
                    />
                  </th>
                  {props.view === "servidores" && (
                    <th>
                      <input
                        className="columnSearchInput"
                        placeholder="Buscar"
                        value={columnSearch.role ?? ""}
                        onChange={(e) => setColumnSearchValue("role", e.target.value)}
                      />
                    </th>
                  )}
                  {activeColumns.map((col) => (
                    <th key={col.id}>
                      <input
                        className="columnSearchInput"
                        placeholder="Buscar"
                        value={columnSearch[col.id] ?? ""}
                        onChange={(e) => setColumnSearchValue(col.id, e.target.value)}
                      />
                    </th>
                  ))}
                </tr>
              )}
            </thead>
            <tbody>
              {sortedRows.length === 0 ? (
                <tr>
                  <td
                    className="emptyState"
                    colSpan={6 + (props.view === "servidores" ? 1 : 0) + activeColumns.length}
                  >
                    No hay registros para mostrar.
                  </td>
                </tr>
              ) : (
                sortedRows.map((r) => (
                  <tr key={r._id}>
                    <td className={`paymentColCell${showPaymentCols ? "" : " collapsed"}`}>
                      <div className={`colCollapseInner colCollapseInnerSmall${showPaymentCols ? "" : " collapsed"}`}>
                        <button
                          type="button"
                          className="rowDeleteBtn"
                          title="Eliminar"
                          onClick={() => handleRequestDelete(r)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className={`paymentColCell${showPaymentCols ? "" : " collapsed"}`}>
                      <div className={`colCollapseInner colCollapseInnerSmall${showPaymentCols ? "" : " collapsed"}`}>
                        <button
                          type="button"
                          className="rowDocBtn"
                          title="Ver respuestas"
                          onClick={() => handleOpenAnswers(r)}
                        >
                          <DocumentIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className={`paymentColCell${showPaymentCols ? "" : " collapsed"}`}>
                      <div className={`colCollapseInner${showPaymentCols ? "" : " collapsed"}`}>
                        <PaymentCell
                          amount={typeof r.paymentAmount === "number" ? r.paymentAmount : 0}
                          max={Math.max(
                            0,
                            props.price - (typeof r.subsidyAmount === "number" ? r.subsidyAmount : 0)
                          )}
                          onChange={(amount) => handleChangePayment(r._id, amount)}
                        />
                      </div>
                    </td>
                    <td className={`paymentColCell${showPaymentCols ? "" : " collapsed"}`}>
                      <div className={`colCollapseInner${showPaymentCols ? "" : " collapsed"}`}>
                        <SubsidyCell
                          amount={typeof r.subsidyAmount === "number" ? r.subsidyAmount : 0}
                          max={Math.max(
                            0,
                            props.subsidyMax -
                              (props.totalSubsidyUsed - (typeof r.subsidyAmount === "number" ? r.subsidyAmount : 0))
                          )}
                          onChange={(amount) => handleChangeSubsidy(r, amount)}
                        />
                      </div>
                    </td>
                    <td className="colDivider"></td>
                    {props.currentUserRole === "SUPERADMIN" ? (
                      <EditableCell
                        column={registrationNumberColumn}
                        value={
                          pendingEdits[`${r._id}::registrationNumber`]
                            ? pendingEdits[`${r._id}::registrationNumber`].newValue
                            : formatRegNum(r.registrationNumber)
                        }
                        isDirty={Boolean(pendingEdits[`${r._id}::registrationNumber`])}
                        canEdit
                        onCommit={(value) => handleCommitEdit(r, registrationNumberColumn, value)}
                      />
                    ) : (
                      <td>{formatRegNum(r.registrationNumber)}</td>
                    )}
                    {props.view === "servidores" && (
                      <td>
                        <RoleDropdown
                          role={String(r.role)}
                          canChange={props.currentUserRole === "SUPERADMIN"}
                          isSaving={false}
                          onChange={(role) => props.onRoleChange(r._id, role)}
                        />
                      </td>
                    )}
                    {activeColumns.map((col) => {
                      const canEditCol = col.editable && (!col.restrictedTo || col.restrictedTo === props.currentUserRole);
                      if (col.type === "pills" && editServidorField) {
                        return (
                          <PillsCell
                            key={col.id}
                            value={asStringArray(r[col.id])}
                            options={(col.options ?? []).map((code) => ({ code, label: formatEnumLabel(code) }))}
                            onChange={(next) => editServidorField(r._id, col.id, next)}
                          />
                        );
                      }
                      if (col.type === "dropup" && editServidorField) {
                        return (
                          <DropupCell
                            key={col.id}
                            value={typeof r[col.id] === "string" ? (r[col.id] as string) : ""}
                            options={col.options ?? []}
                            canEdit={canEditCol}
                            onChange={(next) => editServidorField(r._id, col.id, next)}
                          />
                        );
                      }
                      const key = `${r._id}::${col.id}`;
                      const pending = pendingEdits[key];
                      return (
                        <EditableCell
                          key={col.id}
                          column={col}
                          value={pending ? pending.newValue : renderCellValue(col, r)}
                          isDirty={Boolean(pending)}
                          canEdit={col.editable && (!col.restrictedTo || col.restrictedTo === props.currentUserRole)}
                          onCommit={(value) => handleCommitEdit(r, col, value)}
                        />
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

      {deleteTarget && (
        <ConfirmDeleteModal
          registrationNumber={deleteTarget.registrationNumber}
          name={deleteTarget.name}
          isDeleting={isDeleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
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

      {showExport && (
        <ExportModal
          columns={exportColumns}
          defaultSelected={exportDefaultSelected}
          rowCount={filteredRows.length}
          onCancel={() => setShowExport(false)}
          onExport={handleExport}
        />
      )}
    </div>
  );
};

export default UsersTable;
