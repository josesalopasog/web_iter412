import { useEffect } from "react";
import { createPortal } from "react-dom";
import TermsAndConditions from "../../Servidores/ui/TermsAndConditions";

type Props = {
  onClose: () => void;
};

// Mismo pop up de términos que el formulario de servidores. Usa clases propias (profileTerms*) porque
// .modalOverlay/.modalCard ya existen con otro estilo en el Dashboard y se pisarían entre sí.
const TermsModal = ({ onClose }: Props) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="profileTermsOverlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="profileTermsCard" onClick={(e) => e.stopPropagation()}>
        <div className="profileTermsHead">
          <h3>Términos y condiciones</h3>
          <button type="button" className="profileTermsClose" title="Cerrar" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="profileTermsBody">
          <TermsAndConditions />
        </div>
        <div className="profileTermsActions">
          <button type="button" className="btnPrimary" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TermsModal;
