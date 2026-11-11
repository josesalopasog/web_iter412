import { useState, type ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon, SearchIcon } from "../icons";
import { downloadXlsx } from "../../Dashboard/ui/exportXlsx";
import { Segmented } from "./PageParts";

export type DataColumn<T> = {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  /** Valor plano para buscar y exportar. */
  value: (row: T) => string | number;
  align?: "right";
  className?: string;
};

export type DataTab<T> = { value: string; label: string; match?: (row: T) => boolean; dot?: string };

type Props<T> = {
  id: string;
  rows: T[];
  columns: DataColumn<T>[];
  getRowId: (row: T) => string;
  tabs?: DataTab<T>[];
  searchPlaceholder: string;
  emptyText: string;
  actions?: (row: T) => ReactNode;
  pageSize?: number;
};

const normalize = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Tabla con pestañas de estado, búsqueda, exportar a Excel y páginas (estilo cytek).
const DataTable = <T,>({ id, rows, columns, getRowId, tabs, searchPlaceholder, emptyText, actions, pageSize = 15 }: Props<T>) => {
  const [tab, setTab] = useState(tabs?.[0]?.value ?? "");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const activeTab = tabs?.find((t) => t.value === tab);
  const query = normalize(search.trim());
  const filtered = rows.filter(
    (row) =>
      (!activeTab?.match || activeTab.match(row)) &&
      (!query || columns.some((c) => normalize(String(c.value(row))).includes(query)))
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const firstRow = filtered.length ? (currentPage - 1) * pageSize + 1 : 0;

  const exportRows = () =>
    downloadXlsx(
      `${id}.xlsx`,
      id.slice(0, 31),
      columns.map((c) => c.label),
      filtered.map((row) => columns.map((c) => String(c.value(row))))
    );

  return (
    <div className="dataTableBlock">
      {tabs && (
        <Segmented
          label="Filtrar"
          value={tab}
          onChange={(value) => {
            setTab(value);
            setPage(1);
          }}
          options={tabs.map((t) => ({
            value: t.value,
            label: t.label,
            dot: t.dot,
            count: rows.filter((r) => !t.match || t.match(r)).length,
          }))}
        />
      )}

      <div className="tableToolbar">
        <label className="tableSearch">
          <SearchIcon />
          <input
            type="search"
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <button type="button" className="toolbarButton" onClick={exportRows} disabled={filtered.length === 0}>
          <DownloadIcon /> Exportar
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="pageEmpty tableEmpty">{rows.length === 0 ? emptyText : "No hay resultados con estos filtros."}</p>
      ) : (
        <div className="adTableWrapper">
          <table className="adTable">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className={c.align === "right" ? "alignRight" : undefined}>
                    {c.label}
                  </th>
                ))}
                {actions && <th className="alignRight">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr key={getRowId(row)}>
                  {columns.map((c) => (
                    <td key={c.key} className={[c.align === "right" ? "alignRight" : "", c.className ?? ""].join(" ").trim() || undefined}>
                      {c.render(row)}
                    </td>
                  ))}
                  {actions && <td className="alignRight">{actions(row)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > pageSize && (
        <TablePagination
          first={firstRow}
          last={Math.min(currentPage * pageSize, filtered.length)}
          total={filtered.length}
          page={currentPage}
          pageCount={pageCount}
          onPage={setPage}
        />
      )}
    </div>
  );
};

export const TablePagination = ({
  first,
  last,
  total,
  page,
  pageCount,
  onPage,
  children,
}: {
  first: number;
  last: number;
  total: number;
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
  children?: ReactNode;
}) => (
  <div className="tablePagination">
    <span>
      {first}–{last} de {total}
    </span>
    <div className="tablePaginationButtons">
      {children}
      <button type="button" className="adIconButton" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Página anterior">
        <ChevronLeftIcon />
      </button>
      <span>
        {page} / {pageCount}
      </span>
      <button type="button" className="adIconButton" onClick={() => onPage(page + 1)} disabled={page >= pageCount} aria-label="Página siguiente">
        <ChevronRightIcon />
      </button>
    </div>
  </div>
);

export default DataTable;
