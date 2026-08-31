import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const ASSIGNABLE_ROLES = ["SERVIDOR", "ADMIN", "SUPERADMIN"];

type Props = {
  role: string;
  canChange: boolean;
  isSaving: boolean;
  onChange: (role: string) => void;
};

const RoleDropdown: React.FC<Props> = ({ role, canChange, isSaving, onChange }) => {
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
    if (!canChange) return;
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 6, left: rect.left });
    }
    setOpen((o) => !o);
  };

  return (
    <div className="roleDropdown">
      <button
        ref={btnRef}
        type="button"
        className={`roleDropdownBtn ${!canChange ? "readonly" : ""}`}
        onClick={toggleOpen}
        disabled={isSaving}
        title={canChange ? undefined : "Solo un SUPERADMIN puede cambiar el rol"}
      >
        {role}
        {canChange && <span className={`dbDropdownCaret ${open ? "open" : ""}`}>▾</span>}
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="dbDropdownMenu portalMenu"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            {ASSIGNABLE_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                className={`dbDropdownItem ${r === role ? "active" : ""}`}
                onClick={() => {
                  setOpen(false);
                  if (r !== role) onChange(r);
                }}
              >
                {r}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
};

export default RoleDropdown;
