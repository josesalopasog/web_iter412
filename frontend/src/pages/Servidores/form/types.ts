export type YesNo = "SI" | "NO";
export type Gender = "" | "Mujer" | "Hombre";
export type DocumentType = "TI" | "CC" | "PAS" | "OTRO";
export type ShirtSize = "" | "S" | "M" | "L" | "OTRO";
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
  gender: Gender;
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

  needsShirt: YesNo;
  shirtColors: ShirtColor[]; 
  shirtSize: ShirtSize;
  shirtSizeOther: string;

  merchItems: MerchItem[];
  merchSize: ShirtSize;
  merchSizeOther: string;

  emergencyFirstName: string;
  emergencyLastName: string;
  emergencyDocumentType: DocumentType;
  emergencyDocumentTypeOther: string;
  emergencyDocumentNumber: string;
  emergencyPhone: string;
  emergencyRelation: string;
  emergencyEmail: string;
  emergencyAddress: string;

  services: Service[];
  lastService: Service;
  serviceLeaderOf: string;

  wentToOtherSedes: YesNo;
  otherSedesDetail: string;

  formationOther: string;

  acceptTerms: boolean;
  acceptDataPolicy: boolean;

  password: string;
};