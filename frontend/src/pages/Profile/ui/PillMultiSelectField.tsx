import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatEnumLabel } from "./format";

type Props = {
  label: string;
  value: string[];
  options: string[];
  isDirty: boolean;
  canEdit: boolean;
  onCommit: (values: string[]) => void;
};

const PillMultiSelectField: React.FC<Props> = ({
  label,
  value,
  options,
  isDirty,
  canEdit,
  onCommit,
}) => {
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
    const next = value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt];
    onCommit(next);
  };

  const removePill = (opt: string) => {
    onCommit(value.filter((v) => v !== opt));
  };

  return (
    <div className="profileRow">
      <span className="profileLabel">{label}</span>
      <div className={["pillsWrap", isDirty && "dirtyCell"].filter(Boolean).join(" ")}>
        {value.length === 0 && <span className="profileValue">-</span>}
        {value.map((v) => (
          <span key={v} className="pillTag">
            {formatEnumLabel(v)}
            {canEdit && (
              <button
                type="button"
                className="pillRemoveBtn"
                title="Quitar"
                onClick={() => removePill(v)}
              >
                ✕
              </button>
            )}
          </span>
        ))}
        {canEdit && (
          <button ref={btnRef} type="button" className="pillAddBtn" title="Agregar" onClick={toggleOpen}>
            +
          </button>
        )}
      </div>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="dbDropdownMenu portalMenu filterMenu"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            {options.map((opt) => (
              <label key={opt} className="filterMenuItem">
                <input type="checkbox" checked={value.includes(opt)} onChange={() => toggleOption(opt)} />
                {formatEnumLabel(opt)}
              </label>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
};

export default PillMultiSelectField;
