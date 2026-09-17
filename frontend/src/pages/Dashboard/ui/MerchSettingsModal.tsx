import { useState } from "react";
import type { AppSettings } from "../../../api/settings";
import { updateMerchSettings } from "../../../api/settings";
import { formatNumberCO, parseDigits } from "./paymentConfig";

type Props = {
  settings: AppSettings;
  token: string;
  canEdit: boolean;
  onSaved: (updated: AppSettings) => void;
  onClose: () => void;
};

type MerchField =
  | "busoChaquetaPrice"
  | "shirtPrice"
  | "canguroPrice"
  | "tulaPrice"
  | "cachuchaPrice"
  | "extraSizePrice";

const FIELD_LABELS: Record<MerchField, string> = {
  busoChaquetaPrice: "Chaqueta o buso",
  shirtPrice: "Camiseta manga corta",
  canguroPrice: "Canguro",
  tulaPrice: "Tula",
  cachuchaPrice: "Cachucha",
  extraSizePrice: "Recargo talla especial (XL o más)",
};

const FIELDS: MerchField[] = [
  "busoChaquetaPrice",
  "shirtPrice",
  "canguroPrice",
  "tulaPrice",
  "cachuchaPrice",
  "extraSizePrice",
];

const MerchSettingsModal: React.FC<Props> = ({ settings, token, canEdit, onSaved, onClose }) => {
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasChanges = FIELDS.some((f) => draft[f] !== settings[f]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const payload: Partial<AppSettings> = {};
      for (const f of FIELDS) {
        if (draft[f] !== settings[f]) payload[f] = draft[f];
      }
      const updated = await updateMerchSettings(token, payload);
      onSaved(updated);
      setDraft(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar los precios");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modalCard">
        <div className="modalHead">
          <h3>⚙️ Precios de merch</h3>
          <button type="button" className="modalClose" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modalBody">
          <div className="configColumn">
            {FIELDS.map((f) => (
              <label className="configField" key={f}>
                <span>{FIELD_LABELS[f]}</span>
                <div className="configInputGroup">
                  <span className="paymentInputPrefix">$</span>
                  <input
                    className="configInput"
                    type="text"
                    inputMode="numeric"
                    disabled={!canEdit}
                    value={formatNumberCO(draft[f])}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, [f]: parseDigits(e.target.value) }))
                    }
                  />
                </div>
              </label>
            ))}
          </div>

          {!canEdit && (
            <p className="configHint">Solo un SUPERADMIN o TREASURER puede editar estos valores.</p>
          )}
          {error && <p className="configError">{error}</p>}
        </div>

        <div className="modalActions">
          <button type="button" className="btnGhost" onClick={onClose}>
            Cerrar
          </button>
          {canEdit && hasChanges && (
            <button type="button" className="btnPrimary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchSettingsModal;
