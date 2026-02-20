import type { RegistrationServidorPayload, ShirtSize } from "./types";



export function buildServidorPayload(input: {
  email: string;

  fullName: string;
  preferredName: string;
  referralNamePhone: string;

  documentType: RegistrationServidorPayload["documentType"];
  documentTypeOther: string;
  documentNumber: string;

  city: string;
  birthDate: string;
  age: string;

  phone: string;

  eps: string;
  bloodType: string;

  needsShirt: RegistrationServidorPayload["needsShirt"];
  shirtColor: RegistrationServidorPayload["shirtColor"];
  shirtSize: RegistrationServidorPayload["shirtSize"];
  shirtSizeOther: string;

  merchItems: RegistrationServidorPayload["merchItems"];
  merchSize: ShirtSize;
  merchSizeOther: string;

  emergency1Name: string;
  emergency1Phone: string;
  emergency1Relation: string;

  emergency2Name: string;
  emergency2Phone: string;
  emergency2Relation: string;

  services: RegistrationServidorPayload["services"];
  lastService: RegistrationServidorPayload["lastService"];
  serviceLeaderOf: string;

  wentToOtherSedes: RegistrationServidorPayload["wentToOtherSedes"];
  otherSedesDetail: string;

  formationOther: string;

  acceptTerms: RegistrationServidorPayload["acceptTerms"];
  acceptDataPolicy: RegistrationServidorPayload["acceptDataPolicy"];

  password: string;
}): RegistrationServidorPayload {
  return {
    ...input,
    email: input.email.trim(),
    fullName: input.fullName.trim(),
    preferredName: input.preferredName.trim(),
    referralNamePhone: input.referralNamePhone.trim(),
    documentTypeOther: input.documentTypeOther.trim(),
    documentNumber: input.documentNumber.trim(),
    city: input.city.trim(),
    birthDate: input.birthDate.trim(),
    age: Number(input.age),
    phone: input.phone.trim(),
    eps: input.eps.trim(),
    bloodType: input.bloodType.trim(),
    shirtSizeOther: input.shirtSizeOther.trim(),
    merchSizeOther: input.merchSizeOther.trim(),
    emergency1Name: input.emergency1Name.trim(),
    emergency1Phone: input.emergency1Phone.trim(),
    emergency1Relation: input.emergency1Relation.trim(),
    emergency2Name: input.emergency2Name.trim(),
    emergency2Phone: input.emergency2Phone.trim(),
    emergency2Relation: input.emergency2Relation.trim(),
    serviceLeaderOf: input.serviceLeaderOf.trim(),
    otherSedesDetail: input.otherSedesDetail.trim(),
    formationOther: input.formationOther.trim(),
    password: input.password,
  };
}