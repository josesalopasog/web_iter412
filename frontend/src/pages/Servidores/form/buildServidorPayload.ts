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
  address: string;
  birthDate: string;
  age: string; 
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
    address: a.address.trim(),
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

    emergencyFirstName: a.emergencyFirstName.trim(),
    emergencyLastName: a.emergencyLastName.trim(),
    emergencyDocumentType: a.emergencyDocumentType,
    emergencyDocumentTypeOther: a.emergencyDocumentType === "OTRO" ? a.emergencyDocumentTypeOther.trim() : "",
    emergencyDocumentNumber: a.emergencyDocumentNumber.trim(),
    emergencyPhone: a.emergencyPhone.trim(),
    emergencyRelation: a.emergencyRelation.trim(),
    emergencyEmail: a.emergencyEmail.trim(),
    emergencyAddress: a.emergencyAddress.trim(),

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