import { useState } from "react";
import EditableProfileField from "./EditableProfileField";
import PillMultiSelectField from "./PillMultiSelectField";
import PendingChangesModal from "../../Dashboard/ui/PendingChangesModal";
import type { PendingChange } from "../../Dashboard/ui/PendingChangesModal";
import { formatEnumLabel } from "./format";
import { SERVICES } from "./options";

const DOCUMENT_TYPES = ["TI", "CC", "PAS", "OTRO"];
const YES_NO = ["SI", "NO"];
const SHIRT_SIZES = ["", "S", "M", "L", "OTRO"];
const SHIRT_COLORS = ["BLANCA", "VERDE", "AZUL"];
const MERCH_ITEMS = ["BUSO_CERRADO", "CHAQUETA_ABIERTA", "TULA", "GORRA", "CANGURO", "NINGUNA"];
type PendingEdit = {
  field: string;
  label: string;
  oldValue: string | string[];
  newValue: string | string[];
};

type Props = {
  data: Record<string, unknown>;
  rowLabel: string;
  canEditEmail: boolean;
  save: (field: string, value: string | string[]) => Promise<void>;
  onSaved: () => void;
};

const arraysEqualAsSets = (a: string[], b: string[]) =>
  a.length === b.length && a.every((v) => b.includes(v));

const toDisplay = (v: string | string[]) =>
  Array.isArray(v) ? v.map(formatEnumLabel).join(", ") : v;

const ServidorProfileForm: React.FC<Props> = ({ data, rowLabel, canEditEmail, save, onSaved }) => {
  const [pendingEdits, setPendingEdits] = useState<Record<string, PendingEdit>>({});
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);

  const fieldValue = (field: string): string => {
    if (pendingEdits[field]) return toDisplay(pendingEdits[field].newValue);
    const raw = data[field];
    return raw != null ? String(raw) : "";
  };

  const arrayFieldValue = (field: string): string[] => {
    const pending = pendingEdits[field];
    if (pending) return pending.newValue as string[];
    const raw = data[field];
    return Array.isArray(raw) ? (raw as string[]) : [];
  };

  const handleCommitEdit = (field: string, label: string, newValue: string | string[]) => {
    const rawOld = data[field];
    const oldValue: string | string[] = Array.isArray(newValue)
      ? Array.isArray(rawOld)
        ? (rawOld as string[])
        : []
      : rawOld != null
        ? String(rawOld)
        : "";

    setPendingEdits((prev) => {
      const isUnchanged = Array.isArray(newValue)
        ? arraysEqualAsSets(newValue, oldValue as string[])
        : newValue === oldValue;

      if (isUnchanged) {
        const rest = { ...prev };
        delete rest[field];
        return rest;
      }
      return { ...prev, [field]: { field, label, oldValue, newValue } };
    });
  };

  const handleNeedsShirtChange = (newValue: string) => {
    handleCommitEdit("needsShirt", "¿Necesita camiseta?", newValue);
    if (newValue === "NO") {
      handleCommitEdit("shirtColors", "Colores", []);
      handleCommitEdit("shirtSize", "Talla camiseta", "");
    }
  };

  const handleMerchItemsChange = (newValues: string[]) => {
    const old = arrayFieldValue("merchItems");
    const added = newValues.filter((v) => !old.includes(v));
    let final = newValues;
    if (added.includes("NINGUNA")) {
      final = ["NINGUNA"];
    } else if (newValues.includes("NINGUNA") && added.length > 0) {
      final = newValues.filter((v) => v !== "NINGUNA");
    }
    handleCommitEdit("merchItems", "Prendas/accesorios", final);
    if (final.length === 1 && final[0] === "NINGUNA") {
      handleCommitEdit("merchSize", "Talla prenda/accesorio", "");
    }
  };

  const pendingList = Object.values(pendingEdits);
  const cancelAllPending = () => setPendingEdits({});

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
    oldDisplay: toDisplay(e.oldValue),
    newDisplay: toDisplay(e.newValue),
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
        {editableField("email", "Correo", { canEdit: canEditEmail })}
        {editableField("documentType", "Tipo de documento", {
          fieldType: "select",
          options: DOCUMENT_TYPES,
        })}
        {editableField("documentNumber", "Número de documento")}
        {editableField("birthDate", "Fecha de nacimiento", { fieldType: "date" })}
        {editableField("age", "Edad")}
        {editableField("city", "Ciudad")}
        {editableField("address", "Dirección")}
        {editableField("phone", "Celular")}
      </div>

      <div className="profileSection">
        <h3>Salud</h3>
        {editableField("eps", "EPS")}
        {editableField("bloodType", "Tipo de sangre")}
      </div>

      <div className="profileSection">
        <h3>Camiseta y merch</h3>
        <EditableProfileField
          label="¿Necesita camiseta?"
          value={fieldValue("needsShirt")}
          fieldType="select"
          options={YES_NO}
          isDirty={Boolean(pendingEdits.needsShirt)}
          canEdit
          onCommit={handleNeedsShirtChange}
        />
        <PillMultiSelectField
          label="Colores"
          value={arrayFieldValue("shirtColors")}
          options={SHIRT_COLORS}
          isDirty={Boolean(pendingEdits.shirtColors)}
          canEdit
          onCommit={(values) => handleCommitEdit("shirtColors", "Colores", values)}
        />
        {editableField("shirtSize", "Talla camiseta", {
          fieldType: "select",
          options: SHIRT_SIZES,
        })}
        <PillMultiSelectField
          label="Prendas/accesorios"
          value={arrayFieldValue("merchItems")}
          options={MERCH_ITEMS}
          isDirty={Boolean(pendingEdits.merchItems)}
          canEdit
          onCommit={handleMerchItemsChange}
        />
        {editableField("merchSize", "Talla prenda/accesorio", {
          fieldType: "select",
          options: SHIRT_SIZES,
        })}
      </div>

      <div className="profileSection">
        <h3>Contacto de emergencia</h3>
        {editableField("emergencyFirstName", "Nombres")}
        {editableField("emergencyLastName", "Apellidos")}
        {editableField("emergencyDocumentType", "Tipo de documento", {
          fieldType: "select",
          options: DOCUMENT_TYPES,
        })}
        {editableField("emergencyDocumentNumber", "Número de documento")}
        {editableField("emergencyPhone", "Celular")}
        {editableField("emergencyRelation", "Relación")}
        {editableField("emergencyEmail", "Correo")}
        {editableField("emergencyAddress", "Dirección")}
      </div>

      <div className="profileSection">
        <h3>Servicio</h3>
        <PillMultiSelectField
          label="Servicios"
          value={arrayFieldValue("services")}
          options={SERVICES}
          isDirty={Boolean(pendingEdits.services)}
          canEdit
          onCommit={(values) => handleCommitEdit("services", "Servicios", values)}
        />
        {editableField("lastService", "Último servicio", {
          fieldType: "select",
          options: SERVICES,
        })}
        {editableField("serviceLeaderOf", "Líder de")}
        {editableField("wentToOtherSedes", "¿Ha ido a otras sedes?", {
          fieldType: "select",
          options: YES_NO,
        })}
        {editableField("formationOther", "Otra formación")}
      </div>

      {pendingList.length > 0 && (
        <div className="pendingBar profilePendingBar">
          <span>{pendingList.length} cambio(s) sin guardar</span>
          <div className="pendingBarActions">
            <button type="button" className="btnGhost" onClick={cancelAllPending}>
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

export default ServidorProfileForm;
