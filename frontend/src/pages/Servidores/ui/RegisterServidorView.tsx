import React from "react";
import { useNavigate } from "react-router-dom";
import type { UseRegisterServidorFormReturn } from "../form/useRegisterServidorForm";
import type {
  DocumentType,
  MerchItem,
  Service,
  ShirtColor,
  ShirtSize,
  YesNo,
} from "../form/types";

import whatsapp_logo from "../../../assets/svg/WhatsApp.svg";
import TermsAndConditions from "./TermsAndConditions";

type Props = UseRegisterServidorFormReturn;

const DATA_POLICY_TEXT = `
𝐏𝐨𝐥𝐢́𝐭𝐢𝐜𝐚 𝐝𝐞 𝐓𝐫𝐚𝐭𝐚𝐦𝐢𝐞𝐧𝐭𝐨 𝐝𝐞 𝐃𝐚𝐭𝐨𝐬: Con La expedición de la ley 1581 de 2012 y el Decreto 1377 de 2013, se desarrolla el principio constitucional que tienen todas las personas a conocer, actualizar y rectificar todo tipo de información recogida o que haya sido objeto de tratamiento de datos personales en bancos o bases de datos y en general, en archivos de entidades públicas y/o privadas. La Comunidad Iter 4.12, como Comunidad que almacena y recolecta datos personales, requiere obtener tu autorización para que de manera libre, previa, expresa, voluntaria y debidamente informada, le permitas recolectar, recaudar, almacenar, usar, circular, suprimir, procesar, compilar, intercambiar, dar tratamiento, actualizar y disponer de los datos que le serán solicitados en el formulario y que serán incorporados en distintas bases o bancos de datos o en repositorios electrónicos de todo tipo para el desarrollo de las funciones propias de la organización y para brindar información de sus actividades. Si no deseas que tus datos personales sean utilizados por la Comunidad, tengas alguna observación y/o comentario sobre el manejo de los mismos, consideres que se les dio un uso contrario al autorizado o al permitido por las leyes aplicables, o no quieras seguir recibiendo información relacionada con la organización y sus actividades, podrás revocar de manera parcial o total tu autorización de manera expresa e inequívoca, directa y por escrito, por correo electrónico; o de manera oral, o por cualquier medio o conducta inequívoca que permita concluir de forma razonable que se revoca tal autorización o consentimiento. Dichas comunicaciones podrán ser enviadas al correo electrónico 𝐢𝐭𝐞𝐫𝟒.𝟏𝟐𝐛𝐨𝐠𝐨𝐭𝐚@𝐠𝐦𝐚𝐢𝐥.𝐜𝐨𝐦 
`;

