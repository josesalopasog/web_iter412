import instagram_logo from "../../../assets/svg/Instagram.svg";
import whatsapp_logo from "../../../assets/svg/WhatsApp.svg";
import { useMemo, useState } from "react";

import "./styles.css";

const TO_EMAIL = "iter4.12bogota@gmail.com";

const Contact = () => {
  const [name, setName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [subject, setSubject] = useState("Quiero información del retiro");
  const [message, setMessage] = useState("");

  const mailtoHref = useMemo(() => {
    const body = [
      `Nombre: ${name || "-"}`,
      `Correo: ${fromEmail || "-"}`,
      "",
      message || "",
    ].join("\n");

    const params = new URLSearchParams({
      subject,
      body,
    });

    return `mailto:${TO_EMAIL}?${params.toString()}`;
  }, [name, fromEmail, subject, message]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    window.location.href = mailtoHref;
  };

  return (
    <section id="contact" aria-label="Contacto">
      <div className="container">
        <div className="section-head">
          <h2>Contacto</h2>
          <h3>¿Quieres saber más o unirte a nosotros?</h3>
          <p className="sub">
            Envíanos un mensaje y se abrirá tu correo con el texto listo para
            enviar.
          </p>
        </div>

        <div>
          <div className="card">
            <h3>📨 Enviar correo</h3>

            <form className="contactForm" onSubmit={onSubmit}>
              <div className="formRow">
                <label className="formLabel" htmlFor="name">
                  Nombre
                </label>
                <input
                  id="name"
                  className="formInput"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  autoComplete="name"
                />
              </div>

              <div className="formRow">
                <label className="formLabel" htmlFor="fromEmail">
                  Tu correo
                </label>
                <input
                  id="fromEmail"
                  className="formInput"
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="tucorreo@gmail.com"
                  autoComplete="email"
                />
              </div>

              <div className="formRow">
                <label className="formLabel" htmlFor="subject">
                  Asunto
                </label>
                <input
                  id="subject"
                  className="formInput"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Asunto"
                />
              </div>

              <div className="formRow">
                <label className="formLabel" htmlFor="message">
                  Mensaje
                </label>
                <textarea
                  id="message"
                  className="formTextarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  rows={6}
                  required
                />
              </div>

              <div className="formActions">
                <button className="btnPrimary" type="submit">
                  Enviar
                </button>

                <a className="btnGhost" href={mailtoHref}>
                  Abrir correo
                </a>
              </div>

              <p className="formHint">
                Se abrirá tu aplicación de correo con el mensaje listo. Solo
                debes enviarlo.
              </p>
            </form>

            <p className="contactEmail">
              O escríbenos directamente:{" "}
              <a href={`mailto:${TO_EMAIL}`}>{TO_EMAIL}</a>
            </p>
          </div>
        </div>
        <div className="pills-container">
          <a
            className="pill"
            href="https://www.instagram.com/iter4.12bogota/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img className="icon" src={instagram_logo} alt="Instagram" />
            <span>
              <strong>Instagram:</strong> @iter.412bogota
            </span>
          </a>

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
                    <a
            className="pill"
            href="https://wa.me/573136106277"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img className="icon" src={whatsapp_logo} alt="WhatsApp" />
            <span>
              <strong>WhatsApp</strong> 313-610-6277
            </span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Contact;
