import "./styles.css";

const About = () => {
  return (
    <section id="about" aria-label="Quienes Somos">
      <div className="container">
        <div className="section-head">
          <h2>¿ Quiénes Somos ?</h2>
          <h3>Jóvenes amigos adoradores y seguidores de Cristo. </h3>
          <p className="sub">
            Realizamos retiros de jóvenes para jóvenes. Un espacio para encontrarnos con Cristo y con nosotros mismos.
            Somos un grupo de amigos con un amigo en común, Jesús. Y Él como buen amigo, nos reune y nos convoca semana a semana para seguir construyendo el Reino de los Cielos aqui en la Tierra.
          </p>
        </div>

        <div className="grid">
          <div className="card span-4">
            <h3>💚 Autenticidad</h3>
            <p>
              Dios nos llama a ser plenamente nosostros mismos. Aquí sabemos que quien eres es más que suficiente para Dios.
            </p>
          </div>
          <div className="card span-4">
            <h3>❤️ Servicio</h3>
            <p>
              Somos amados, amamos y amamos mucho. La entrega total es la más valiosa enseñanza que nos dejó Jesús. Si te gusta servir, atrévete a dejarte amar y amar con nosotros
            </p>
          </div>
          <div className="card span-4">
            <h3>💜 Abrazo</h3>
            <p>
              En un abrazo, dos corazones se juntan. Cristo esta aquí para abrazarnos y acercar su corazón al nuestro, a lo que somos y a lo que tenemos, con heridas incluidas. Ven y recibe el abrazo de Jesús.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
