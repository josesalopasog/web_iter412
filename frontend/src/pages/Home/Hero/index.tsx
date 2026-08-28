import AnimatedBorder from "../../../components/AnimatedBorder";
import "./styles.css";

const Hero = () => {
  return (
    <section id="home" className="hero" aria-label="Inicio">
      <div className="hero-content">
        <h1>ITER 4.12 - ¡Por Dios y Para Dios!</h1>
        <p>
          Te invitamos a vivir el mejor fin de semana de tu vida. <br/>
          Haz click en el botón de abajo e inscribete a nuestro retiro de jovenes. <br/>
          ¡Dios te esta esperando!
          
        </p>
      </div>
      <AnimatedBorder text="Quiero Inscribirme" href="/inscribirme" />
      <a
        className="hero-badge"
        href="https://maps.app.goo.gl/2ZUtXhdHfwwY4QnT7"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>📍 Bogotá</span>
        <span>•</span>
        <span>Parroquía La Consolata</span>
      </a>

      <div className="scroll-hint" aria-hidden="true">
        <div className="scroll-dot"></div>
        <span>Desliza para ver más</span>
      </div>
    </section>
  );
};

export default Hero;
