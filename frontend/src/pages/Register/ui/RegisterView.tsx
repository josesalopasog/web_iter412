import type React from "react";
import type { UseRegisterSoldadoFormReturn } from "../form/useRegisterSoldadoForm";
import type {
  Gender,
  DocumentType,
  YesNo,
  Occupation,
  HearAbout,
  ShirtSize,
  Sacrament,
  Restriction,
} from "../form/types";

type Props = UseRegisterSoldadoFormReturn;

export const RegisterView: React.FC<Props> = ({
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

  toggleSacrament,
  toggleRestriction,
  onSubmit,
  canSubmit,

  isLoading,
  successId,
  errorMsg,
}) => {
  const SACRAMENTS: Sacrament[] = [
    "NINGUNO",
    "BAUTISMO",
    "PRIMERA_COMUNION",
    "CONFIRMACION",
    "MATRIMONIO",
    "ORDENACION",
  ];

  const RESTRICTIONS: Restriction[] = [
    "NINGUNA",
    "PROBLEMAS_DORMIR_SOLO",
    "ALERGIAS",
    "TOMA_MEDICAMENTOS",
    "RESTRICCION_ALIMENTICIA",
    "OTRO",
  ];

  return (
    <section id="register" aria-label="Registro Retiro">
      <div className="container">
        <div className="section-head">
          <h2>Inscripción al Retiro</h2>
          <h3>Completa tus datos para reservar tu cupo</h3>
          <p className="sub">
            ¡Bienvenido/a! Dios te ha llamado para vivir el XV retiro de la comunidad ITER 4.12 Bogotá
            los días 1,2 y 3 de mayo del 2026.
          </p>
        </div>

        <div className="grid">
          <div className="card span-8">
            <h3>📝 Formulario (Soldado)</h3>

            <form className="registerForm" onSubmit={onSubmit}>
              {/* Antes de comenzar */}
              <div className="formSection">
                <h4 className="formTitle">Antes de comenzar</h4>

                <div className="formGrid">
                  <div className="formRow">
                    <label className="formLabel" htmlFor="gender">
                      Género <span className="req">*</span>
                    </label>
                    <select
                      id="gender"
                      className="formSelect"
                      value={gender}
                      onChange={(e) => setGender(e.target.value as Gender)}
                      required
                    >
                      <option value="Femenino">Mujer</option>
                      <option value="Masculino">Hombre</option>
                    </select>
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="isSurprise">
                      ¿Es sorpresa? <span className="req">*</span>
                    </label>
                    <select
                      id="isSurprise"
                      className="formSelect"
                      value={isSurprise}
                      onChange={(e) => setIsSurprise(e.target.value as YesNo)}
                      required
                    >
                      <option value="NO">NO</option>
                      <option value="SI">SI</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Datos personales */}
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
                    />
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="preferredName">
                      ¿Cómo te gusta que te digan? <span className="req">*</span>
                    </label>
                    <input
                      id="preferredName"
                      className="formInput"
                      value={preferredName}
                      onChange={(e) => setPreferredName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="documentType">
                      Tipo de documento <span className="req">*</span>
                    </label>
                    <select
                      id="documentType"
                      className="formSelect"
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                      required
                    >
                      <option value="TI">Tarjeta de identidad</option>
                      <option value="CC">Cédula de ciudadanía</option>
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
                    />
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="birthDate">
                      Fecha de nacimiento <span className="req">*</span>
                    </label>
                    <input
                      id="birthDate"
                      className="formInput"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="phone">
                      Celular/WhatsApp <span className="req">*</span>
                    </label>
                    <input
                      id="phone"
                      className="formInput"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
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
                      required
                    />
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="city">
                      Ciudad <span className="req">*</span>
                    </label>
                    <input
                      id="city"
                      className="formInput"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="neighborhood">
                      Barrio <span className="req">*</span>
                    </label>
                    <input
                      id="neighborhood"
                      className="formInput"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Salud */}
              <div className="formSection">
                <h4 className="formTitle">Información médica</h4>

                <div className="formGrid">
                  <div className="formRow">
                    <label className="formLabel" htmlFor="eps">
                      EPS <span className="req">*</span>
                    </label>
                    <input id="eps" className="formInput" value={eps} onChange={(e) => setEps(e.target.value)} required />
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
                    />
                  </div>

                  <div className="formRow formRowFull">
                    <span className="formLabel">Restricciones <span className="req">*</span></span>
                    <div className="checkGrid">
                      {RESTRICTIONS.map((r) => (
                        <label key={r} className="checkRow">
                          <input
                            type="checkbox"
                            checked={restrictions.includes(r)}
                            onChange={() => toggleRestriction(r)}
                          />
                          <span>{r}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {restrictions.includes("OTRO") && (
                    <div className="formRow formRowFull">
                      <label className="formLabel" htmlFor="restrictionsOther">
                        Otras restricciones <span className="req">*</span>
                      </label>
                      <input
                        id="restrictionsOther"
                        className="formInput"
                        value={restrictionsOther}
                        onChange={(e) => setRestrictionsOther(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {restrictions.includes("TOMA_MEDICAMENTOS") && (
                    <div className="formRow formRowFull">
                      <label className="formLabel" htmlFor="medicationsDetail">
                        Medicamentos (nombre y hora) <span className="req">*</span>
                      </label>
                      <input
                        id="medicationsDetail"
                        className="formInput"
                        value={medicationsDetail}
                        onChange={(e) => setMedicationsDetail(e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Fe */}
              <div className="formSection">
                <h4 className="formTitle">Religión / Sacramentos</h4>

                <div className="formGrid">
                  <div className="formRow">
                    <label className="formLabel" htmlFor="practicesReligion">
                      ¿Practicas alguna religión? <span className="req">*</span>
                    </label>
                    <select
                      id="practicesReligion"
                      className="formSelect"
                      value={practicesReligion}
                      onChange={(e) => setPracticesReligion(e.target.value as YesNo)}
                      required
                    >
                      <option value="NO">NO</option>
                      <option value="SI">SI</option>
                    </select>
                  </div>

                  {practicesReligion === "SI" && (
                    <div className="formRow">
                      <label className="formLabel" htmlFor="whichReligion">
                        ¿Cuál? <span className="req">*</span>
                      </label>
                      <input
                        id="whichReligion"
                        className="formInput"
                        value={whichReligion}
                        onChange={(e) => setWhichReligion(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="formRow formRowFull">
                    <span className="formLabel">Sacramentos <span className="req">*</span></span>
                    <div className="checkGrid">
                      {SACRAMENTS.map((s) => (
                        <label key={s} className="checkRow">
                          <input type="checkbox" checked={sacraments.includes(s)} onChange={() => toggleSacrament(s)} />
                          <span>{s}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ocupación */}
              <div className="formSection">
                <h4 className="formTitle">Ocupación</h4>

                <div className="formGrid">
                  <div className="formRow">
                    <label className="formLabel" htmlFor="occupation">
                      Ocupación <span className="req">*</span>
                    </label>
                    <select
                      id="occupation"
                      className="formSelect"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value as Occupation)}
                      required
                    >
                      <option value="ESTUDIANTE-COLEGIO">Estudiante - colegio</option>
                      <option value="ESTUDIANTE-SUPERIOR">Estudiante - educación superior</option>
                      <option value="TRABAJADOR">Trabajador</option>
                      <option value="SIN OCUPACION">Sin ocupación</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>

                  {occupation === "OTRO" && (
                    <div className="formRow">
                      <label className="formLabel" htmlFor="occupationOther">
                        ¿Cuál? <span className="req">*</span>
                      </label>
                      <input
                        id="occupationOther"
                        className="formInput"
                        value={occupationOther}
                        onChange={(e) => setOccupationOther(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="formRow">
                    <label className="formLabel" htmlFor="occupationPlace">
                      Lugar donde te desempeñas <span className="req">*</span>
                    </label>
                    <input
                      id="occupationPlace"
                      className="formInput"
                      value={occupationPlace}
                      onChange={(e) => setOccupationPlace(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Camiseta */}
              <div className="formSection">
                <h4 className="formTitle">Camiseta</h4>

                <div className="formGrid">
                  <div className="formRow">
                    <label className="formLabel" htmlFor="shirtSize">
                      Talla <span className="req">*</span>
                    </label>
                    <select
                      id="shirtSize"
                      className="formSelect"
                      value={shirtSize}
                      onChange={(e) => setShirtSize(e.target.value as ShirtSize)}
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
                </div>
              </div>

              {/* Emergencia */}
              <div className="formSection">
                <h4 className="formTitle">Contacto de emergencia</h4>

                <div className="formGrid">
                  <div className="formRow">
                    <label className="formLabel" htmlFor="emergencyName">
                      Nombre completo <span className="req">*</span>
                    </label>
                    <input
                      id="emergencyName"
                      className="formInput"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
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

              {/* Comunidad */}
              <div className="formSection">
                <h4 className="formTitle">Relación con la comunidad</h4>

                <div className="formGrid">
                  <div className="formRow">
                    <label className="formLabel" htmlFor="hearAbout">
                      ¿Por cuál medio te enteraste? <span className="req">*</span>
                    </label>
                    <select
                      id="hearAbout"
                      className="formSelect"
                      value={hearAbout}
                      onChange={(e) => setHearAbout(e.target.value as HearAbout)}
                      required
                    >
                      <option value="CONOZCO_ALGUIEN">Conozco a alguien</option>
                      <option value="REDES">Redes sociales</option>
                      <option value="QR">QR</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>

                  {hearAbout === "OTRO" && (
                    <div className="formRow">
                      <label className="formLabel" htmlFor="hearAboutOther">
                        ¿Cuál? <span className="req">*</span>
                      </label>
                      <input
                        id="hearAboutOther"
                        className="formInput"
                        value={hearAboutOther}
                        onChange={(e) => setHearAboutOther(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="formRow">
                    <label className="formLabel" htmlFor="invitedByCommunity">
                      ¿Has sido invitado por alguien de la comunidad? <span className="req">*</span>
                    </label>
                    <select
                      id="invitedByCommunity"
                      className="formSelect"
                      value={invitedByCommunity}
                      onChange={(e) => setInvitedByCommunity(e.target.value as YesNo)}
                      required
                    >
                      <option value="NO">NO</option>
                      <option value="SI">SI</option>
                    </select>
                  </div>

                  {invitedByCommunity === "SI" && (
                    <div className="formRow">
                      <label className="formLabel" htmlFor="invitedByName">
                        Nombre de quien te invitó <span className="req">*</span>
                      </label>
                      <input
                        id="invitedByName"
                        className="formInput"
                        value={invitedByName}
                        onChange={(e) => setInvitedByName(e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Aceptación */}
              <div className="formSection">
                <h4 className="formTitle">Aceptación</h4>

                <label className="checkRow">
                  <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
                  <span>
                    Acepto términos y condiciones <span className="req">*</span>
                  </span>
                </label>

                <label className="checkRow">
                  <input
                    type="checkbox"
                    checked={acceptDataPolicy}
                    onChange={(e) => setAcceptDataPolicy(e.target.checked)}
                  />
                  <span>
                    Acepto política de datos <span className="req">*</span>
                  </span>
                </label>
              </div>

              <div className="formActions">
                <button className="btnPrimary" type="submit" disabled={!canSubmit || isLoading}>
                  {isLoading ? "Enviando..." : "Enviar inscripción"}
                </button>
              </div>

              {errorMsg && <p className="formHint" style={{ color: "crimson" }}>{errorMsg}</p>}
              {successId && (
                <p className="formHint" style={{ color: "green" }}>
                  ✅ Registro exitoso. ID: <strong>{successId}</strong>
                </p>
              )}
            </form>
          </div>

          <div className="card span-4">
            <h3>ℹ️ Información</h3>
            <ul className="section-list">
              <li>Completa todos los campos obligatorios.</li>
              <li>Si escoges “OTRO”, debes especificar el detalle.</li>
              <li>Si marcas “TOMA_MEDICAMENTOS”, debes indicar nombre y hora.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};