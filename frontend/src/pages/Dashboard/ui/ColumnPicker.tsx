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
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const orderRef = useRef(order);
  orderRef.current = order;

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

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const next = [...orderRef.current];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    onChange(next);
  };

  const findIndexAtPoint = (clientY: number): number | null => {
    const container = listRef.current;
    if (!container) return null;
    const items = Array.from(container.querySelectorAll<HTMLElement>("[data-col-index]"));
    if (items.length === 0) return null;

    for (const el of items) {
      const rect = el.getBoundingClientRect();
      if (clientY >= rect.top && clientY <= rect.bottom) {
        return Number(el.dataset.colIndex);
      }
    }
    const firstRect = items[0].getBoundingClientRect();
    if (clientY < firstRect.top) return 0;
    const lastRect = items[items.length - 1].getBoundingClientRect();
    if (clientY > lastRect.bottom) return items.length - 1;
    return null;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLSpanElement>, index: number) => {
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // some browsers may reject capture for certain pointer types; dragging still works via move events
    }
    dragIndex.current = index;
    setDraggingId(orderRef.current[index]?.id ?? null);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (dragIndex.current === null) return;
    const overIndex = findIndexAtPoint(e.clientY);
    if (overIndex !== null && overIndex !== dragIndex.current) {
      moveItem(dragIndex.current, overIndex);
      dragIndex.current = overIndex;
    }
  };

  const endDrag = () => {
    dragIndex.current = null;
    setDraggingId(null);
  };

  return (
    <div className="columnPicker" ref={ref}>
      <button type="button" className="btnGhost columnPickerBtn" onClick={() => setOpen((o) => !o)}>
        <ColumnsIcon className="w-4 h-4" />
        Columnas
      </button>

      {open && (
        <div className="columnPickerMenu" ref={listRef}>
          <p className="columnPickerHint">Marca para mostrar, arrastra para ordenar</p>
          {order.map((item, index) => (
            <div
              key={item.id}
              data-col-index={index}
              className={["columnPickerItem", draggingId === item.id && "dragging"]
                .filter(Boolean)
                .join(" ")}
            >
              <span
                className="columnPickerDragHandle"
                onPointerDown={(e) => handlePointerDown(e, index)}
                onPointerMove={handlePointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
              >
                <DragHandleIcon className="columnPickerDrag" />
              </span>
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