export const RegisterServidorView: React.FC<Props> = ({
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
  toggleShirtColor,
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
  toggleMerchItem,
  toggleService,
  onSubmit,
  canSubmit,
  merchNeedsSize,

  // status
  isLoading,
  successId,
  registrationNumber,
  errorMsg,
}) => {
  const navigate = useNavigate();
  const [openTerms, setOpenTerms] = React.useState(false);
  const [openPolicy, setOpenPolicy] = React.useState(false);

  const passwordOk = password.length >= 8 && password === confirmPassword;

  const handleToggleMerch = (item: MerchItem) => {
    toggleMerchItem(item);
  };

  const handleToggleService = (item: Service) => {
    toggleService(item);
  };

  const colorLabel = (c: ShirtColor) => {
    if (c === "BLANCA") return "Blanca";
    if (c === "VERDE") return "Verde";
    if (c === "AZUL") return "Azul";
    return c;
  };

  return (
    <section id="register-servidores" aria-label="Registro Servidores">
      <div className="container">
        <div className="section-head">
          <h2>Registro de Servidores</h2>
          <h3>Diligencia tus datos para servir en el próximo retiro</h3>
          <p className="sub">
            Querido servidor, el fin de semana del 13, 14 y 15 de noviembre del 2026,
            estaremos reunidos nuevamente en comunidad, llevando la palabra de
            Dios y la alegría de ITER 4.12 a los jóvenes, mostrando el reinado
            de Cristo y su iglesia. Diligencia el formulario y participa de esta
            increíble experiencia en la Casa de Retiros, Centro de
            Espiritualidad María Consolata (Carrera 24B No. 1D - 60, contiguo a
            la Parroquia Nuestra Señora de la Consolata). El valor total del
            retiro incluye la alimentación desde el día viernes en la noche
            (cena), hasta el día domingo al mediodía (almuerzo). Por favor
            completa todos los campos.
          </p>
          <p className="sub">
            Esta información se usará para organización del retiro y
            asignaciones.
          </p>
        </div>

        <div className="grid">
          <div className="card span-8">
            <h3>📝 Formulario</h3>

            <form className="registerForm" onSubmit={onSubmit}>
              {/* ===================== DATOS BÁSICOS ===================== */}
              <div className="formSection">
                <h4 className="formTitle">Datos personales</h4>

                <div className="formGrid">
                  <div className="formRow">
                    <label className="formLabel" htmlFor="email">
                      Correo electrónico <span className="req">*</span>
                    </label>
                    <input
                      id="email"
                      className="formInput"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="tucorreo@gmail.com"
                    />
                  </div>
                  <div className="formRow">
                    <label className="formLabel" htmlFor="firstNames">
                      Nombres <span className="req">*</span>
                    </label>
                    <input
                      id="firstNames"
                      className="formInput"
                      value={firstNames}
                      onChange={(e) => setFirstNames(e.target.value)}
                      required
                      autoComplete="given-name"
                    />
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="lastNames">
                      Apellidos <span className="req">*</span>
                    </label>
                    <input
                      id="lastNames"
                      className="formInput"
                      value={lastNames}
                      onChange={(e) => setLastNames(e.target.value)}
                      required
                      placeholder="Ej: Pérez Gómez"
                      autoComplete="family-name"
                    />
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="preferredName">
                      ¿Cómo te gusta que te digan?{" "}
                      <span className="req">*</span>
                    </label>
                    <input
                      id="preferredName"
                      className="formInput"
                      value={preferredName}
                      onChange={(e) => setPreferredName(e.target.value)}
                      required
                      placeholder="Ej: Juanpa"
                    />
                  </div>

                  <div className="formRow formRowFull">
                    <label className="formLabel" htmlFor="referralNamePhone">
                      ¿Tienes algun referido que quisieras comentarle sobre el
                      retiro? Dejanos su nombre y celular. De lo contrario
                      escribe "NO" <span className="req">*</span>
                    </label>
                    <input
                      id="referralNamePhone"
                      className="formInput"
                      value={referralNamePhone}
                      onChange={(e) => setReferralNamePhone(e.target.value)}
                      required
                      placeholder="Ej: John Doe - 300-123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* ===================== DOCUMENTO ===================== */}
              <div className="formSection">
                <h4 className="formTitle">Documento</h4>

                <div className="formGrid">
                  <div className="formRow">
                    <label className="formLabel" htmlFor="documentType">
                      Tipo de documento <span className="req">*</span>
                    </label>
                    <select
                      id="documentType"
                      className="formSelect"
                      value={documentType}
                      onChange={(e) =>
                        setDocumentType(e.target.value as DocumentType)
                      }
                      required
                    >
                      <option value="CC">Cédula</option>
                      <option value="TI">Tarjeta de identidad</option>
                      <option value="PAS">Pasaporte</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>

                  {documentType === "OTRO" && (
                    <div className="formRow">
                      <label className="formLabel" htmlFor="documentTypeOther">
                        ¿Cuál? <span className="req">*</span>
                      </label>
                      <input
                        id="documentTypeOther"
                        className="formInput"
                        value={documentTypeOther}
                        onChange={(e) => setDocumentTypeOther(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="formRow">
                    <label className="formLabel" htmlFor="documentNumber">
                      Número de documento <span className="req">*</span>
                    </label>
                    <input
                      id="documentNumber"
                      className="formInput"
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* ===================== CONTACTO ===================== */}
              <div className="formSection">
                <h4 className="formTitle">Contacto</h4>

                <div className="formGrid">
                  <div className="formRow">
                    <label className="formLabel" htmlFor="city">
                      Ciudad de residencia <span className="req">*</span>
                    </label>
                    <input
                      id="city"
                      className="formInput"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      placeholder="Ej: Bogotá"
                    />
                  </div>
                  <div className="formRow">
                    <label className="formLabel" htmlFor="address">
                      Dirección <span className="req">*</span>
                    </label>
                    <input
                      id="address"
                      className="formInput"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Dirección de residencia"
                      required
                    />
                  </div>
                  <div className="formRow">
                    <label className="formLabel" htmlFor="birthDate">
                      Fecha de nacimiento <span className="req">*</span>
                    </label>
                    <input
                      id="birthDate"
                      type="date"
                      className="formInput"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="age">
                      Edad <span className="req">*</span>
                    </label>
                    <input
                      id="age"
                      className="formInput"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      inputMode="numeric"
                      required
                      placeholder="Ej: 23"
                    />
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="phone">
                      Número de celular <span className="req">*</span>
                    </label>
                    <input
                      id="phone"
                      className="formInput"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      inputMode="tel"
                      required
                      placeholder="Ej: 3000000000"
                    />
                  </div>
                </div>
              </div>

              {/* ===================== SALUD ===================== */}
              <div className="formSection">
                <h4 className="formTitle">Salud</h4>

                <div className="formGrid">
                  <div className="formRow">
                    <label className="formLabel" htmlFor="eps">
                      EPS <span className="req">*</span>
                    </label>
                    <input
                      id="eps"
                      className="formInput"
                      value={eps}
                      onChange={(e) => setEps(e.target.value)}
                      required
                    />
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="bloodType">
                      Tipo de sangre <span className="req">*</span>
                    </label>
                    <input
                      id="bloodType"
                      className="formInput"
                      value={bloodType}
                      onChange={(e) => setBloodType(e.target.value)}
                      required
                      placeholder="Ej: O+"
                    />
                  </div>
                </div>
              </div>

              {/* ===================== Dotación ===================== */}
              <div className="formSection">
                <h4 className="formTitle">Camiseta</h4>

                <div className="formGrid">
                  <div className="formRow">
                    <label className="formLabel" htmlFor="needsShirt">
                      ¿Necesitas camiseta? <span className="req">*</span>
                    </label>
                    <select
                      id="needsShirt"
                      className="formSelect"
                      value={needsShirt}
                      onChange={(e) => setNeedsShirt(e.target.value as YesNo)}
                      required
                    >
                      <option value="NO">NO</option>
                      <option value="SI">SI</option>
                    </select>
                  </div>

                  {needsShirt === "SI" && (
                    <>
                      <div className="formRow formRowFull">
                        <span className="formLabel">
                          Color (puedes seleccionar varios){" "}
                          <span className="req">*</span>
                        </span>

                        <div className="checkGrid">
                          {(["BLANCA", "VERDE", "AZUL"] as const).map((c) => (
                            <label key={c} className="checkRow">
                              <input
                                type="checkbox"
                                checked={shirtColors.includes(c)}
                                onChange={() => toggleShirtColor(c)}
                              />
                              <span>{colorLabel(c)}</span>
                            </label>
                          ))}
                        </div>

                        {shirtColors.length === 0 && (
                          <p className="formHint" style={{ color: "crimson" }}>
                            Selecciona al menos un color.
                          </p>
                        )}
                      </div>

                      <div className="formRow">
                        <label className="formLabel" htmlFor="shirtSize">
                          Talla <span className="req">*</span>
                        </label>
                        <select
                          id="shirtSize"
                          className="formSelect"
                          value={shirtSize}
                          onChange={(e) =>
                            setShirtSize(e.target.value as ShirtSize)
                          }
                          required
                        >
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="OTRO">Otro</option>
                        </select>
                      </div>

                      {shirtSize === "OTRO" && (
                        <div className="formRow">
                          <label className="formLabel" htmlFor="shirtSizeOther">
                            ¿Cuál? <span className="req">*</span>
                          </label>
                          <input
                            id="shirtSizeOther"
                            className="formInput"
                            value={shirtSizeOther}
                            onChange={(e) => setShirtSizeOther(e.target.value)}
                            required
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* ===================== OTROS ===================== */}
              <div className="formSection">
                <h4 className="formTitle">Otros</h4>

                <div className="formGrid">
                  <div className="formRow formRowFull">
                    <span className="formLabel">
                      Selecciona si necesitas otra prenda o accesorio{" "}
                      <span className="req">*</span>
                    </span>
                    <div className="checkGrid">
                      {(
                        [
                          "BUSO_CERRADO",
                          "CHAQUETA_ABIERTA",
                          "TULA",
                          "GORRA",
                          "CANGURO",
                          "NINGUNA",
                        ] as const
                      ).map((item) => (
                        <label key={item} className="checkRow">
                          <input
                            type="checkbox"
                            checked={merchItems.includes(item)}
                            onChange={() => handleToggleMerch(item)}
                          />
                          <span>{item.replaceAll("_", " ")}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="merchSize">
                      Talla {merchNeedsSize && <span className="req">*</span>}
                    </label>
                    <select
                      id="merchSize"
                      className="formSelect"
                      value={merchSize}
                      onChange={(e) =>
                        setMerchSize(e.target.value as ShirtSize)
                      }
                      required={merchNeedsSize}
                    >
                      <option value=""></option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>

                  {merchSize === "OTRO" && (
                    <div className="formRow">
                      <label className="formLabel" htmlFor="merchSizeOther">
                        ¿Cuál? <span className="req">*</span>
                      </label>
                      <input
                        id="merchSizeOther"
                        className="formInput"
                        value={merchSizeOther}
                        onChange={(e) => setMerchSizeOther(e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* ===================== EMERGENCIA ===================== */}
              <div className="formSection">
                <h3 className="formTitle">🦺  Contacto de emergencia </h3>
                <h4 className="formTitle">Por favor poner una persona mayor de edad.</h4>

                <div className="formGrid">
                  <div className="formRow">
                    <label className="formLabel" htmlFor="emergencyFirstName">
                      Nombres <span className="req">*</span>
                    </label>
                    <input
                      id="emergencyFirstName"
                      className="formInput"
                      value={emergencyFirstName}
                      onChange={(e) => setEmergencyFirstName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="emergencyLastName">
                      Apellidos <span className="req">*</span>
                    </label>
                    <input
                      id="emergencyLastName"
                      className="formInput"
                      value={emergencyLastName}
                      onChange={(e) => setEmergencyLastName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="emergencyDocumentType">
                      Tipo de documento <span className="req">*</span>
                    </label>
                    <select
                      id="emergencyDocumentType"
                      className="formSelect"
                      value={emergencyDocumentType}
                      onChange={(e) =>
                        setEmergencyDocumentType(e.target.value as DocumentType)
                      }
                      required
                    >
                      <option value="TI">Tarjeta de identidad</option>
                      <option value="CC">Cédula de ciudadanía</option>
                      <option value="PAS">Pasaporte</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>

                  {emergencyDocumentType === "OTRO" && (
                    <div className="formRow">
                      <label className="formLabel" htmlFor="emergencyDocumentTypeOther">
                        ¿Cuál? <span className="req">*</span>
                      </label>
                      <input
                        id="emergencyDocumentTypeOther"
                        className="formInput"
                        value={emergencyDocumentTypeOther}
                        onChange={(e) => setEmergencyDocumentTypeOther(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="formRow">
                    <label className="formLabel" htmlFor="emergencyDocumentNumber">
                      Número de documento <span className="req">*</span>
                    </label>
                    <input
                      id="emergencyDocumentNumber"
                      className="formInput"
                      value={emergencyDocumentNumber}
                      onChange={(e) => setEmergencyDocumentNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="emergencyPhone">
                      Celular <span className="req">*</span>
                    </label>
                    <input
                      id="emergencyPhone"
                      className="formInput"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      required
                      inputMode="tel"
                    />
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="emergencyAddress">
                      Dirección <span className="req">*</span>
                    </label>
                    <input
                      id="emergencyAddress"
                      className="formInput"
                      value={emergencyAddress}
                      onChange={(e) => setEmergencyAddress(e.target.value)}
                      required
                    />
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="emergencyRelation">
                      Relación <span className="req">*</span>
                    </label>
                    <input
                      id="emergencyRelation"
                      className="formInput"
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      required
                    />
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="emergencyEmail">
                      Correo <span className="req">*</span>
                    </label>
                    <input
                      id="emergencyEmail"
                      className="formInput"
                      type="email"
                      value={emergencyEmail}
                      onChange={(e) => setEmergencyEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* ===================== SERVICIO ===================== */}
              <div className="formSection">
                <h4 className="formTitle">Servicios</h4>

                <div className="formGrid">
                  <div className="formRow formRowFull">
                    <span className="formLabel">
                      ¿En qué servicio has estado?{" "}
                      <span className="req">*</span>
                    </span>

                    <div className="checkGrid">
                      {(
                        [
                          "COMEDOR",
                          "LIDER_DE_MESA",
                          "PALANCAS",
                          "LOGISTICA",
                          "SANTISIMO",
                          "SONIDO_PALETERO_CAMPANERO",
                          "COORDINADOR",
                          "LIDER_DE_RETIRO",
                          "NINGUNO",
                        ] as const
                      ).map((s) => (
                        <label key={s} className="checkRow">
                          <input
                            type="checkbox"
                            checked={services.includes(s)}
                            onChange={() => handleToggleService(s)}
                          />
                          <span>{s.replaceAll("_", " ")}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="lastService">
                      Último servicio en retiro <span className="req">*</span>
                    </label>
                    <select
                      id="lastService"
                      className="formSelect"
                      value={lastService}
                      onChange={(e) =>
                        setLastService(e.target.value as Service)
                      }
                      required
                    >
                      {(
                        [
                          "COMEDOR",
                          "LIDER_DE_MESA",
                          "PALANCAS",
                          "LOGISTICA",
                          "SANTISIMO",
                          "SONIDO_PALETERO_CAMPANERO",
                          "COORDINADOR",
                          "LIDER_DE_RETIRO",
                          "NINGUNO",
                        ] as const
                      ).map((s) => (
                        <option key={s} value={s}>
                          {s.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="formRow formRowFull">
                    <label className="formLabel" htmlFor="serviceLeaderOf">
                      ¿Has sido lider de algún servicio? ¿De cual?{" "}
                      <span className="req">*</span>
                    </label>
                    <input
                      id="serviceLeaderOf"
                      className="formInput"
                      value={serviceLeaderOf}
                      onChange={(e) => setServiceLeaderOf(e.target.value)}
                      required
                      placeholder="Ej: Logística"
                    />
                  </div>
                </div>
              </div>

              {/* ===================== OTRAS SEDES ===================== */}
              <div className="formSection">
                <h4 className="formTitle">Otras sedes</h4>

                <div className="formGrid">
                  <div className="formRow">
                    <label className="formLabel" htmlFor="wentToOtherSedes">
                      ¿Has asistido a retiros en otras sedes?{" "}
                      <span className="req">*</span>
                    </label>
                    <select
                      id="wentToOtherSedes"
                      className="formSelect"
                      value={wentToOtherSedes}
                      onChange={(e) =>
                        setWentToOtherSedes(e.target.value as YesNo)
                      }
                      required
                    >
                      <option value="NO">NO</option>
                      <option value="SI">SI</option>
                    </select>
                  </div>

                  {wentToOtherSedes === "SI" && (
                    <div className="formRow formRowFull">
                      <label className="formLabel" htmlFor="otherSedesDetail">
                        ¿Cuáles? <span className="req">*</span>
                      </label>
                      <input
                        id="otherSedesDetail"
                        className="formInput"
                        value={otherSedesDetail}
                        onChange={(e) => setOtherSedesDetail(e.target.value)}
                        required
                        placeholder="Ej: Manizales, Chinchina..."
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* ===================== FORMACIÓN ===================== */}
              <div className="formSection">
                <h4 className="formTitle">Formación</h4>

                <div className="formGrid">
                  <div className="formRow formRowFull">
                    <label className="formLabel" htmlFor="formationOther">
                      Cuentanos ¿Además de Iter te formas en otra comunidad o de
                      otra forma? ¿Has hecho retiros?{" "}
                      <span className="req">*</span>
                    </label>
                    <input
                      id="formationOther"
                      className="formInput"
                      value={formationOther}
                      onChange={(e) => setFormationOther(e.target.value)}
                      required
                      placeholder="Si no, escribe: Ninguna"
                    />
                  </div>
                </div>
              </div>

              {/* ===================== PASSWORD ===================== */}
              <div className="formSection">
                <h4 className="formTitle">Contraseña</h4>

                <div className="formGrid">
                  <div className="formRow">
                    <label className="formLabel" htmlFor="password">
                      Contraseña <span className="req">*</span>
                    </label>
                    <input
                      id="password"
                      type="password"
                      className="formInput"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Mínimo 8 caracteres"
                    />
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="confirmPassword">
                      Confirmar contraseña <span className="req">*</span>
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      className="formInput"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Repite la contraseña"
                    />
                  </div>

                  {!passwordOk &&
                    (password.length > 0 || confirmPassword.length > 0) && (
                      <p className="formHint" style={{ color: "crimson" }}>
                        La contraseña debe tener mínimo 8 caracteres y
                        coincidir.
                      </p>
                    )}
                </div>
              </div>

              {/* ===================== ACEPTACIÓN ===================== */}
              <div className="formSection">
                <h4 className="formTitle">Aceptación</h4>

                <div className="formGrid">
                  <div className="formRow formRowFull">
                    <label className="checkRow">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        required
                      />
                      <span>
                        Acepto los{" "}
                        <button
                          type="button"
                          className="linkBtn"
                          onClick={() => setOpenTerms(true)}
                        >
                          términos y condiciones
                        </button>{" "}
                        <span className="req">*</span>
                      </span>
                    </label>
                  </div>

                  <div className="formRow formRowFull">
                    <label className="checkRow">
                      <input
                        type="checkbox"
                        checked={acceptDataPolicy}
                        onChange={(e) => setAcceptDataPolicy(e.target.checked)}
                        required
                      />
                      <span>
                        Acepto la{" "}
                        <button
                          type="button"
                          className="linkBtn"
                          onClick={() => setOpenPolicy(true)}
                        >
                          política de tratamiento de datos
                        </button>{" "}
                        <span className="req">*</span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* ===================== ACTIONS ===================== */}
              <div className="formActions">
                <button
                  className="btnPrimary"
                  type="submit"
                  disabled={!canSubmit || isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar registro"}
                </button>
              </div>

              {errorMsg && (
                <p className="formHint" style={{ color: "crimson" }}>
                  {errorMsg}
                </p>
              )}

              <p className="formHint">
                Campos obligatorios: todos. Asegúrate de diligenciar cada
                sección.
              </p>
            </form>
          </div>

          <div className="card span-4">
            <h3>ℹ️ Info</h3>
            <ul className="section-list">
              <li>
                Precio del retiro:<strong> $300.000 COP</strong>{" "}
              </li>
              <li>Recuerda usar un correo real para futuras notificaciones.</li>
              <li>La contraseña debe tener mínimo 8 caracteres.</li>
              <li>
                <span>
                  Si necesitas apoyo o tienes algún problema con el formulario,
                  puedes escribir a este numero:
                </span>
                <a
                  className="pill"
                  href="https://wa.me/573017201658"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img className="icon" src={whatsapp_logo} alt="WhatsApp" />
                  <span>
                    <strong>WhatsApp:</strong> 301-720-1658
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {/* =============== MODAL REGISTRO EXITOSO =============== */}
      {successId && (
        <div className="modalOverlay successOverlay" role="dialog" aria-modal="true">
          <div className="modalCard successCard">
            <div className="modalHead">
              <h3>🎉 ¡Felicitaciones!</h3>
              <button
                type="button"
                className="modalClose"
                onClick={() => navigate("/")}
              >
                ✕
              </button>
            </div>
            <div className="modalBody" style={{ whiteSpace: "normal" }}>
              <p>
                Tu inscripción ha sido registrada con éxito. Estamos felices
                y te esperamos en nuestro próximo <strong>XVI Retiro de ITER 4.12</strong>.
              </p>
              <p>
                Para más información, comunícate con uno de nuestros
                coordinadores:
              </p>
              <p>
                <strong>Karen Cruz</strong> (Coordinadora): 319-618-8804
                <br />
                <strong>Yostin Arteaga</strong> (Coordinador): 319-557-1763
              </p>
              <p className="successNumber">
                Tu número de registro es:
                <strong>{registrationNumber}</strong>
              </p>
            </div>
            <div className="modalActions successActions">
              <button
                type="button"
                className="btnGhost"
                onClick={() => navigate("/")}
              >
                Volver
              </button>
              <button
                type="button"
                className="btnPrimary"
                onClick={() => window.location.reload()}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============== MODAL TÉRMINOS =============== */}
      {openTerms && (
        <div className="modalOverlay" role="dialog" aria-modal="true">
          <div className="modalCard">
            <div className="modalHead">
              <h3>Términos y condiciones</h3>
              <button
                type="button"
                className="modalClose"
                onClick={() => setOpenTerms(false)}
              >
                ✕
              </button>
            </div>
            <pre className="modalBody">
              <TermsAndConditions />
            </pre>
            <div className="modalActions">
              <button
                type="button"
                className="btnPrimary"
                onClick={() => setOpenTerms(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============== MODAL POLÍTICA =============== */}
      {openPolicy && (
        <div className="modalOverlay" role="dialog" aria-modal="true">
          <div className="modalCard">
            <div className="modalHead">
              <h3>Política de datos</h3>
              <button
                type="button"
                className="modalClose"
                onClick={() => setOpenPolicy(false)}
              >
                ✕
              </button>
            </div>
            <pre className="modalBody">{DATA_POLICY_TEXT}</pre>
            <div className="modalActions">
              <button
                type="button"
                className="btnPrimary"
                onClick={() => setOpenPolicy(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RegisterServidorView;
