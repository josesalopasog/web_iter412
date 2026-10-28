import { useEffect, useRef, useState } from "react";
import { useKeepInViewport } from "../../../hooks/useKeepInViewport";

export type View = "soldados" | "servidores" | "pedido" | "eliminados";

type Props = {
  view: View;
  showEliminados: boolean;
  onChange: (view: View) => void;
};

const LABELS: Record<View, string> = {
  soldados: "Soldados",
  servidores: "Servidores",
  pedido: "Pedido",
  eliminados: "Eliminados",
};

const ViewDropdown: React.FC<Props> = ({ view, showEliminados, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useKeepInViewport(menuRef);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const options: View[] = showEliminados
    ? ["soldados", "servidores", "eliminados"]
    : ["soldados", "servidores"];

  return (
    <div className="dbDropdown" ref={ref} data-tour="view">
      <button
        type="button"
        className={`dbDropdownBtn ${view}`}
        onClick={() => setOpen((o) => !o)}
      >
        {LABELS[view]}
        <span className={`dbDropdownCaret ${open ? "open" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="dbDropdownMenu" ref={menuRef}>
          {options.map((v) => (
            <button
              key={v}
              type="button"
              className={`dbDropdownItem ${v === view ? "active" : ""}`}
              onClick={() => {
                onChange(v);
                setOpen(false);
              }}
            >
              {LABELS[v]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewDropdown;
