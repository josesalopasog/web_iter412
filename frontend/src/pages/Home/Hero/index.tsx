import AnimatedBorder from "../../../components/AnimatedBorder";
import "./styles.css";

const Hero = () => {
  return (
    <section id="home" className="hero" aria-label="Inicio">
      <div className="hero-content">
        <h1>Iter 4.12 - ¡Por Dios y Para Dios!</h1>
        <p>
          Únete a nosotros en este viaje de crecimiento
          espiritual, diversión y hermandad en nuestro proximo retiro.
        </p>
      </div>
      <AnimatedBorder text="Inscríbete Ahora" href="/register" />
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
