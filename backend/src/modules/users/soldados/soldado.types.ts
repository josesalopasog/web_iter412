export { USER_ROLES, type UserRole } from "../roles.js";

export type YesNo = "SI" | "NO";

export type Gender = "Mujer" | "Hombre" | "Otro";

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
  gender: Gender;
  genderOther: string;
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

  emergencyFirstName: string;
  emergencyLastName: string;
  emergencyDocumentType: DocumentType;
  emergencyDocumentTypeOther: string;
  emergencyDocumentNumber: string;
  emergencyPhone: string;
  emergencyRelation: string;
  emergencyEmail: string;
  emergencyAddress: string;

  hearAbout: HearAbout;
  hearAboutOther: string;

  invitedByCommunity: YesNo;
  invitedByName: string;

  acceptTerms: boolean;
  acceptDataPolicy: boolean;
}