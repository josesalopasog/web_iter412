import { useState } from "react";
import type { AppSettings } from "../../../api/settings";
import { updateSettings } from "../../../api/settings";
import { formatCOP, formatNumberCO, parseDigits } from "./paymentConfig";
import { spanishMonthName } from "../../../utils/spanishMonth";
import ConfirmSettingsModal from "./ConfirmSettingsModal";
import type { SettingsChange } from "./ConfirmSettingsModal";

type Props = {
  settings: AppSettings;
  canEdit: boolean;
  totalSubsidyUsed: number;
  onSaved: (updated: AppSettings) => void;
  onClose: () => void;
};

const FIELD_LABELS: Record<keyof AppSettings, string> = {
  soldadoPrice: "Precio retiro soldados",
  servidorPrice: "Precio retiro servidores",
  subsidyCap: "Subsidio total",
  fridayDate: "Fecha viernes",
  saturdayDate: "Fecha sábado",
  sundayDate: "Fecha domingo",
  retreatMonth: "Mes del retiro",
  retreatYear: "Año del retiro",
  advanceStartDay: "Abono desde",
  advanceEndDay: "Abono hasta",
  advanceMonth: "Mes abono",
  finalPaymentStartDay: "Pago desde",
  finalPaymentEndDay: "Pago hasta",
  finalPaymentMonth: "Mes pago",
  shirtPrice: "Precio camiseta",
  busoChaquetaPrice: "Precio chaqueta o buso",
  canguroPrice: "Precio canguro",
  tulaPrice: "Precio tula",
  cachuchaPrice: "Precio cachucha",
  extraSizePrice: "Recargo talla especial",
};

const CURRENCY_FIELDS = new Set<keyof AppSettings>(["soldadoPrice", "servidorPrice", "subsidyCap"]);
const MONTH_FIELDS = new Set<keyof AppSettings>(["retreatMonth", "advanceMonth", "finalPaymentMonth"]);

const formatFieldValue = (field: keyof AppSettings, value: number) => {
  if (CURRENCY_FIELDS.has(field)) return formatCOP(value);
  if (MONTH_FIELDS.has(field)) return spanishMonthName(value);
  return String(value);
};

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);
const clampDay = (n: number) => Math.min(31, Math.max(1, n || 1));
const clampYear = (n: number) => Math.min(2100, Math.max(2000, n || 2000));

type FieldProps = {
  label: string;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
};

const CurrencyField: React.FC<FieldProps> = ({ label, value, disabled, onChange }) => (
  <label className="configField">
    <span>{label}</span>
    <div className="configInputGroup">
      <span className="paymentInputPrefix">$</span>
      <input
        className="configInput"
        type="text"
        inputMode="numeric"
        disabled={disabled}
        value={formatNumberCO(value)}
        onChange={(e) => onChange(parseDigits(e.target.value))}
      />
    </div>
  </label>
);

const DayField: React.FC<FieldProps> = ({ label, value, disabled, onChange }) => (
  <label className="configField">
    <span>{label}</span>
    <input
      className="configInput configInputPlain"
      type="number"
      min={1}
      max={31}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(clampDay(Number(e.target.value)))}
    />
  </label>
);

const MonthField: React.FC<FieldProps> = ({ label, value, disabled, onChange }) => (
  <label className="configField">
    <span>{label}</span>
    <select
      className="configInput configInputPlain"
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {MONTH_OPTIONS.map((m) => (
        <option key={m} value={m}>
          {spanishMonthName(m)}
        </option>
      ))}
    </select>
  </label>
);

const YearField: React.FC<FieldProps> = ({ label, value, disabled, onChange }) => (
  <label className="configField">
    <span>{label}</span>
    <input
      className="configInput configInputPlain"
      type="number"
      min={2000}
      max={2100}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(clampYear(Number(e.target.value)))}
    />
  </label>
);

const ReadOnlyField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="configField">
    <span>{label}</span>
    <div className="configReadOnlyValue" title="Se calcula solo: subsidio total menos lo ya otorgado. No se edita aquí.">
      {value}
    </div>
  </div>
);

const SettingsModal: React.FC<Props> = ({ settings, canEdit, totalSubsidyUsed, onSaved, onClose }) => {
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = (field: keyof AppSettings, value: number) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const changedFields = (Object.keys(FIELD_LABELS) as (keyof AppSettings)[]).filter(
    (field) => draft[field] !== settings[field]
  );

  const changes: SettingsChange[] = changedFields.map((field) => ({
    key: field,
    label: FIELD_LABELS[field],
    oldDisplay: formatFieldValue(field, settings[field]),
    newDisplay: formatFieldValue(field, draft[field]),
  }));

  const confirmSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const payload: Partial<AppSettings> = {};
      for (const field of changedFields) payload[field] = draft[field];
      const updated = await updateSettings(payload);
      onSaved(updated);
      setDraft(updated);
      setShowConfirm(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar la configuración");
    } finally {
      setIsSaving(false);
    }
  };

  const field = (key: keyof AppSettings) => ({
    label: FIELD_LABELS[key],
    value: draft[key],
    disabled: !canEdit,
    onChange: (value: number) => setField(key, value),
  });

  const saldoSubsidios = Math.max(0, draft.subsidyCap - totalSubsidyUsed);

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modalCard settingsModalCard">
        <div className="modalHead">
          <h3>⚙️ Ajustes del retiro</h3>
          <button type="button" className="modalClose" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modalBody">
          <div className="configColumns">
            <div className="configColumn">
              <div className="configColumnTitle">Precios</div>
              <CurrencyField {...field("soldadoPrice")} />
              <CurrencyField {...field("servidorPrice")} />
              <CurrencyField {...field("subsidyCap")} />
              <ReadOnlyField label="Subsidio disponible (auto)" value={formatCOP(saldoSubsidios)} />
            </div>

            <div className="configColumn">
              <div className="configColumnTitle">Fechas del retiro</div>
              <DayField {...field("fridayDate")} />
              <DayField {...field("saturdayDate")} />
              <DayField {...field("sundayDate")} />
              <MonthField {...field("retreatMonth")} />
              <YearField {...field("retreatYear")} />
            </div>

            <div className="configColumn">
              <div className="configColumnTitle">Plazos</div>
              <DayField {...field("advanceStartDay")} />
              <DayField {...field("advanceEndDay")} />
              <MonthField {...field("advanceMonth")} />
              <DayField {...field("finalPaymentStartDay")} />
              <DayField {...field("finalPaymentEndDay")} />
              <MonthField {...field("finalPaymentMonth")} />
            </div>
          </div>

          {!canEdit && (
            <p className="configHint">Solo un SUPERADMIN o TESORERO puede editar estos valores.</p>
          )}
          {error && <p className="configError">{error}</p>}
        </div>

        <div className="modalActions">
          <button type="button" className="btnGhost" onClick={onClose}>
            Cerrar
          </button>
          {canEdit && changedFields.length > 0 && (
            <button type="button" className="btnPrimary" onClick={() => setShowConfirm(true)}>
              Guardar cambios
            </button>
          )}
        </div>
      </div>

      {showConfirm && (
        <ConfirmSettingsModal
          changes={changes}
          isSaving={isSaving}
          onCancel={() => setShowConfirm(false)}
          onConfirm={confirmSave}
        />
      )}
    </div>
  );
};

export default SettingsModal;
