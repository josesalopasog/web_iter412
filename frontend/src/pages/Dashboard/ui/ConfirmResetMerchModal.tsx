type Props = {
  name: string;
  isResetting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const ConfirmResetMerchModal: React.FC<Props> = ({ name, isResetting, onCancel, onConfirm }) => {
  return (
    <div className="modalOverlay deleteOverlay" role="dialog" aria-modal="true">
      <div className="modalCard">
        <div className="modalHead">
          <h3>🗑️ Borrar pedido de merch</h3>
          <button type="button" className="modalClose" onClick={onCancel}>
            ✕
          </button>
        </div>
        <div className="modalBody" style={{ whiteSpace: "normal" }}>
          <p>
            ¿Seguro que deseas borrar el pedido de merch de <strong>{name}</strong>?
          </p>
          <p>
            No se elimina al servidor: su respuesta a "¿Necesitas camiseta?" pasará a "No" y se borrarán las
            prendas y accesorios que haya solicitado.
          </p>
        </div>
        <div className="modalActions">
          <button type="button" className="btnGhost" onClick={onCancel} disabled={isResetting}>
            Cancelar
          </button>
          <button type="button" className="btnDanger" onClick={onConfirm} disabled={isResetting}>
            {isResetting ? "Borrando..." : "Borrar pedido"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmResetMerchModal;
