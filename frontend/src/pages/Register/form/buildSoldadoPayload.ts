import type {
  RegisterSoldadoPayload,
  YesNo,
  Gender,
  DocumentType,
  Occupation,
  ShirtSize,
  HearAbout,
  Sacrament,
  Restriction,
} from "../form/types"

type BuildArgs = {
  gender: Gender;

  email: string;
  firstNames: string;
  lastNames: string;
  preferredName: string;

  documentType: DocumentType;
  documentTypeOther: string;
  documentNumber: string;

  age: string; // input string
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

export const buildSoldadoPayload = (a: BuildArgs): RegisterSoldadoPayload => {
  const ageNumber = Number(a.age);

  return {
    gender: a.gender,

    email: a.email.trim(),
    firstNames: a.firstNames.trim(),
    lastNames: a.lastNames.trim(),
    preferredName: a.preferredName.trim(),

    documentType: a.documentType,
    documentTypeOther: a.documentType === "OTRO" ? a.documentTypeOther.trim() : "",
    documentNumber: a.documentNumber.trim(),

    age: Number.isFinite(ageNumber) ? ageNumber : 0,
    birthDate: a.birthDate,

    address: a.address.trim(),
    city: a.city.trim(),
    neighborhood: a.neighborhood.trim(),

    phone: a.phone.trim(),

    eps: a.eps.trim(),
    bloodType: a.bloodType.trim(),

    practicesReligion: a.practicesReligion,
    whichReligion: a.practicesReligion === "SI" ? a.whichReligion.trim() : "",

    occupation: a.occupation,
    occupationOther: a.occupation === "OTRO" ? a.occupationOther.trim() : "",
    occupationPlace: a.occupationPlace.trim(),

    sacraments: a.sacraments,

    restrictions: a.restrictions,
    restrictionsOther: a.restrictions.includes("OTRO") ? a.restrictionsOther.trim() : "",
    medicationsDetail: a.restrictions.includes("TOMA_MEDICAMENTOS") ? a.medicationsDetail.trim() : "",

    shirtSize: a.shirtSize,
    shirtSizeOther: a.shirtSize === "OTRO" ? a.shirtSizeOther.trim() : "",

    isSurprise: a.isSurprise,

    emergencyName: a.emergencyName.trim(),
    emergencyPhone: a.emergencyPhone.trim(),
    emergencyRelation: a.emergencyRelation.trim(),
    emergencyEmail: a.emergencyEmail.trim(),

    hearAbout: a.hearAbout,
    hearAboutOther: a.hearAbout === "OTRO" ? a.hearAboutOther.trim() : "",

    invitedByCommunity: a.invitedByCommunity,
    invitedByName: a.invitedByCommunity === "SI" ? a.invitedByName.trim() : "",

    acceptTerms: a.acceptTerms,
    acceptDataPolicy: a.acceptDataPolicy,
  };
};