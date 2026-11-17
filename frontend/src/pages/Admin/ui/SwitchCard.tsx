import { useState, type ReactNode } from "react";
import { updateSwitch } from "../../../api/settings";
import type { SwitchKey } from "../../../api/settings";
import { useAdminData } from "../AdminData";

type Props = {
  switchKey: SwitchKey;
  title: string;
  subtitle: ReactNode;
  /** Texto junto al interruptor. */
  label: string;
  onText: string;
  offText: string;
  canEdit: boolean;
  /** Quién puede cambiarlo (se muestra si no tiene permiso). */
  whoCanEdit: string;
  /** Lo que se le pregunta antes de encender / apagar (siempre se pide confirmación). */
  confirmOn: { title: string; body: ReactNode };
  confirmOff: { title: string; body: ReactNode };
};

/**
 * Tarjeta con un interruptor de la página (abrir / cerrar una función). Como son cambios
 * delicados que ven todos los servidores o visitantes, siempre pide confirmación en un pop up.
 */
const SwitchCard = ({ switchKey, title, subtitle, label, onText, offText, canEdit, whoCanEdit, confirmOn, confirmOff }: Props) => {
  const data = useAdminData();
  const isOn = data.switches[switchKey];
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ask = isOn ? confirmOff : confirmOn;

  const apply = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateSwitch(switchKey, !isOn);
      data.setSwitches({
        serviceSignupOpen: updated.serviceSignupOpen,
        merchOrdersOpen: updated.merchOrdersOpen,
        retreatInfoOpen: updated.retreatInfoOpen,
      });
      setConfirming(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="chartCard lifecycleCard">
      <div className="chartCardHeader">
        <div>
          <h2 className="chartCardTitle">{title}</h2>
          <p className="chartCardSubtitle">{subtitle}</p>
        </div>
        <span className={`statusPill ${isOn ? "completo" : "sinPago"}`}>{isOn ? "Activo" : "Desactivado"}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isOn}
        className={`adSwitch${isOn ? " is-on" : ""}`}
        disabled={!canEdit || saving}
        onClick={() => {
          setError(null);
          setConfirming(true);
        }}
      >
        <span className="adSwitchKnob" aria-hidden="true" />
        <span>{label}</span>
      </button>
      <p className="lifecycleHint">{isOn ? onText : offText}</p>
      {!canEdit && <p className="lifecycleHint">{whoCanEdit}</p>}

      {confirming && (
        <div className="modalOverlay" role="dialog" aria-modal="true" onClick={() => !saving && setConfirming(false)}>
          <div className="modalCard" onClick={(e) => e.stopPropagation()}>
            <div className="modalHead">
              <h3>⚠️ {ask.title}</h3>
              <button type="button" className="modalClose" onClick={() => setConfirming(false)} disabled={saving}>
                ✕
              </button>
            </div>
            <div className="modalBody" style={{ whiteSpace: "normal" }}>
              {ask.body}
              {error && <p className="loginError">{error}</p>}
            </div>
            <div className="modalActions">
              <button type="button" className="btnGhost" onClick={() => setConfirming(false)} disabled={saving}>
                Cancelar
              </button>
              <button type="button" className={isOn ? "btnDanger" : "btnPrimary"} onClick={apply} disabled={saving}>
                {saving ? "Guardando…" : isOn ? "Sí, desactivar" : "Sí, activar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwitchCard;
