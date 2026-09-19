import { useState } from "react";
import EditableProfileField from "./EditableProfileField";
import PillMultiSelectField from "./PillMultiSelectField";
import PendingChangesModal from "../../Dashboard/ui/PendingChangesModal";
import type { PendingChange } from "../../Dashboard/ui/PendingChangesModal";

const GENDERS = ["Mujer", "Hombre", "Otro"];
const DOCUMENT_TYPES = ["TARJETA_IDENTIDAD", "CEDULA_CIUDADANIA", "PASAPORTE", "OTRO"];
const YES_NO = ["SI", "NO"];
const SHIRT_SIZES = ["", "S", "M", "L", "OTRO"];
const OCCUPATIONS = [
  "ESTUDIANTE_COLEGIO",
  "ESTUDIANTE_EDUCACION_SUPERIOR",
  "TRABAJADOR",
  "SIN_OCUPACION",
  "OTRO",
];
const HEAR_ABOUT = ["CONOZCO_A_ALGUIEN", "REDES_SOCIALES", "QR", "OTRO"];
const SACRAMENTS = ["NINGUNO", "BAUTISMO", "PRIMERA_COMUNION", "CONFIRMACION", "MATRIMONIO", "ORDENACION"];
const RESTRICTIONS = [
  "PROBLEMAS_DORMIR_SOLO",
  "ALERGIAS",
  "TOMA_MEDICAMENTOS",
  "RESTRICCION_ALIMENTICIA",
  "NINGUNA",
  "OTRO",
];

type PendingEdit = { field: string; label: string; oldValue: string; newValue: string };

type Props = {
  data: Record<string, unknown>;
  rowLabel: string;
  canEditEmail: boolean;
  save: (field: string, value: string) => Promise<void>;
  onSaved: () => void;
};

