export type ColumnType = "text" | "select" | "readonly";
export type SortType = "text" | "numeric" | "date";

export type ColumnDef = {
  id: string;
  label: string;
  type: ColumnType;
  options?: string[];
  editable: boolean;
  /** Editing this field requires this role (column stays visible to everyone). */
  restrictedTo?: "SUPERADMIN";
  /** Column is hidden entirely unless the viewer has this role. */
  hiddenUnless?: "SUPERADMIN";
  /** Defaults to "text" when omitted. Set false to disable sorting entirely (e.g. password). */
  sortType?: SortType;
  sortable?: boolean;
  /** Renders a checkbox filter dropdown (using `options`) instead of a sort menu. */
  filterable?: boolean;
};

export const SOLDADO_COLUMNS: ColumnDef[] = [
  { id: "firstNames", label: "Nombres", type: "text", editable: true },
  { id: "lastNames", label: "Apellidos", type: "text", editable: true },
  { id: "preferredName", label: "Le dicen", type: "text", editable: true },
  {
    id: "gender",
    label: "Género",
    type: "select",
    options: ["Mujer", "Hombre", "Otro"],
    editable: true,
    filterable: true,
  },
  { id: "email", label: "Correo", type: "text", editable: true, restrictedTo: "SUPERADMIN" },
  { id: "documentNumber", label: "Documento", type: "text", editable: true },
  { id: "age", label: "Edad", type: "text", editable: true, sortType: "numeric" },
  { id: "birthDate", label: "Nacimiento", type: "text", editable: true, sortType: "date" },
  { id: "phone", label: "Teléfono", type: "text", editable: true },
  { id: "city", label: "Ciudad", type: "text", editable: true },
  { id: "neighborhood", label: "Barrio", type: "text", editable: true },
  { id: "address", label: "Dirección", type: "text", editable: true },
  { id: "eps", label: "EPS", type: "text", editable: true },
  { id: "bloodType", label: "Sangre", type: "text", editable: true },
  { id: "occupationPlace", label: "Ocupación en", type: "text", editable: true },
  {
    id: "shirtSize",
    label: "Talla",
    type: "select",
    options: ["S", "M", "L", "OTRO"],
    editable: true,
  },
  { id: "practicesReligion", label: "Practica religión", type: "select", options: ["SI", "NO"], editable: true },
  { id: "isSurprise", label: "Sorpresa", type: "select", options: ["SI", "NO"], editable: true },
  { id: "emergencyFirstName", label: "Emerg. nombres", type: "text", editable: true },
  { id: "emergencyLastName", label: "Emerg. apellidos", type: "text", editable: true },
  { id: "emergencyPhone", label: "Emerg. teléfono", type: "text", editable: true },
  { id: "emergencyRelation", label: "Emerg. relación", type: "text", editable: true },
  { id: "emergencyEmail", label: "Emerg. correo", type: "text", editable: true },
  { id: "emergencyAddress", label: "Emerg. dirección", type: "text", editable: true },
  { id: "createdAt", label: "Fecha registro", type: "readonly", editable: false, sortType: "date" },
];

export const SOLDADO_DEFAULT_VISIBLE = [
  "firstNames",
  "lastNames",
  "documentNumber",
  "gender",
  "city",
  "phone",
  "createdAt",
];

export const SERVIDOR_COLUMNS: ColumnDef[] = [
  { id: "firstNames", label: "Nombres", type: "text", editable: true },
  { id: "lastNames", label: "Apellidos", type: "text", editable: true },
  { id: "preferredName", label: "Le dicen", type: "text", editable: true },
  {
    id: "gender",
    label: "Género",
    type: "select",
    options: ["Mujer", "Hombre"],
    editable: true,
    filterable: true,
  },
  { id: "email", label: "Correo", type: "text", editable: true, restrictedTo: "SUPERADMIN" },
  {
    id: "password",
    label: "Contraseña",
    type: "text",
    editable: true,
    restrictedTo: "SUPERADMIN",
    hiddenUnless: "SUPERADMIN",
    sortable: false,
  },
  { id: "documentNumber", label: "Documento", type: "text", editable: true },
  { id: "age", label: "Edad", type: "text", editable: true, sortType: "numeric" },
  { id: "birthDate", label: "Nacimiento", type: "text", editable: true, sortType: "date" },
  { id: "phone", label: "Teléfono", type: "text", editable: true },
  { id: "city", label: "Ciudad", type: "text", editable: true },
  { id: "address", label: "Dirección", type: "text", editable: true },
  { id: "eps", label: "EPS", type: "text", editable: true },
  { id: "bloodType", label: "Sangre", type: "text", editable: true },
  { id: "referralNamePhone", label: "Referido por", type: "text", editable: true },
  { id: "emergencyFirstName", label: "Emerg. nombres", type: "text", editable: true },
  { id: "emergencyLastName", label: "Emerg. apellidos", type: "text", editable: true },
  { id: "emergencyPhone", label: "Emerg. teléfono", type: "text", editable: true },
  { id: "emergencyRelation", label: "Emerg. relación", type: "text", editable: true },
  { id: "emergencyEmail", label: "Emerg. correo", type: "text", editable: true },
  { id: "emergencyAddress", label: "Emerg. dirección", type: "text", editable: true },
  { id: "serviceLeaderOf", label: "Líder de", type: "text", editable: true },
  { id: "createdAt", label: "Fecha registro", type: "readonly", editable: false, sortType: "date" },
];

export const SERVIDOR_DEFAULT_VISIBLE = [
  "firstNames",
  "lastNames",
  "documentNumber",
  "gender",
  "email",
  "city",
  "phone",
  "createdAt",
];
