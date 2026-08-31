export type PendingChange = {
  key: string;
  rowLabel: string;
  fieldLabel: string;
  oldDisplay: string;
  newDisplay: string;
};

type Props = {
  changes: PendingChange[];
  isSaving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const PendingChangesModal: React.FC<Props> = ({ changes, isSaving, onCancel, onConfirm }) => {
  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modalCard">
        <div className="modalHead">
          <h3>✏️ Confirmar cambios</h3>
          <button type="button" className="modalClose" onClick={onCancel} disabled={isSaving}>
            ✕
          </button>
        </div>
        <div className="modalBody" style={{ whiteSpace: "normal" }}>
          <p>Vas a guardar los siguientes cambios:</p>
          <ul className="pendingChangesList">
            {changes.map((c) => (
              <li key={c.key}>
                <strong>{c.rowLabel}</strong> — {c.fieldLabel}:{" "}
                <span className="oldValue">{c.oldDisplay || "(vacío)"}</span>{" "}
                →{" "}
                <span className="newValue">{c.newDisplay || "(vacío)"}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="modalActions">
          <button type="button" className="btnGhost" onClick={onCancel} disabled={isSaving}>
            Cancelar
          </button>
          <button type="button" className="btnPrimary" onClick={onConfirm} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingChangesModal;
