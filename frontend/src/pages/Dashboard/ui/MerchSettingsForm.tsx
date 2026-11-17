import { useState } from "react";
import type { AppSettings } from "../../../api/settings";
import { updateMerchSettings } from "../../../api/settings";
import { formatCOP, formatNumberCO, parseDigits } from "./paymentConfig";
import ConfirmSettingsModal from "./ConfirmSettingsModal";

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

// Precios de merch: viven en Pedido de merch → Ajustes. Guardar pide confirmación.
const MerchSettingsForm: React.FC<Props> = ({ settings, canEdit, onSaved }) => {
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const hasChanges = FIELDS.some((f) => draft[f] !== settings[f]);
  const changes = FIELDS.filter((f) => draft[f] !== settings[f]).map((f) => ({
    key: f,
    label: FIELD_LABELS[f],
    oldDisplay: formatCOP(settings[f]),
    newDisplay: formatCOP(draft[f]),
  }));

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
      setConfirming(false);
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
            <p className="chartCardSubtitle">Lo que paga cada servidor por prenda. Se usan en las órdenes nuevas y en las que se editen.</p>
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
            <button type="button" className="toolbarButton primary" onClick={() => setConfirming(true)} disabled={!hasChanges || isSaving}>
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        )}

      {confirming && (
        <ConfirmSettingsModal
          changes={changes}
          isSaving={isSaving}
          onCancel={() => setConfirming(false)}
          onConfirm={handleSave}
          message="Los precios nuevos se verán en el perfil y se usarán en las órdenes que se creen o editen desde ahora."
        />
      )}
    </div>
  );
};

export default MerchSettingsForm;
