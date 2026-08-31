import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FilterIcon } from "../../../assets/icons";

type Props = {
  label: string;
  options: string[];
  selected: Set<string>;
  onChange: (selected: Set<string>) => void;
};

const FilterableHeader: React.FC<Props> = ({ label, options, selected, onChange }) => {
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

  const toggleOption = (opt: string) => {
    const next = new Set(selected);
    if (next.has(opt)) next.delete(opt);
    else next.add(opt);
    onChange(next);
  };

  const isFiltered = selected.size < options.length;

  return (
    <th>
      <button ref={btnRef} type="button" className="sortHeaderBtn" onClick={toggleOpen}>
        <span>{label}</span>
        <FilterIcon className={`filterHeaderIcon ${isFiltered ? "active" : ""}`} />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="dbDropdownMenu portalMenu filterMenu"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            <div className="filterMenuActions">
              <button type="button" className="linkBtn" onClick={() => onChange(new Set(options))}>
                Marcar todas
              </button>
              <button type="button" className="linkBtn" onClick={() => onChange(new Set())}>
                Desmarcar todas
              </button>
            </div>
            {options.map((opt) => (
              <label key={opt} className="filterMenuItem">
                <input
                  type="checkbox"
                  checked={selected.has(opt)}
                  onChange={() => toggleOption(opt)}
                />
                {opt}
              </label>
            ))}
          </div>,
          document.body
        )}
    </th>
  );
};

export default FilterableHeader;
