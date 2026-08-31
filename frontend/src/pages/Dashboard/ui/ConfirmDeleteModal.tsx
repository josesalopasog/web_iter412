type Props = {
  registrationNumber: number;
  name: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const ConfirmDeleteModal: React.FC<Props> = ({
  registrationNumber,
  name,
  isDeleting,
  onCancel,
  onConfirm,
}) => {
  return (
    <div className="modalOverlay deleteOverlay" role="dialog" aria-modal="true">
      <div className="modalCard">
        <div className="modalHead">
          <h3>🗑️ Eliminar registro</h3>
          <button type="button" className="modalClose" onClick={onCancel}>
            ✕
          </button>
        </div>
        <div className="modalBody" style={{ whiteSpace: "normal" }}>
          <p>
            ¿Seguro que deseas eliminar el registro N.º{" "}
            <strong>{String(registrationNumber).padStart(3, "0")}</strong> (
            <strong>{name}</strong>)?
          </p>
          <p>Se moverá a la colección de eliminados, no se borra permanentemente.</p>
        </div>
        <div className="modalActions">
          <button type="button" className="btnGhost" onClick={onCancel} disabled={isDeleting}>
            Cancelar
          </button>
          <button
            type="button"
            className="btnDanger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
