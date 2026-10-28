import { useState } from "react";
import { updateMyServidorField } from "../../../api/adminUsers";
import { DocumentIcon } from "../../../assets/icons";
import TermsModal from "./TermsModal";
import { usePublicSettings } from "../../../hooks/usePublicSettings";
import { toRoman } from "../../../utils/romanNumeral";

export type ServiceStatus = "ACTIVO" | "INACTIVO" | "SANTISIMO_NOCTURNO";

type Props = {
  value: ServiceStatus;
  /** Se llama al cambiar (antes de guardar) y al revertir si falla, para que el tema del perfil siga al estado. */
  onChange: (next: ServiceStatus) => void;
  onSaved: () => void;
};

// "Activo para servir" (verde/gris). Si está inactivo aparece "Santísimo Nocturno" debajo: quien no
// sirve en el retiro aún puede apuntarse a acompañar el Santísimo en la noche.
const ServiceStatusToggle = ({ value, onChange, onSaved }: Props) => {
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const { retreatNumber } = usePublicSettings();

  const isActive = value === "ACTIVO";
  const isNightAdoration = value === "SANTISIMO_NOCTURNO";

  const save = async (next: ServiceStatus) => {
    const previous = value;
    onChange(next);
    setSaving(true);
    setErrorMsg(null);
    try {
      await updateMyServidorField("serviceStatus", next);
      onSaved();
    } catch (error) {
      onChange(previous);
      setErrorMsg(error instanceof Error ? error.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="estado-servicio" className="profileSection serviceStatusSection" data-tour="status">
      <h3>Disponibilidad</h3>
      <p className="serviceStatusRetreat">
        Servir en el <strong>{toRoman(retreatNumber)} Retiro de ITER 4.12</strong>
      </p>
      <p className="serviceStatusHint">
        Mantén encendido <strong>Activo para servir</strong> si puedes servir en este retiro. Si esta vez no
        puedes, apágalo; y si aun así quieres acompañar al Santísimo durante la noche, enciende{" "}
        <strong>Santísimo Nocturno</strong>.
      </p>

      <button
        type="button"
        role="switch"
        aria-checked={isActive}
        className={`serviceStatusBtn${isActive ? " is-on" : ""}`}
        disabled={saving}
        // Desactivar pide confirmación; volver a activarse no.
        onClick={() => (isActive ? setConfirmDeactivate(true) : save("ACTIVO"))}
      >
        <span className="serviceStatusKnob" aria-hidden="true" />
        <span className="serviceStatusLabel">Activo para servir</span>
      </button>

      {!isActive && (
        <button
          type="button"
          role="switch"
          aria-checked={isNightAdoration}
          className={`serviceStatusBtn serviceStatusBtnNight${isNightAdoration ? " is-on" : ""}`}
          disabled={saving}
          onClick={() => save(isNightAdoration ? "INACTIVO" : "SANTISIMO_NOCTURNO")}
        >
          <span className="serviceStatusKnob" aria-hidden="true" />
          <span className="serviceStatusLabel">Santísimo Nocturno</span>
        </button>
      )}

      {errorMsg && <p className="testimonyMessage is-error">{errorMsg}</p>}

      <button type="button" className="serviceTermsBtn" onClick={() => setShowTerms(true)}>
        <DocumentIcon className="w-4 h-4" />
        Consultar términos y condiciones nuevamente
      </button>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}

      {confirmDeactivate && (
        <div className="profileTermsOverlay" role="dialog" aria-modal="true" onClick={() => setConfirmDeactivate(false)}>
          <div className="profileTermsCard profileConfirmCard" onClick={(e) => e.stopPropagation()}>
            <div className="profileTermsHead">
              <h3>¿Estás seguro que quieres desactivar esta opción?</h3>
              <button
                type="button"
                className="profileTermsClose"
                title="Cerrar"
                onClick={() => setConfirmDeactivate(false)}
              >
                ✕
              </button>
            </div>
            <div className="profileTermsBody">
              <p>
                Si desactivas esta opción no te tendremos en cuenta para servir en el{" "}
                <strong>{toRoman(retreatNumber)} Retiro de ITER 4.12</strong>. Podrás volver a activarla
                cuando quieras.
              </p>
            </div>
            <div className="profileTermsActions">
              <button type="button" className="profileConfirmBtn" onClick={() => setConfirmDeactivate(false)}>
                Cancelar
              </button>
              <button
                type="button"
                className="profileConfirmBtn is-danger"
                onClick={() => {
                  setConfirmDeactivate(false);
                  save("INACTIVO");
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceStatusToggle;
