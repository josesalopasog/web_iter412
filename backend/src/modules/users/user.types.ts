export const USER_ROLES = [
  "SUPERADMIN",
  "ADMIN",
  "CM",
  "LIDER",
  "COORDINADOR",
  "SERVIDOR",
  "SOLDADO",
] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type YesNo = "SI" | "NO";
export type DocumentType = "TI" | "CC" | "PAS" | "OTRO";

export type Occupation =
  | "ESTUDIANTE-COLEGIO"
  | "ESTUDIANTE-SUPERIOR"
  | "TRABAJADOR"
  | "SIN OCUPACION"
  | "OTRO";

export type ShirtSize = "S" | "M" | "L" | "OTRO";
export type HearAbout = "CONOZCO_ALGUIEN" | "REDES" | "QR" | "OTRO";

export type Restriction =
  | "PROBLEMAS_DORMIR_SOLO"
  | "ALERGIAS"
  | "TOMA_MEDICAMENTOS"
  | "RESTRICCION_ALIMENTICIA"
  | "NINGUNA"
  | "OTRO";

export type Sacrament =
  | "NINGUNO"
  | "BAUTISMO"
  | "PRIMERA_COMUNION"
  | "CONFIRMACION"
  | "MATRIMONIO"
  | "ORDENACION";

export type RegistrationSoldadosDTO = {

  // Data for the form 
  email: string;
  firstNames: string;
  lastNames: string;
  preferredName: string;

  documentType: DocumentType;
  documentTypeOther: string;
  documentNumber: string;

  age: number;
  birthDate: string;

  address: string;
  city: string;
  neighborhood: string;

  phone: string;

  eps: string;
  bloodType: string;

  practicesReligion: YesNo;
  whichReligion: string;

  occupation: Occupation;
  occupationOther: string;
  occupationPlace: string;

  sacraments: Sacrament[];

  restrictions: Restriction[];
  restrictionsOther: string;
  medicationsDetail: string;

  shirtSize: ShirtSize;
  shirtSizeOther: string;

  isSurprise: YesNo;

  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
  emergencyEmail: string;

  hearAbout: HearAbout;
  hearAboutOther: string;

  invitedByCommunity: YesNo;
  invitedByName: string;

  acceptTerms: boolean;
  acceptDataPolicy: boolean;
}