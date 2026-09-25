type Props = {
  title: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const ConfirmDeleteEventModal: React.FC<Props> = ({ title, isDeleting, onCancel, onConfirm }) => {
  return (
    <div className="modalOverlay deleteOverlay" role="dialog" aria-modal="true">
      <div className="modalCard">
        <div className="modalHead">
          <h3>🗑️ Eliminar evento</h3>
          <button type="button" className="modalClose" onClick={onCancel}>
            ✕
          </button>
        </div>
        <div className="modalBody" style={{ whiteSpace: "normal" }}>
          <p>
            ¿Seguro que deseas eliminar el evento <strong>{title}</strong>?
          </p>
          <p>Esta acción no se puede deshacer.</p>
        </div>
        <div className="modalActions">
          <button type="button" className="eventBtnGhost" onClick={onCancel} disabled={isDeleting}>
            Cancelar
          </button>
          <button type="button" className="btnDanger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteEventModal;
