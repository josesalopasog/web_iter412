import "./styles.css";

const About = () => {
  return (
    <section id="about" aria-label="Quienes Somos">
      <div className="container">
        <div className="section-head">
          <h2>¿ Quienes Somos ?</h2>
          <h3>Una comunidad de jóvenes católicos. </h3>
          <p className="sub">
            Organizamos retiros y reuniones semanales para jóvenes en Bogotá con enfoque en
            crecimiento espiritual, vínculos sanos y servicio. 
          </p>
        </div>

        <div className="grid">
          <div className="card span-4">
            <h3>💚 Espiritualidad</h3>
            <p>
              Momentos de oración, adoración y espacios de silencio guiado para
              escuchar a Dios.
            </p>
          </div>
          <div className="card span-4">
            <h3>❤️ Comunidad</h3>
            <p>
              Dinámicas, grupos pequeños y acompañamiento para que no camines
              solo/a.
            </p>
          </div>
          <div className="card span-4">
            <h3>💜 Renovación</h3>
            <p>
              Talleres prácticos sobre identidad, propósito, afectividad y
              hábitos para tu día a día.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
