import { useState } from "react";
import type { ColumnDef } from "./columnDefs";

type Props = {
  column: ColumnDef;
  value: string;
  isDirty: boolean;
  canEdit: boolean;
  onCommit: (value: string) => void;
};

const EditableCell: React.FC<Props> = ({ column, value, isDirty, canEdit, onCommit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const startEdit = () => {
    if (!canEdit) return;
    setDraft(column.id === "password" ? "" : value);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDraft(value);
  };

  const commit = () => {
    if (column.id === "password" && draft.trim() === "") {
      setIsEditing(false);
      return;
    }
    onCommit(draft);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <td
        className={[canEdit && "editableCell", isDirty && "dirtyCell"].filter(Boolean).join(" ") || undefined}
        onDoubleClick={startEdit}
        title={canEdit ? "Doble clic para editar" : undefined}
      >
        {column.id === "password" ? (isDirty ? "Nueva contraseña pendiente" : "••••••••") : value || "-"}
      </td>
    );
  }

  return (
    <td className="editingCell">
      {column.type === "select" ? (
        <select
          className="cellInput"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") cancelEdit();
          }}
        >
          {(column.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          className="cellInput"
          autoFocus
          type={column.id === "password" ? "password" : "text"}
          placeholder={column.id === "password" ? "Nueva contraseña" : undefined}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") cancelEdit();
          }}
        />
      )}
    </td>
  );
};

export default EditableCell;
