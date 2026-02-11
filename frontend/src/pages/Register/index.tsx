import "./styles.css"

import { useMemo, useState } from "react";
import "./styles.css";

const TO_EMAIL = "comunidad@mariaconsolata.org.co";

type Gender = "" | "Femenino" | "Masculino" | "Otro" | "Prefiero no decirlo";

const Register = () => {
  const [gender, setGender] = useState<Gender>("");

  const [fullName, setFullName] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [eps, setEps] = useState("");
  const [bloodType, setBloodType] = useState("");

  const [religion, setReligion] = useState("");
  const [occupation, setOccupation] = useState("");

  const [sacraments, setSacraments] = useState<string[]>([]);
  const [shirtSize, setShirtSize] = useState("");

  const [allergies, setAllergies] = useState("");
  const [medications, setMedications] = useState("");
  const [dietary, setDietary] = useState("");

  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [howDidYouHear, setHowDidYouHear] = useState("");

  const [isSurprise, setIsSurprise] = useState(false);

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptDataPolicy, setAcceptDataPolicy] = useState(false);

  const mailtoHref = useMemo(() => {
    const body = [
      `Formulario de inscripción al retiro`,
      ``,
      `Género: ${gender || "-"}`,
      `Nombre completo: ${fullName || "-"}`,
      `Documento: ${documentId || "-"}`,
      `Edad: ${age || "-"}`,
      `Teléfono/WhatsApp: ${phone || "-"}`,
      `Correo: ${email || "-"}`,
      `Dirección: ${address || "-"}`,
      ``,
      `EPS: ${eps || "-"}`,
      `Tipo de sangre: ${bloodType || "-"}`,
      ``,
      `Religión: ${religion || "-"}`,
      `Ocupación: ${occupation || "-"}`,
      `Sacramentos: ${sacraments.length ? sacraments.join(", ") : "-"}`,
      `Talla camiseta: ${shirtSize || "-"}`,
      ``,
      `Alergias: ${allergies || "-"}`,
      `Medicamentos: ${medications || "-"}`,
      `Restricciones alimentarias: ${dietary || "-"}`,
      ``,
      `Contacto emergencia: ${emergencyName || "-"} / ${emergencyPhone || "-"}`,
      `¿Es sorpresa?: ${isSurprise ? "Sí" : "No"}`,
      `¿Cómo se enteró?: ${howDidYouHear || "-"}`,
      ``,
      `Acepta términos: ${acceptTerms ? "Sí" : "No"}`,
      `Acepta política de datos: ${acceptDataPolicy ? "Sí" : "No"}`,
    ].join("\n");

    const params = new URLSearchParams({
      subject: "Inscripción Retiro – ITER 4.12 Bogotá",
      body,
    });

    return `mailto:${TO_EMAIL}?${params.toString()}`;
  }, [
    gender,
    fullName,
    documentId,
    age,
    phone,
    email,
    address,
    eps,
    bloodType,
    religion,
    occupation,
    sacraments,
    shirtSize,
    allergies,
    medications,
    dietary,
    emergencyName,
    emergencyPhone,
    howDidYouHear,
    isSurprise,
    acceptTerms,
    acceptDataPolicy,
  ]);

  const toggleSacrament = (value: string) => {
    setSacraments((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    );
  };

  const canSubmit =
    gender &&
    fullName.trim() &&
    phone.trim() &&
    email.trim() &&
    acceptTerms &&
    acceptDataPolicy;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    window.location.href = mailtoHref;
  };

  return (
    <section id="register" aria-label="Registro Retiro">
      <div className="container">
        <div className="section-head">
          <h2>Inscripción al Retiro</h2>
          <h3>Completa tus datos para reservar tu cupo</h3>
          <p className="sub">
            ¡Bienvenido/a! Dios te ha llamado para vivir el XV retiro de la comunidad ITER 4.12 Bogotá los días 1,2 y 3 de mayo del 2026, diligencia el formulario y participa de esta increíble experiencia en la Casa de Retiros, Centro de Espiritualidad María Consolata (Carrera 24B No. 1D - 60, contiguo a la Parroquia Nuestra Señora de la Consolata).
          </p>
        </div>

        <div className="grid">
          <div className="card span-8">
            <h3>📝 Formulario</h3>

            <form className="registerForm" onSubmit={onSubmit}>
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
                      <option value="">Selecciona…</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Otro">Otro</option>
                      <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                    </select>
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="isSurprise">
                      ¿Es sorpresa?
                    </label>
                    <label className="switchRow">
                      <input
                        id="isSurprise"
                        type="checkbox"
                        checked={isSurprise}
                        onChange={(e) => setIsSurprise(e.target.checked)}
                      />
                      <span>Sí, es sorpresa</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="formSection">
                <h4 className="formTitle">Datos personales</h4>

                <div className="formGrid">
                  <div className="formRow">
                    <label className="formLabel" htmlFor="fullName">
                      Nombre completo <span className="req">*</span>
                    </label>
                    <input
                      id="fullName"
                      className="formInput"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nombre y apellidos"
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="documentId">
                      Documento
                    </label>
                    <input
                      id="documentId"
                      className="formInput"
                      value={documentId}
                      onChange={(e) => setDocumentId(e.target.value)}
                      placeholder="CC / TI"
                    />
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="age">
                      Edad
                    </label>
                    <input
                      id="age"
                      className="formInput"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Ej: 22"
                      inputMode="numeric"
                    />
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="phone">
                      WhatsApp <span className="req">*</span>
                    </label>
                    <input
                      id="phone"
                      className="formInput"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="300 000 0000"
                      inputMode="tel"
                      required
                    />
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="email">
                      Correo <span className="req">*</span>
                    </label>
                    <input
                      id="email"
                      className="formInput"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tucorreo@gmail.com"
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="address">
                      Dirección
                    </label>
                    <input
                      id="address"
                      className="formInput"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Barrio / dirección"
                    />
                  </div>
                </div>
              </div>

              <div className="formSection">
                <h4 className="formTitle">Información médica</h4>

                <div className="formGrid">
                  <div className="formRow">
                    <label className="formLabel" htmlFor="eps">
                      EPS
                    </label>
                    <input
                      id="eps"
                      className="formInput"
                      value={eps}
                      onChange={(e) => setEps(e.target.value)}
                      placeholder="Ej: SURA"
                    />
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="bloodType">
                      Tipo de sangre
                    </label>
                    <input
                      id="bloodType"
                      className="formInput"
                      value={bloodType}
                      onChange={(e) => setBloodType(e.target.value)}
                      placeholder="Ej: O+"
                    />
                  </div>

                  <div className="formRow formRowFull">
                    <label className="formLabel" htmlFor="allergies">
                      Alergias
                    </label>
                    <textarea
                      id="allergies"
                      className="formTextarea"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      placeholder="Si no tienes, escribe: Ninguna"
                      rows={3}
                    />
                  </div>

                  <div className="formRow formRowFull">
                    <label className="formLabel" htmlFor="medications">
                      Medicamentos
                    </label>
                    <textarea
                      id="medications"
                      className="formTextarea"
                      value={medications}
                      onChange={(e) => setMedications(e.target.value)}
                      placeholder="Si no tomas, escribe: Ninguno"
                      rows={3}
                    />
                  </div>

                  <div className="formRow formRowFull">
                    <label className="formLabel" htmlFor="dietary">
                      Restricciones alimentarias
                    </label>
                    <textarea
                      id="dietary"
                      className="formTextarea"
                      value={dietary}
                      onChange={(e) => setDietary(e.target.value)}
                      placeholder="Ej: vegetariana, sin lácteos…"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="formSection">
                <h4 className="formTitle">Información de fe</h4>

                <div className="formGrid">
                  <div className="formRow">
                    <label className="formLabel" htmlFor="religion">
                      Religión
                    </label>
                    <input
                      id="religion"
                      className="formInput"
                      value={religion}
                      onChange={(e) => setReligion(e.target.value)}
                      placeholder="Ej: Católica"
                    />
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="occupation">
                      Ocupación
                    </label>
                    <input
                      id="occupation"
                      className="formInput"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      placeholder="Estudio / trabajo"
                    />
                  </div>

                  <div className="formRow formRowFull">
                    <span className="formLabel">Sacramentos</span>
                    <div className="checkGrid">
                      {["Bautismo", "Primera Comunión", "Confirmación", "Matrimonio"].map(
                        (s) => (
                          <label key={s} className="checkRow">
                            <input
                              type="checkbox"
                              checked={sacraments.includes(s)}
                              onChange={() => toggleSacrament(s)}
                            />
                            <span>{s}</span>
                          </label>
                        )
                      )}
                    </div>
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="shirtSize">
                      Talla de camiseta
                    </label>
                    <select
                      id="shirtSize"
                      className="formSelect"
                      value={shirtSize}
                      onChange={(e) => setShirtSize(e.target.value)}
                    >
                      <option value="">Selecciona…</option>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="formSection">
                <h4 className="formTitle">Emergencia y otros</h4>

                <div className="formGrid">
                  <div className="formRow">
                    <label className="formLabel" htmlFor="emergencyName">
                      Contacto de emergencia
                    </label>
                    <input
                      id="emergencyName"
                      className="formInput"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="Nombre del contacto"
                    />
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="emergencyPhone">
                      Teléfono de emergencia
                    </label>
                    <input
                      id="emergencyPhone"
                      className="formInput"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="300 000 0000"
                      inputMode="tel"
                    />
                  </div>

                  <div className="formRow formRowFull">
                    <label className="formLabel" htmlFor="howDidYouHear">
                      ¿Cómo te enteraste del retiro?
                    </label>
                    <input
                      id="howDidYouHear"
                      className="formInput"
                      value={howDidYouHear}
                      onChange={(e) => setHowDidYouHear(e.target.value)}
                      placeholder="Instagram, amigos, parroquia…"
                    />
                  </div>
                </div>
              </div>

              <div className="formSection">
                <h4 className="formTitle">Aceptación</h4>

                <label className="checkRow">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    required
                  />
                  <span>
                    Acepto los términos y condiciones <span className="req">*</span>
                  </span>
                </label>

                <label className="checkRow">
                  <input
                    type="checkbox"
                    checked={acceptDataPolicy}
                    onChange={(e) => setAcceptDataPolicy(e.target.checked)}
                    required
                  />
                  <span>
                    Acepto la política de tratamiento de datos{" "}
                    <span className="req">*</span>
                  </span>
                </label>
              </div>

              <div className="formActions">
                <button className="btnPrimary" type="submit" disabled={!canSubmit}>
                  Enviar inscripción
                </button>

                <a className="btnGhost" href={mailtoHref}>
                  Abrir correo
                </a>
              </div>

              <p className="formHint">
                Campos obligatorios: género, nombre, WhatsApp, correo y aceptaciones.
              </p>
            </form>
          </div>

          <div className="card span-4">
            <h3>ℹ️ Información</h3>
            <ul className="section-list">
              <li>Revisa el cronograma para confirmar la fecha del retiro.</li>
              <li>Si tienes alergias o medicación, por favor detállalo.</li>
              <li>Si no puedes pagar el aporte completo, contáctanos.</li>
            </ul>

            <div style={{ marginTop: 14 }}>
              <a className="btnGhost" href={`mailto:${TO_EMAIL}`}>
                Escribir a {TO_EMAIL}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;