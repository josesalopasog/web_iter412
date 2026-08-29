import { useMemo, useState } from "react";
import { registerServidor } from "../../../api/registerServidor";
import { buildServidorPayload } from "./buildServidorPayload";
import type {
  DocumentType,
  MerchItem,
  Service,
  ShirtColor,
  ShirtSize,
  YesNo,
} from "./types";

export const useRegisterServidorForm = () => {
  // basic
  const [email, setEmail] = useState("");
  const [firstNames, setFirstNames] = useState("");
  const [lastNames, setLastNames] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [referralNamePhone, setReferralNamePhone] = useState("");

  // doc
  const [documentType, setDocumentType] = useState<DocumentType>("CC");
  const [documentTypeOther, setDocumentTypeOther] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");

  // contact
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");

  // health
  const [eps, setEps] = useState("");
  const [bloodType, setBloodType] = useState("");

  // shirt
  const [needsShirt, setNeedsShirt] = useState<YesNo>("NO");
  const [shirtColors, setShirtColors] = useState<ShirtColor[]>([]);
  const [shirtSize, setShirtSize] = useState<ShirtSize>("S");
  const [shirtSizeOther, setShirtSizeOther] = useState("");

  const toggleShirtColor = (value: ShirtColor) => {
    setShirtColors((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    );
  };

  // merch
  const [merchItems, setMerchItems] = useState<MerchItem[]>([]);
  const [merchSize, setMerchSize] = useState<ShirtSize>("");
  const [merchSizeOther, setMerchSizeOther] = useState("");

  const toggleMerchItem = (value: MerchItem) => {
    setMerchItems((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    );
  };

  // emergency
  const [emergencyFirstName, setEmergencyFirstName] = useState("");
  const [emergencyLastName, setEmergencyLastName] = useState("");
  const [emergencyDocumentType, setEmergencyDocumentType] = useState<DocumentType>("CC");
  const [emergencyDocumentTypeOther, setEmergencyDocumentTypeOther] = useState("");
  const [emergencyDocumentNumber, setEmergencyDocumentNumber] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("");
  const [emergencyEmail, setEmergencyEmail] = useState("");
  const [emergencyAddress, setEmergencyAddress] = useState("");

  // services
  const [services, setServices] = useState<Service[]>([]);
  const [lastService, setLastService] = useState<Service>("NINGUNO");
  const [serviceLeaderOf, setServiceLeaderOf] = useState("");

  const toggleService = (value: Service) => {
    setServices((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    );
  };

  // other sedes
  const [wentToOtherSedes, setWentToOtherSedes] = useState<YesNo>("NO");
  const [otherSedesDetail, setOtherSedesDetail] = useState("");

  // formation
  const [formationOther, setFormationOther] = useState("");

  // terms
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);
  const [acceptDataPolicy, setAcceptDataPolicy] = useState<boolean>(false);

  // password
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // status
  const [isLoading, setIsLoading] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [registrationNumber, setRegistrationNumber] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const passwordOk = password.length >= 8 && password === confirmPassword;
  const shirtOk = needsShirt === "NO" || (needsShirt === "SI" && shirtColors.length > 0);
  const merchNeedsSize = merchItems.some((item) => item !== "NINGUNA");
  const merchSizeOk =
    !merchNeedsSize ||
    (merchSize.trim() !== "" && (merchSize !== "OTRO" || merchSizeOther.trim() !== ""));

  const canSubmit =
    email.trim() &&
    firstNames.trim() &&
    lastNames.trim() &&
    preferredName.trim() &&
    referralNamePhone.trim() &&
    documentType &&
    (documentType !== "OTRO" || documentTypeOther.trim()) &&
    documentNumber.trim() &&
    city.trim() &&
    address.trim() &&
    birthDate.trim() &&
    age.trim() &&
    phone.trim() &&
    eps.trim() &&
    bloodType.trim() &&
    emergencyFirstName.trim() &&
    emergencyLastName.trim() &&
    emergencyDocumentType &&
    (emergencyDocumentType !== "OTRO" || emergencyDocumentTypeOther.trim()) &&
    emergencyDocumentNumber.trim() &&
    emergencyPhone.trim() &&
    emergencyRelation.trim() &&
    emergencyEmail.trim() &&
    emergencyAddress.trim() &&
    services.length > 0 &&
    serviceLeaderOf.trim() &&
    formationOther.trim() &&
    acceptTerms &&
    acceptDataPolicy &&
    passwordOk &&
    shirtOk &&
    merchSizeOk;

  const payload = useMemo(
    () =>
      buildServidorPayload({
        email,
        firstNames,
        lastNames,
        preferredName,
        referralNamePhone,
        documentType,
        documentTypeOther,
        documentNumber,
        city,
        address,
        birthDate,
        age,
        phone,
        eps,
        bloodType,
        needsShirt,
        shirtColors,
        shirtSize,
        shirtSizeOther,
        merchItems,
        merchSize,
        merchSizeOther,
        emergencyFirstName,
        emergencyLastName,
        emergencyDocumentType,
        emergencyDocumentTypeOther,
        emergencyDocumentNumber,
        emergencyPhone,
        emergencyRelation,
        emergencyEmail,
        emergencyAddress,
        services,
        lastService,
        serviceLeaderOf,
        wentToOtherSedes,
        otherSedesDetail,
        formationOther,
        acceptTerms,
        acceptDataPolicy,
        password,
      }),
    [
      email,
      firstNames,
      lastNames,
      preferredName,
      referralNamePhone,
      documentType,
      documentTypeOther,
      documentNumber,
      city,
      address,
      birthDate,
      age,
      phone,
      eps,
      bloodType,
      needsShirt,
      shirtColors,
      shirtSize,
      shirtSizeOther,
      merchItems,
      merchSize,
      merchSizeOther,
      emergencyFirstName,
      emergencyLastName,
      emergencyDocumentType,
      emergencyDocumentTypeOther,
      emergencyDocumentNumber,
      emergencyPhone,
      emergencyRelation,
      emergencyEmail,
      emergencyAddress,
      services,
      lastService,
      serviceLeaderOf,
      wentToOtherSedes,
      otherSedesDetail,
      formationOther,
      acceptTerms,
      acceptDataPolicy,
      password,
    ]
  );

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    setErrorMsg(null);
    setSuccessId(null);
    setRegistrationNumber(null);

    try {
      setIsLoading(true);
      const result = await registerServidor(payload);
      setSuccessId(result.id);
      setRegistrationNumber(result.registrationNumber);
    } catch (error: unknown) {
      setErrorMsg(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // state
    email,
    firstNames,
    lastNames,
    preferredName,
    referralNamePhone,
    documentType,
    documentTypeOther,
    documentNumber,
    city,
    address,
    birthDate,
    age,
    phone,
    eps,
    bloodType,
    needsShirt,
    shirtColors,
    shirtSize,
    shirtSizeOther,
    merchItems,
    merchSize,
    merchSizeOther,
    emergencyFirstName,
    emergencyLastName,
    emergencyDocumentType,
    emergencyDocumentTypeOther,
    emergencyDocumentNumber,
    emergencyPhone,
    emergencyRelation,
    emergencyEmail,
    emergencyAddress,
    services,
    lastService,
    serviceLeaderOf,
    wentToOtherSedes,
    otherSedesDetail,
    formationOther,
    acceptTerms,
    acceptDataPolicy,
    password,
    confirmPassword,

    // setters
    setEmail,
    setFirstNames,
    setLastNames,
    setPreferredName,
    setReferralNamePhone,
    setDocumentType,
    setDocumentTypeOther,
    setDocumentNumber,
    setCity,
    setAddress,
    setBirthDate,
    setAge,
    setPhone,
    setEps,
    setBloodType,
    setNeedsShirt,
    setShirtSize,
    setShirtSizeOther,
    setMerchSize,
    setMerchSizeOther,
    setEmergencyFirstName,
    setEmergencyLastName,
    setEmergencyDocumentType,
    setEmergencyDocumentTypeOther,
    setEmergencyDocumentNumber,
    setEmergencyPhone,
    setEmergencyRelation,
    setEmergencyEmail,
    setEmergencyAddress,
    setLastService,
    setServiceLeaderOf,
    setWentToOtherSedes,
    setOtherSedesDetail,
    setFormationOther,
    setAcceptTerms,
    setAcceptDataPolicy,
    setPassword,
    setConfirmPassword,

    // helpers
    toggleShirtColor,
    toggleMerchItem,
    toggleService,
    canSubmit,
    merchNeedsSize,
    onSubmit,

    // status
    isLoading,
    successId,
    registrationNumber,
    errorMsg,
  };
};

export type UseRegisterServidorFormReturn = ReturnType<typeof useRegisterServidorForm>;