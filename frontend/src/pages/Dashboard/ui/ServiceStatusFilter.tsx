import { useEffect, useRef, useState } from "react";
import { SERVICE_STATUS_LABELS } from "./serviceStatus";
import type { ServiceStatusFilterValue } from "./serviceStatus";
import StatusLed from "./StatusLed";
import { useKeepInViewport } from "../../../hooks/useKeepInViewport";

const OPTIONS: ServiceStatusFilterValue[] = ["ACTIVO", "INACTIVO", "SANTISIMO_NOCTURNO", "TODOS"];

type Props = {
  value: ServiceStatusFilterValue;
  counts: Record<ServiceStatusFilterValue, number>;
  onChange: (value: ServiceStatusFilterValue) => void;
};

const ServiceStatusFilter: React.FC<Props> = ({ value, counts, onChange }) => {
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

  return (
    <div className="dbDropdown" ref={ref}>
      <button
        type="button"
        className={`btnGhost columnPickerBtn serviceStatusFilterBtn status-${value.toLowerCase()}`}
        title="Filtrar por disponibilidad"
        onClick={() => setOpen((o) => !o)}
      >
        <StatusLed />
        <span className="columnPickerBtnLabel">{SERVICE_STATUS_LABELS[value]}</span>
        <span className={`dbDropdownCaret ${open ? "open" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="dbDropdownMenu" ref={menuRef}>
          {OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`dbDropdownItem ${opt === value ? "active" : ""}`}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              <StatusLed status={opt} />
              {SERVICE_STATUS_LABELS[opt]} ({counts[opt]})
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceStatusFilter;
