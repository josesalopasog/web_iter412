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
  const [merchSize, setMerchSize] = useState<ShirtSize>("S");
  const [merchSizeOther, setMerchSizeOther] = useState("");

  const toggleMerchItem = (value: MerchItem) => {
    setMerchItems((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    );
  };

  // emergency
  const [emergency1Name, setEmergency1Name] = useState("");
  const [emergency1Phone, setEmergency1Phone] = useState("");
  const [emergency1Relation, setEmergency1Relation] = useState("");
  const [emergency1Address, setEmergency1Address] = useState("");

  const [emergency2Name, setEmergency2Name] = useState("");
  const [emergency2Phone, setEmergency2Phone] = useState("");
  const [emergency2Relation, setEmergency2Relation] = useState("");
  const [emergency2Address, setEmergency2Address] = useState("");

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const passwordOk = password.length >= 8 && password === confirmPassword;
  const shirtOk = needsShirt === "NO" || (needsShirt === "SI" && shirtColors.length > 0);

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
    emergency1Name.trim() &&
    emergency1Phone.trim() &&
    emergency1Relation.trim() &&
    emergency1Address.trim() &&
    emergency2Name.trim() &&
    emergency2Phone.trim() &&
    emergency2Relation.trim() &&
    emergency2Address.trim() &&
    services.length > 0 &&
    serviceLeaderOf.trim() &&
    formationOther.trim() &&
    acceptTerms &&
    acceptDataPolicy &&
    passwordOk &&
    shirtOk;

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
        emergency1Name,
        emergency1Phone,
        emergency1Relation,
        emergency1Address,
        emergency2Name,
        emergency2Phone,
        emergency2Relation,
        emergency2Address,
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
      emergency1Name,
      emergency1Phone,
      emergency1Relation,
      emergency1Address,
      emergency2Name,
      emergency2Phone,
      emergency2Relation,
      emergency2Address,
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

    try {
      setIsLoading(true);
      const result = await registerServidor(payload);
      setSuccessId(result.id);
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
    emergency1Name,
    emergency1Phone,
    emergency1Relation,
    emergency1Address,
    emergency2Name,
    emergency2Phone,
    emergency2Relation,
    emergency2Address,
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
    setEmergency1Name,
    setEmergency1Phone,
    setEmergency1Relation,
    setEmergency1Address,
    setEmergency2Name,
    setEmergency2Phone,
    setEmergency2Relation,
    setEmergency2Address,
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
    onSubmit,

    // status
    isLoading,
    successId,
    errorMsg,
  };
};

export type UseRegisterServidorFormReturn = ReturnType<typeof useRegisterServidorForm>;