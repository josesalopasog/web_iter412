import { useEffect, useRef, useState } from "react";
import type { ColumnDef } from "./columnDefs";
import { ColumnsIcon, DragHandleIcon } from "../../../assets/icons";

export type ColumnOrderItem = { id: string; visible: boolean };

type Props = {
  columns: ColumnDef[];
  order: ColumnOrderItem[];
  onChange: (order: ColumnOrderItem[]) => void;
};

const ColumnPicker: React.FC<Props> = ({ columns, order, onChange }) => {
  const [open, setOpen] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const labelFor = (id: string) => columns.find((c) => c.id === id)?.label ?? id;

  const toggleVisible = (id: string) => {
    onChange(order.map((item) => (item.id === id ? { ...item, visible: !item.visible } : item)));
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex.current === null || dragIndex.current === targetIndex) return;
    const next = [...order];
    const [moved] = next.splice(dragIndex.current, 1);
    next.splice(targetIndex, 0, moved);
    dragIndex.current = null;
    onChange(next);
  };

  return (
    <div className="columnPicker" ref={ref}>
      <button type="button" className="btnGhost columnPickerBtn" onClick={() => setOpen((o) => !o)}>
        <ColumnsIcon className="w-4 h-4" />
        Columnas
      </button>

      {open && (
        <div className="columnPickerMenu">
          <p className="columnPickerHint">Marca para mostrar, arrastra para ordenar</p>
          {order.map((item, index) => (
            <div
              key={item.id}
              className="columnPickerItem"
              draggable
              onDragStart={() => (dragIndex.current = index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
            >
              <DragHandleIcon className="columnPickerDrag" />
              <label>
                <input
                  type="checkbox"
                  checked={item.visible}
                  onChange={() => toggleVisible(item.id)}
                />
                {labelFor(item.id)}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColumnPicker;
