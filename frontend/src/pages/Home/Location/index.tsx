import "./styles.css";

const Location = () => {
  return (
    <section id="location" aria-label="Ubicación">
      <div className="container">
        <div className="section-head">
          <h2>¿ Dónde Estamos ?</h2>
          <h3>Bogotá, Colombia.</h3>

          <p className="sub">
            Nuestro hogar es la Parroquía Nuestra Señora de la Consolata. Aquella que nos acoge para nuestras reuniones semanales y al respaldo, el Centro de Espiritualidad María Consolata, la sede de nuestros retiros.
          </p>

          <div className="grid">
            <div className="card span-8">
              <h3>📍 Ubicación</h3>

              <div className="mapWrapper">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.7339069575416!2d-74.0970712!3d4.5957146!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9919b90bd1f3%3A0xd2dfaa1093b766d9!2sCentro%20De%20Espiritualidad%20Mar%C3%ADa%20Consolata!5e0!3m2!1ses!2sco!4v1738970000000"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="googleMap"
                  title="Centro de Espiritualidad María Consolata"
                  allowFullScreen
                />
              </div>

              <a
                href="https://maps.app.goo.gl/E2YyJycZgAG6wT7z6"
                target="_blank"
                rel="noopener noreferrer"
                className="mapLink"
              >
                Abrir en Google Maps
              </a>
            </div>

            <div className="card span-4">
              <h3>🧭 Requisitos para asistir a las reuniones</h3>
                <ul className="section-list">
                    <li>Querer.</li>
                    <li> Traer un corazón dispuesto.</li>
                    <li> Consultar las fechas en el cronograma. No todas las reuniones son abiertas para jovenes que no han realizado el retiro (Por eso deberias hacer el retiro).</li>
                    <li>¿Y para hacer el retiro? Sigue deslizando más abajo para ver como puedes vivir la mejor experiencia de tu vida.</li>
                </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;
