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
import { TrashIcon, ExcelIcon } from "../../../assets/icons";
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
      onViewChange: (view: View) => void;
      onEditField: (id: string, field: string, value: string) => Promise<void>;
      onDelete: (id: string) => Promise<void>;
    }
  | {
      view: "servidores";
      rows: ServidorRecord[];
      currentUserRole: string;
      showEliminados: boolean;
      onViewChange: (view: View) => void;
      onEditField: (id: string, field: string, value: string) => Promise<void>;
      onDelete: (id: string) => Promise<void>;
      onRoleChange: (id: string, role: string) => Promise<void>;
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
  const [search, setSearch] = useState("");

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
    return row[col.id] != null ? String(row[col.id]) : "";
  };

  const getFilterSelected = (col: (typeof columns)[number]) =>
    columnFilters[col.id] ?? new Set(col.options ?? []);

  const setColumnFilter = (colId: string, selected: Set<string>) => {
    setColumnFilters((prev) => ({ ...prev, [colId]: selected }));
  };

  const exportColumns: ExportColumn[] = [
    { id: "registrationNumber", label: "N° Registro" },
    ...(props.view === "servidores" ? [{ id: "role", label: "Rol" }] : []),
    ...visibleColumns.filter((c) => c.id !== "password").map((c) => ({ id: c.id, label: c.label })),
  ];

  const exportDefaultSelected = [
    "registrationNumber",
    ...(props.view === "servidores" ? ["role"] : []),
    ...activeColumns.map((c) => c.id),
  ];

  const searchFilteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return props.rows;
    return props.rows.filter((r) => {
      const fullName = `${r.firstNames} ${r.lastNames}`.toLowerCase();
      return fullName.includes(q) || String(r.documentNumber ?? "").toLowerCase().includes(q);
    });
  }, [props.rows, search]);

  const filteredRows = useMemo(() => {
    let rows = searchFilteredRows;
    for (const col of visibleColumns) {
      if (!col.filterable || !col.options) continue;
      const selected = columnFilters[col.id];
      if (!selected || selected.size === col.options.length) continue;
      rows = rows.filter((r) => selected.has(renderCellValue(col, r)));
    }
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFilteredRows, columnFilters, visibleColumns]);

  const getSortValue = (key: string, row: SoldadoRecord | ServidorRecord): string | number => {
    if (key === "registrationNumber") return row.registrationNumber;
    if (key === "role") return String((row as ServidorRecord).role ?? "");
    if (key === "gender") return normalizeGender(row.gender as string | undefined) || "";
    return row[key] != null ? String(row[key]) : "";
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

  const exportValueFor = (colId: string, row: SoldadoRecord | ServidorRecord) => {
    if (colId === "registrationNumber") return formatRegNum(row.registrationNumber);
    if (colId === "role") return String((row as ServidorRecord).role ?? "");
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
          <span className="tableCount">{filteredRows.length} registros</span>
          <ColumnPicker columns={visibleColumns} order={columnOrder} onChange={handleColumnOrderChange} />
        </div>
        <div className="tableSectionHeadRight">
          <button
            type="button"
            className="btnGhost exportBtn"
            title="Exportar a Excel"
            onClick={() => setShowExport(true)}
          >
            <ExcelIcon />
          </button>
          <input
            className="formInput tableSearch"
            placeholder="Buscar por nombre o documento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="tableScroll">
        <table className="dataTable">
          <thead>
              <tr>
                <th></th>
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
            </thead>
            <tbody>
              {sortedRows.length === 0 ? (
                <tr>
                  <td className="emptyState" colSpan={2 + (props.view === "servidores" ? 1 : 0) + activeColumns.length}>
                    No hay registros para mostrar.
                  </td>
                </tr>
              ) : (
                sortedRows.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <button
                        type="button"
                        className="rowDeleteBtn"
                        title="Eliminar"
                        onClick={() =>
                          setDeleteTarget({
                            id: r._id,
                            registrationNumber: r.registrationNumber,
                            name: `${r.firstNames} ${r.lastNames}`,
                          })
                        }
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
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
