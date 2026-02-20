import type { RegistrationServidoresDTO } from "./types";
import type { DocumentType, MerchItem, Service, ShirtColor, ShirtSize, YesNo } from "./types";

type BuildArgs = {
  email: string;
  firstNames: string;
  lastNames: string;
  preferredName: string;
  referralNamePhone: string;

  documentType: DocumentType;
  documentTypeOther: string;
  documentNumber: string;

  city: string;
  birthDate: string;
  age: string; // viene del input
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

  emergency1Name: string;
  emergency1Phone: string;
  emergency1Relation: string;

  emergency2Name: string;
  emergency2Phone: string;
  emergency2Relation: string;

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

export const buildServidorPayload = (a: BuildArgs): RegistrationServidoresDTO => {
  return {
    email: a.email.trim().toLowerCase(),
    firstNames: a.firstNames.trim(),
    lastNames: a.lastNames.trim(),
    preferredName: a.preferredName.trim(),
    referralNamePhone: a.referralNamePhone.trim(),

    documentType: a.documentType,
    documentTypeOther: a.documentType === "OTRO" ? a.documentTypeOther.trim() : "",
    documentNumber: a.documentNumber.trim(),

    city: a.city.trim(),
    birthDate: a.birthDate,
    age: Number(a.age),
    phone: a.phone.trim(),

    eps: a.eps.trim(),
    bloodType: a.bloodType.trim(),

    needsShirt: a.needsShirt,
    shirtColors: a.needsShirt === "SI" ? a.shirtColors : [],
    shirtSize: a.needsShirt === "SI" ? a.shirtSize : "S",
    shirtSizeOther: a.needsShirt === "SI" && a.shirtSize === "OTRO" ? a.shirtSizeOther.trim() : "",

    merchItems: a.merchItems,
    merchSize: a.merchSize,
    merchSizeOther: a.merchSize === "OTRO" ? a.merchSizeOther.trim() : "",

    emergency1Name: a.emergency1Name.trim(),
    emergency1Phone: a.emergency1Phone.trim(),
    emergency1Relation: a.emergency1Relation.trim(),

    emergency2Name: a.emergency2Name.trim(),
    emergency2Phone: a.emergency2Phone.trim(),
    emergency2Relation: a.emergency2Relation.trim(),

    services: a.services,
    lastService: a.lastService,
    serviceLeaderOf: a.serviceLeaderOf.trim(),

    wentToOtherSedes: a.wentToOtherSedes,
    otherSedesDetail: a.wentToOtherSedes === "SI" ? a.otherSedesDetail.trim() : "",

    formationOther: a.formationOther.trim(),

    acceptTerms: Boolean(a.acceptTerms),
    acceptDataPolicy: Boolean(a.acceptDataPolicy),

    password: a.password,
  };
};