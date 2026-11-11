import { useState } from "react";
import type { AppSettings } from "../../../api/settings";
import { updateMerchSettings } from "../../../api/settings";
import { formatNumberCO, parseDigits } from "./paymentConfig";

type Props = {
  settings: AppSettings;
  canEdit: boolean;
  onSaved: (updated: AppSettings) => void;
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

// Precios de merch (antes un pop up): vive en Pedido de merch → Precios.
const MerchSettingsForm: React.FC<Props> = ({ settings, canEdit, onSaved }) => {
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
      const updated = await updateMerchSettings(payload);
      onSaved(updated);
      setDraft(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar los precios");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="chartCard settingsPanel">
        <div className="chartCardHeader">
          <div>
            <h2 className="chartCardTitle">Precios de merch</h2>
            <p className="chartCardSubtitle">Lo que paga cada servidor por prenda. Cambiarlos recalcula el total de cada pedido.</p>
          </div>
        </div>

        <div className="settingsPanelBody">
          <div className="configColumn merchPriceGrid">
            {FIELDS.map((f) => (
              <label className="configField" key={f}>
                <span>{FIELD_LABELS[f]}</span>
                <div className="configInputGroup">
                  <span className="paymentInputPrefix">$</span>
                  <input
                    className="configInput"
                    autoComplete="off"
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
            <p className="configHint">Solo un ADMIN, SUPERADMIN o TESORERO puede editar estos valores.</p>
          )}
          {error && <p className="configError">{error}</p>}
        </div>

        {canEdit && (
          <div className="settingsPanelActions">
            <span className="settingsPanelHint">{hasChanges ? "Hay cambios sin guardar" : "Sin cambios"}</span>
            <button type="button" className="toolbarButton" disabled={!hasChanges || isSaving} onClick={() => setDraft(settings)}>
              Descartar
            </button>
            <button type="button" className="toolbarButton primary" onClick={handleSave} disabled={!hasChanges || isSaving}>
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        )}
    </div>
  );
};

export default MerchSettingsForm;