const SoldadoProfileForm: React.FC<Props> = ({ data, rowLabel, canEditEmail, save, onSaved }) => {
  const [pendingEdits, setPendingEdits] = useState<Record<string, PendingEdit>>({});
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);

  const fieldValue = (field: string): string => {
    if (pendingEdits[field]) return pendingEdits[field].newValue;
    const raw = data[field];
    return raw != null ? String(raw) : "";
  };

  const arrayValue = (field: string): string[] => {
    const raw = data[field];
    return Array.isArray(raw) ? (raw as string[]) : [];
  };

  const handleCommitEdit = (field: string, label: string, newValue: string) => {
    const rawOld = data[field];
    const oldValue = rawOld != null ? String(rawOld) : "";

    setPendingEdits((prev) => {
      if (newValue === oldValue) {
        const rest = { ...prev };
        delete rest[field];
        return rest;
      }
      return { ...prev, [field]: { field, label, oldValue, newValue } };
    });
  };

  const pendingList = Object.values(pendingEdits);

  const confirmSaveAll = async () => {
    setIsSavingAll(true);
    try {
      for (const edit of pendingList) {
        await save(edit.field, edit.newValue);
      }
      setPendingEdits({});
      setShowConfirmSave(false);
      onSaved();
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Error al guardar los cambios");
    } finally {
      setIsSavingAll(false);
    }
  };

  const changesForModal: PendingChange[] = pendingList.map((e) => ({
    key: e.field,
    rowLabel,
    fieldLabel: e.label,
    oldDisplay: e.oldValue,
    newDisplay: e.newValue,
  }));

  const editableField = (
    field: string,
    label: string,
    opts?: { fieldType?: "text" | "select" | "date"; options?: string[]; canEdit?: boolean }
  ) => (
    <EditableProfileField
      key={field}
      label={label}
      value={fieldValue(field)}
      fieldType={opts?.fieldType}
      options={opts?.options}
      isDirty={Boolean(pendingEdits[field])}
      canEdit={opts?.canEdit ?? true}
      onCommit={(value) => handleCommitEdit(field, label, value)}
    />
  );

  return (
    <>
      <div className="profileSection">
        <h3>Datos personales</h3>
        {editableField("firstNames", "Nombres")}
        {editableField("lastNames", "Apellidos")}
        {editableField("preferredName", "Cómo le dicen")}
        {editableField("gender", "Género", { fieldType: "select", options: GENDERS })}
        {editableField("email", "Correo", { canEdit: canEditEmail })}
        {editableField("documentType", "Tipo de documento", { fieldType: "select", options: DOCUMENT_TYPES })}
        {editableField("documentNumber", "Número de documento")}
        {editableField("birthDate", "Fecha de nacimiento", { fieldType: "date" })}
        {editableField("age", "Edad")}
        {editableField("city", "Ciudad")}
        {editableField("neighborhood", "Barrio")}
        {editableField("address", "Dirección")}
        {editableField("phone", "Celular")}
      </div>

      <div className="profileSection">
        <h3>Salud</h3>
        {editableField("eps", "EPS")}
        {editableField("bloodType", "Tipo de sangre")}
        <PillMultiSelectField
          label="Restricciones"
          value={arrayValue("restrictions")}
          options={RESTRICTIONS}
          isDirty={false}
          canEdit={false}
          onCommit={() => undefined}
        />
        {editableField("restrictionsOther", "Otra restricción", { canEdit: false })}
        {editableField("medicationsDetail", "Medicamentos", { canEdit: false })}
      </div>

      <div className="profileSection">
        <h3>Fe y ocupación</h3>
        {editableField("practicesReligion", "¿Practica alguna religión?", { fieldType: "select", options: YES_NO })}
        {editableField("whichReligion", "¿Cuál?")}
        <PillMultiSelectField
          label="Sacramentos"
          value={arrayValue("sacraments")}
          options={SACRAMENTS}
          isDirty={false}
          canEdit={false}
          onCommit={() => undefined}
        />
        {editableField("occupation", "Ocupación", { fieldType: "select", options: OCCUPATIONS })}
        {editableField("occupationOther", "Otra ocupación")}
        {editableField("occupationPlace", "Lugar de ocupación")}
      </div>

      <div className="profileSection">
        <h3>Camiseta y otros</h3>
        {editableField("shirtSize", "Talla camiseta", { fieldType: "select", options: SHIRT_SIZES })}
        {editableField("shirtSizeOther", "Talla (otra)")}
        {editableField("isSurprise", "¿Es sorpresa?", { fieldType: "select", options: YES_NO })}
        {editableField("hearAbout", "¿Cómo se enteró?", { fieldType: "select", options: HEAR_ABOUT })}
        {editableField("hearAboutOther", "Otro medio")}
        {editableField("invitedByCommunity", "¿Invitado por la comunidad?", { fieldType: "select", options: YES_NO })}
        {editableField("invitedByName", "Invitado por")}
      </div>

      <div className="profileSection">
        <h3>Contacto de emergencia</h3>
        {editableField("emergencyFirstName", "Nombres")}
        {editableField("emergencyLastName", "Apellidos")}
        {editableField("emergencyDocumentType", "Tipo de documento", { fieldType: "select", options: DOCUMENT_TYPES })}
        {editableField("emergencyDocumentNumber", "Número de documento")}
        {editableField("emergencyPhone", "Celular")}
        {editableField("emergencyRelation", "Relación")}
        {editableField("emergencyEmail", "Correo")}
        {editableField("emergencyAddress", "Dirección")}
      </div>

      {pendingList.length > 0 && (
        <div className="pendingBar profilePendingBar">
          <span>{pendingList.length} cambio(s) sin guardar</span>
          <div className="pendingBarActions">
            <button type="button" className="btnGhost" onClick={() => setPendingEdits({})}>
              Cancelar
            </button>
            <button type="button" className="btnPrimary" onClick={() => setShowConfirmSave(true)}>
              Guardar cambios
            </button>
          </div>
        </div>
      )}

      {showConfirmSave && (
        <PendingChangesModal
          changes={changesForModal}
          isSaving={isSavingAll}
          onCancel={() => setShowConfirmSave(false)}
          onConfirm={confirmSaveAll}
        />
      )}
    </>
  );
};

export default SoldadoProfileForm;
