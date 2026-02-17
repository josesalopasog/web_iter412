import { useMemo, useState } from "react";
import { registerSoldado } from "../../../api/registerSoldado";
import { buildSoldadoPayload } from "./buildSoldadoPayload";
import type {
  Gender,
  YesNo,
  DocumentType,
  Occupation,
  HearAbout,
  ShirtSize,
  Restriction,
  Sacrament,
} from "./types";

export const useRegisterSoldadoForm = () => {
  // --- state
  const [gender, setGender] = useState<Gender>("");

  const [email, setEmail] = useState("");
  const [firstNames, setFirstNames] = useState("");
  const [lastNames, setLastNames] = useState("");
  const [preferredName, setPreferredName] = useState("");

  const [documentType, setDocumentType] = useState<DocumentType>("");
  const [documentTypeOther, setDocumentTypeOther] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");

  const [age, setAge] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");

  const [phone, setPhone] = useState("");

  const [eps, setEps] = useState("");
  const [bloodType, setBloodType] = useState("");

  const [practicesReligion, setPracticesReligion] = useState<YesNo>("NO");
  const [whichReligion, setWhichReligion] = useState("");

  const [occupation, setOccupation] = useState<Occupation>("TRABAJADOR");
  const [occupationOther, setOccupationOther] = useState("");
  const [occupationPlace, setOccupationPlace] = useState("");

  const [sacraments, setSacraments] = useState<Sacrament[]>(["NINGUNO"]);

  const [restrictions, setRestrictions] = useState<Restriction[]>(["NINGUNA"]);
  const [restrictionsOther, setRestrictionsOther] = useState("");
  const [medicationsDetail, setMedicationsDetail] = useState("");

  const [shirtSize, setShirtSize] = useState<ShirtSize>("M");
  const [shirtSizeOther, setShirtSizeOther] = useState("");

  const [isSurprise, setIsSurprise] = useState<YesNo>("NO");

  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("");
  const [emergencyEmail, setEmergencyEmail] = useState("");

  const [hearAbout, setHearAbout] = useState<HearAbout>("CONOZCO_A_ALGUIEN");
  const [hearAboutOther, setHearAboutOther] = useState("");

  const [invitedByCommunity, setInvitedByCommunity] = useState<YesNo>("NO");
  const [invitedByName, setInvitedByName] = useState("");

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptDataPolicy, setAcceptDataPolicy] = useState(false);

  // status
  const [isLoading, setIsLoading] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // helpers
  const toggleSacrament = (value: Sacrament) => {
    setSacraments((prev) => {
      const exists = prev.includes(value);
      const next = exists ? prev.filter((x) => x !== value) : [...prev, value];
      // regla simple: si selecciona algo distinto a NINGUNO, quitar NINGUNO
      if (value !== "NINGUNO") return next.filter((x) => x !== "NINGUNO");
      return ["NINGUNO"];
    });
  };

  const toggleRestriction = (value: Restriction) => {
    setRestrictions((prev) => {
      const exists = prev.includes(value);
      let next = exists ? prev.filter((x) => x !== value) : [...prev, value];

      if (value !== "NINGUNA") next = next.filter((x) => x !== "NINGUNA");
      if (value === "NINGUNA") next = ["NINGUNA"];

      return next.length ? next : ["NINGUNA"];
    });
  };

  const canSubmit: boolean =
    gender.trim().length > 0 &&
    email.trim().length > 0 &&
    firstNames.trim().length > 0 &&
    lastNames.trim().length > 0 &&
    preferredName.trim().length > 0 &&
    documentType.trim().length > 0 &&
    documentNumber.trim().length > 0 &&
    age.trim().length > 0 &&
    birthDate.trim().length > 0 &&
    address.trim().length > 0 &&
    city.trim().length > 0 &&
    neighborhood.trim().length > 0 &&
    phone.trim().length > 0 &&
    eps.trim().length > 0 &&
    bloodType.trim().length > 0 &&
    occupationPlace.trim().length > 0 &&
    emergencyName.trim().length > 0 &&
    emergencyPhone.trim().length > 0 &&
    emergencyRelation.trim().length > 0 &&
    emergencyEmail.trim().length > 0 &&
    acceptTerms === true &&
    acceptDataPolicy === true;

  const payload = useMemo(
    () =>
      buildSoldadoPayload({
        gender,
        email,
        firstNames,
        lastNames,
        preferredName,
        documentType,
        documentTypeOther,
        documentNumber,
        age,
        birthDate,
        address,
        city,
        neighborhood,
        phone,
        eps,
        bloodType,
        practicesReligion,
        whichReligion,
        occupation,
        occupationOther,
        occupationPlace,
        sacraments,
        restrictions,
        restrictionsOther,
        medicationsDetail,
        shirtSize,
        shirtSizeOther,
        isSurprise,
        emergencyName,
        emergencyPhone,
        emergencyRelation,
        emergencyEmail,
        hearAbout,
        hearAboutOther,
        invitedByCommunity,
        invitedByName,
        acceptTerms,
        acceptDataPolicy,
      }),
    [
      gender,
      email,
      firstNames,
      lastNames,
      preferredName,
      documentType,
      documentTypeOther,
      documentNumber,
      age,
      birthDate,
      address,
      city,
      neighborhood,
      phone,
      eps,
      bloodType,
      practicesReligion,
      whichReligion,
      occupation,
      occupationOther,
      occupationPlace,
      sacraments,
      restrictions,
      restrictionsOther,
      medicationsDetail,
      shirtSize,
      shirtSizeOther,
      isSurprise,
      emergencyName,
      emergencyPhone,
      emergencyRelation,
      emergencyEmail,
      hearAbout,
      hearAboutOther,
      invitedByCommunity,
      invitedByName,
      acceptTerms,
      acceptDataPolicy,
    ]
  );

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    setErrorMsg(null);
    setSuccessId(null);

    try {
      setIsLoading(true);
      const result = await registerSoldado(payload);
      setSuccessId(result.id);
    } catch (error: unknown) {
      setErrorMsg(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // state
    gender,
    email,
    firstNames,
    lastNames,
    preferredName,
    documentType,
    documentTypeOther,
    documentNumber,
    age,
    birthDate,
    address,
    city,
    neighborhood,
    phone,
    eps,
    bloodType,
    practicesReligion,
    whichReligion,
    occupation,
    occupationOther,
    occupationPlace,
    sacraments,
    restrictions,
    restrictionsOther,
    medicationsDetail,
    shirtSize,
    shirtSizeOther,
    isSurprise,
    emergencyName,
    emergencyPhone,
    emergencyRelation,
    emergencyEmail,
    hearAbout,
    hearAboutOther,
    invitedByCommunity,
    invitedByName,
    acceptTerms,
    acceptDataPolicy,

    // setters
    setGender,
    setEmail,
    setFirstNames,
    setLastNames,
    setPreferredName,
    setDocumentType,
    setDocumentTypeOther,
    setDocumentNumber,
    setAge,
    setBirthDate,
    setAddress,
    setCity,
    setNeighborhood,
    setPhone,
    setEps,
    setBloodType,
    setPracticesReligion,
    setWhichReligion,
    setOccupation,
    setOccupationOther,
    setOccupationPlace,
    setSacraments,
    setRestrictions,
    setRestrictionsOther,
    setMedicationsDetail,
    setShirtSize,
    setShirtSizeOther,
    setIsSurprise,
    setEmergencyName,
    setEmergencyPhone,
    setEmergencyRelation,
    setEmergencyEmail,
    setHearAbout,
    setHearAboutOther,
    setInvitedByCommunity,
    setInvitedByName,
    setAcceptTerms,
    setAcceptDataPolicy,

    // helpers
    toggleSacrament,
    toggleRestriction,
    onSubmit,
    canSubmit,

    // status
    isLoading,
    successId,
    errorMsg,
  };
};

export type UseRegisterSoldadoFormReturn = ReturnType<typeof useRegisterSoldadoForm>;