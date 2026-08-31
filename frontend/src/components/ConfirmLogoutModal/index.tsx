type Props = {
  onCancel: () => void;
  onConfirm: () => void;
};

const ConfirmLogoutModal: React.FC<Props> = ({ onCancel, onConfirm }) => {
  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modalCard">
        <div className="modalHead">
          <h3>Cerrar sesión</h3>
          <button type="button" className="modalClose" onClick={onCancel}>
            ✕
          </button>
        </div>
        <div className="modalBody" style={{ whiteSpace: "normal" }}>
          <p>¿Seguro que quieres cerrar sesión?</p>
        </div>
        <div className="modalActions">
          <button type="button" className="btnGhost" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="btnDanger" onClick={onConfirm}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmLogoutModal;
