import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatEnumLabel } from "../../Profile/ui/format";

type Props = {
  value: string;
  options: string[];
  canEdit: boolean;
  onChange: (next: string) => Promise<void>;
};

const DropupCell: React.FC<Props> = ({ value, options, canEdit, onChange }) => {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ bottom: number; left: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const rect = btnRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuPos({ bottom: window.innerHeight - rect.top + 6, left: rect.left });
    };
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  const select = async (next: string) => {
    setOpen(false);
    if (next === value) return;
    setIsSaving(true);
    try {
      await onChange(next);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <td>
      <button
        ref={btnRef}
        type="button"
        className="dbDropupBtn"
        disabled={!canEdit || isSaving}
        onClick={() => setOpen((o) => !o)}
      >
        {value ? formatEnumLabel(value) : "-"}
        {canEdit && <span className="dbDropdownCaret">▴</span>}
      </button>

      {open &&
        menuPos &&
        createPortal(
          <div
            ref={menuRef}
            className="dbPillAddMenu"
            style={{ bottom: menuPos.bottom, left: menuPos.left }}
          >
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`dbPillAddOption${opt === value ? " active" : ""}`}
                onClick={() => select(opt)}
              >
                {formatEnumLabel(opt)}
              </button>
            ))}
          </div>,
          document.body
        )}
    </td>
  );
};

export default DropupCell;
