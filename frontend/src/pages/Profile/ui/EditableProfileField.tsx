import { useState } from "react";
import { formatEnumLabel } from "./format";

type Props = {
  label: string;
  value: string;
  fieldType?: "text" | "select" | "date";
  options?: string[];
  isDirty: boolean;
  canEdit: boolean;
  onCommit: (value: string) => void;
};

const EditableProfileField: React.FC<Props> = ({
  label,
  value,
  fieldType = "text",
  options,
  isDirty,
  canEdit,
  onCommit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const startEdit = () => {
    if (!canEdit) return;
    setDraft(value);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDraft(value);
  };

  const commit = () => {
    onCommit(draft);
    setIsEditing(false);
  };

  if (fieldType === "select") {
    return (
      <div className="profileRow">
        <span className="profileLabel">{label}</span>
        <select
          className={["cellInput", isDirty && "dirtyCell"].filter(Boolean).join(" ")}
          value={value}
          disabled={!canEdit}
          onChange={(e) => onCommit(e.target.value)}
        >
          {(options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt === "" ? "-" : formatEnumLabel(opt)}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (fieldType === "date") {
    return (
      <div className="profileRow">
        <span className="profileLabel">{label}</span>
        <input
          className={["cellInput", isDirty && "dirtyCell"].filter(Boolean).join(" ")}
          type="date"
          value={value}
          disabled={!canEdit}
          onChange={(e) => onCommit(e.target.value)}
        />
      </div>
    );
  }

  return (
    <div className="profileRow">
      <span className="profileLabel">{label}</span>
      {isEditing ? (
        <input
          className="cellInput"
          autoFocus
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") cancelEdit();
          }}
        />
      ) : (
        <span
          className={["profileValue", canEdit && "editableCell", isDirty && "dirtyCell"]
            .filter(Boolean)
            .join(" ")}
          onDoubleClick={startEdit}
          title={canEdit ? "Doble clic para editar" : undefined}
        >
          {value || "-"}
        </span>
      )}
    </div>
  );
};

export default EditableProfileField;
