export const USER_ROLES = [
  "SUPERADMIN",
  "ADMIN",
  "CM",
  "LIDER",
  "COORDINADOR",
  "SERVIDOR",
  "SOLDADO",
] as const;

export type YesNo = "SI" | "NO";
export type DocumentType = "TI" | "CC" | "PAS" | "OTRO";

export type ShirtSize = "S" | "M" | "L" | "OTRO";
export type ShirtColor = "BLANCA" | "VERDE" | "AZUL";

export type MerchItem =
  | "BUSO_CERRADO"
  | "CHAQUETA_ABIERTA"
  | "TULA"
  | "GORRA"
  | "CANGURO"
  | "NINGUNA";

export type Service =
  | "COMEDOR"
  | "LIDER_DE_MESA"
  | "PALANCAS"
  | "LOGISTICA"
  | "SANTISIMO"
  | "SONIDO_PALETERO_CAMPANERO"
  | "COORDINADOR"
  | "LIDER_DE_RETIRO"
  | "NINGUNO";

export type RegistrationServidoresDTO = {

  email: string;
  firstNames: string;
  lastNames: string;
  preferredName: string;
  referralNamePhone: string;

  documentType: DocumentType;
  documentTypeOther: string;
  documentNumber: string;

  city: string;
  address: string;
  birthDate: string; // yyyy-mm-dd
  age: number;
  phone: string;

  eps: string;
  bloodType: string;

  // Camiseta (multiselección)
  needsShirt: YesNo;
  shirtColors: ShirtColor[];
  shirtSize: ShirtSize;
  shirtSizeOther: string;

  // Merch
  merchItems: MerchItem[];
  merchSize: ShirtSize;
  merchSizeOther: string;

  // Emergencia
  emergencyFirstName: string;
  emergencyLastName: string;
  emergencyDocumentType: DocumentType;
  emergencyDocumentTypeOther: string;
  emergencyDocumentNumber: string;
  emergencyPhone: string;
  emergencyRelation: string;
  emergencyEmail: string;
  emergencyAddress: string;

  // Servicio
  services: Service[];
  lastService: Service;
  serviceLeaderOf: string;

  // Historial
  wentToOtherSedes: YesNo;
  otherSedesDetail: string;

  formationOther: string;

  acceptTerms: boolean;
  acceptDataPolicy: boolean;

  password: string;
};