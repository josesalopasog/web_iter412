export type SettingsChange = {
  key: string;
  label: string;
  oldDisplay: string;
  newDisplay: string;
};

type Props = {
  changes: SettingsChange[];
  isSaving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const ConfirmSettingsModal: React.FC<Props> = ({ changes, isSaving, onCancel, onConfirm }) => {
  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modalCard">
        <div className="modalHead">
          <h3>⚠️ Confirmar cambios de configuración</h3>
          <button type="button" className="modalClose" onClick={onCancel} disabled={isSaving}>
            ✕
          </button>
        </div>
        <div className="modalBody" style={{ whiteSpace: "normal" }}>
          <p className="settingsWarning">
            Esta información cambiará en toda la página (formulario de inscripción, inicio y dashboard).
            ¿Estás seguro de cambiar:
          </p>
          <ul className="pendingChangesList">
            {changes.map((c) => (
              <li key={c.key}>
                <strong>{c.label}</strong>:{" "}
                <span className="oldValue">{c.oldDisplay}</span> →{" "}
                <span className="newValue">{c.newDisplay}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="modalActions">
          <button type="button" className="btnGhost" onClick={onCancel} disabled={isSaving}>
            Cancelar
          </button>
          <button type="button" className="btnPrimary" onClick={onConfirm} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSettingsModal;
