import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type PillOption = { code: string; label: string };

type Props = {
  value: string[];
  options: PillOption[];
  onChange: (next: string[]) => Promise<void>;
};

const PillsCell: React.FC<Props> = ({ value, options, onChange }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ bottom: number; left: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (wrapRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const updatePosition = () => {
      const rect = addBtnRef.current?.getBoundingClientRect();
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
  }, [menuOpen]);

  const labelFor = (code: string) => options.find((o) => o.code === code)?.label ?? code;
  const remaining = options.filter((o) => !value.includes(o.code));

  const commit = async (next: string[]) => {
    setIsSaving(true);
    try {
      await onChange(next);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = (code: string) => {
    setMenuOpen(false);
    commit(value.filter((v) => v !== code));
  };

  const handleAdd = (code: string) => {
    setMenuOpen(false);
    commit([...value, code]);
  };

  return (
    <td className="dbPillsCell">
      <div className="dbPillsWrap" ref={wrapRef}>
        {value.map((code) => (
          <span key={code} className="dbPill">
            {labelFor(code)}
            <button
              type="button"
              className="dbPillRemove"
              title="Quitar"
              disabled={isSaving}
              onClick={() => handleRemove(code)}
            >
              ×
            </button>
          </span>
        ))}

        <div className="dbPillAddWrap">
          <button
            type="button"
            ref={addBtnRef}
            className="dbPillAddBtn"
            title="Agregar"
            disabled={isSaving || remaining.length === 0}
            onClick={() => setMenuOpen((o) => !o)}
          >
            +
          </button>
        </div>
      </div>

      {menuOpen &&
        menuPos &&
        createPortal(
          <div
            className="dbPillAddMenu"
            ref={menuRef}
            style={{ bottom: menuPos.bottom, left: menuPos.left }}
          >
            {remaining.map((o) => (
              <button key={o.code} type="button" className="dbPillAddOption" onClick={() => handleAdd(o.code)}>
                {o.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </td>
  );
};

export default PillsCell;
