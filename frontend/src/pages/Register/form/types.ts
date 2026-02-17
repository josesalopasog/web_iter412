// ============ Básicos ============
export type YesNo = "" | "SI" | "NO";

export type Gender = "" | "Mujer" | "Hombre";

// ============ Documento ============
export type DocumentType =
  | ""
  | "TARJETA_IDENTIDAD"
  | "CEDULA_CIUDADANIA"
  | "PASAPORTE"
  | "OTRO";

// ============ Ocupación ============
export type Occupation =
  | ""
  | "ESTUDIANTE_COLEGIO"
  | "ESTUDIANTE_EDUCACION_SUPERIOR"
  | "TRABAJADOR"
  | "SIN_OCUPACION"
  | "OTRO";

// ============ Comunidad ============
export type HearAbout = "" | "CONOZCO_A_ALGUIEN" | "REDES_SOCIALES" | "QR" | "OTRO";

// ============ Camiseta ============
export type ShirtSize = "" | "S" | "M" | "L" | "OTRO";

// ============ Restricciones ============
export type Restriction =
  | "PROBLEMAS_DORMIR_SOLO"
  | "ALERGIAS"
  | "TOMA_MEDICAMENTOS"
  | "RESTRICCION_ALIMENTICIA"
  | "NINGUNA"
  | "OTRO";

// ============ Sacramentos (valores backend) ============
export type Sacrament =
  | "NINGUNO"
  | "BAUTISMO"
  | "PRIMERA_COMUNION"
  | "CONFIRMACION"
  | "MATRIMONIO"
  | "ORDENACION";

// ============ Payload final hacia backend (SOLDADO) ============
export type RegisterSoldadoPayload = {
  // antes de comenzar
  gender: Gender;

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
};
