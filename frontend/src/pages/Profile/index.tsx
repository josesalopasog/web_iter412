import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { getMyServidorProfile, updateMyServidorField } from "../../api/adminUsers";
import { LogoutIcon } from "../../assets/icons";
import EditableProfileField from "./ui/EditableProfileField";
import PillMultiSelectField from "./ui/PillMultiSelectField";
import PendingChangesModal from "../Dashboard/ui/PendingChangesModal";
import type { PendingChange } from "../Dashboard/ui/PendingChangesModal";
import ConfirmLogoutModal from "../../components/ConfirmLogoutModal";
import { formatEnumLabel } from "./ui/format";
import "./styles.css";

const DOCUMENT_TYPES = ["TI", "CC", "PAS", "OTRO"];
const YES_NO = ["SI", "NO"];
const SHIRT_SIZES = ["", "S", "M", "L", "OTRO"];
const SHIRT_COLORS = ["BLANCA", "VERDE", "AZUL"];
const MERCH_ITEMS = ["BUSO_CERRADO", "CHAQUETA_ABIERTA", "TULA", "GORRA", "CANGURO", "NINGUNA"];
const SERVICES = [
  "COMEDOR",
  "LIDER_DE_MESA",
  "PALANCAS",
  "LOGISTICA",
  "SANTISIMO",
  "SONIDO_PALETERO_CAMPANERO",
  "COORDINADOR",
  "LIDER_DE_RETIRO",
  "NINGUNO",
];

type PendingEdit = {
  field: string;
  label: string;
  oldValue: string | string[];
  newValue: string | string[];
};

const arraysEqualAsSets = (a: string[], b: string[]) =>
  a.length === b.length && a.every((v) => b.includes(v));

const toDisplay = (v: string | string[]) =>
  Array.isArray(v) ? v.map(formatEnumLabel).join(", ") : v;

const Profile = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";
  const isSuperadmin = user?.role === "SUPERADMIN";

  const [data, setData] = useState<Record<string, any> | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingEdits, setPendingEdits] = useState<Record<string, PendingEdit>>({});
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const loadProfile = () => {
    if (!token) return;
    getMyServidorProfile(token)
      .then(setData)
      .catch((error: unknown) =>
        setErrorMsg(error instanceof Error ? error.message : "Error cargando tu perfil")
      );
  };

  useEffect(loadProfile, [token]);

  const fieldValue = (field: string): string => {
    if (pendingEdits[field]) return toDisplay(pendingEdits[field].newValue);
    const raw = data?.[field];
    return raw != null ? String(raw) : "";
  };

  const arrayFieldValue = (field: string): string[] => {
    const pending = pendingEdits[field];
    if (pending) return pending.newValue as string[];
    const raw = data?.[field];
    return Array.isArray(raw) ? (raw as string[]) : [];
  };

  const handleCommitEdit = (field: string, label: string, newValue: string | string[]) => {
    const rawOld = data?.[field];
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
        const { [field]: _removed, ...rest } = prev;
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
        await updateMyServidorField(token!, edit.field, edit.newValue);
      }
      setPendingEdits({});
      setShowConfirmSave(false);
      loadProfile();
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Error al guardar los cambios");
    } finally {
      setIsSavingAll(false);
    }
  };

  const changesForModal: PendingChange[] = pendingList.map((e) => ({
    key: e.field,
    rowLabel: "Mi perfil",
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
    <div className="profilePage">
      <header className="profileHeader">
        <div className="profileHeaderLeft">
          <img src="/logo.png" alt="ITER 4.12" className="profileLogo" />
          <h1>Mi perfil</h1>
        </div>
        <div className="profileHeaderRight">
          {isAdmin && (
            <button
              className="btnGhost profileDashboardBtn profileDashboardBtnDanger"
              type="button"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </button>
          )}
          <button
            className="iconBtn"
            type="button"
            title="Cerrar sesión"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <LogoutIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="profileBody">
        <div className="profileBadgeRow">
          <div className="profileBadge">
            {user?.firstNames} {user?.lastNames} · {user?.role}
          </div>
          <button
            className="btnGhost profileDashboardBtn"
            type="button"
            onClick={() => navigate("/password")}
          >
            Cambiar contraseña
          </button>
        </div>

        {errorMsg && <p className="loginError">{errorMsg}</p>}

        {!data && !errorMsg && <p className="emptyState">Cargando...</p>}

        {data && (
          <>
            <div className="profileSection">
              <h3>Datos personales</h3>
              {editableField("firstNames", "Nombres")}
              {editableField("lastNames", "Apellidos")}
              {editableField("preferredName", "Cómo le dicen")}
              {editableField("email", "Correo", { canEdit: isSuperadmin })}
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
          </>
        )}
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

      {showLogoutConfirm && (
        <ConfirmLogoutModal onCancel={() => setShowLogoutConfirm(false)} onConfirm={logout} />
      )}
    </div>
  );
};

export default Profile;
