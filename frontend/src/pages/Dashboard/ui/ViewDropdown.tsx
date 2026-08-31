import { useEffect, useRef, useState } from "react";

export type View = "soldados" | "servidores" | "eliminados";

type Props = {
  view: View;
  showEliminados: boolean;
  onChange: (view: View) => void;
};

const LABELS: Record<View, string> = {
  soldados: "Soldados",
  servidores: "Servidores",
  eliminados: "Eliminados",
};

const ViewDropdown: React.FC<Props> = ({ view, showEliminados, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
    <div className="dbDropdown" ref={ref}>
      <button
        type="button"
        className={`dbDropdownBtn ${view}`}
        onClick={() => setOpen((o) => !o)}
      >
        {LABELS[view]}
        <span className={`dbDropdownCaret ${open ? "open" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="dbDropdownMenu">
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
