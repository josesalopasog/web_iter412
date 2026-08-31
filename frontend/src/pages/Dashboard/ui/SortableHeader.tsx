import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { SortType } from "./columnDefs";

export type SortDirection = "asc" | "desc";

type Props = {
  label: string;
  sortType?: SortType;
  active: SortDirection | null;
  onSort: (direction: SortDirection | null) => void;
};

const OPTION_LABELS: Record<SortType, { asc: string; desc: string }> = {
  text: { asc: "A → Z", desc: "Z → A" },
  numeric: { asc: "Menor a mayor", desc: "Mayor a menor" },
  date: { asc: "Más antiguo primero", desc: "Más reciente primero" },
};

const SortableHeader: React.FC<Props> = ({ label, sortType = "text", active, onSort }) => {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        btnRef.current &&
        !btnRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const toggleOpen = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 6, left: rect.left });
    }
    setOpen((o) => !o);
  };

  const opts = OPTION_LABELS[sortType];

  return (
    <th>
      <button ref={btnRef} type="button" className="sortHeaderBtn" onClick={toggleOpen}>
        <span>{label}</span>
        <span className={`sortHeaderIcon ${active ? "active" : ""}`}>
          {active === "asc" ? "▲" : active === "desc" ? "▼" : "⇅"}
        </span>
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="dbDropdownMenu portalMenu"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            <button
              type="button"
              className={`dbDropdownItem ${active === "asc" ? "active" : ""}`}
              onClick={() => {
                onSort("asc");
                setOpen(false);
              }}
            >
              {opts.asc}
            </button>
            <button
              type="button"
              className={`dbDropdownItem ${active === "desc" ? "active" : ""}`}
              onClick={() => {
                onSort("desc");
                setOpen(false);
              }}
            >
              {opts.desc}
            </button>
            {active && (
              <button
                type="button"
                className="dbDropdownItem"
                onClick={() => {
                  onSort(null);
                  setOpen(false);
                }}
              >
                Quitar orden
              </button>
            )}
          </div>,
          document.body
        )}
    </th>
  );
};

export default SortableHeader;
