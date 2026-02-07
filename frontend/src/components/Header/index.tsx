import AnimatedBorder from "../AnimatedBorder";
import "./styles.css";

const Header = () => {
    return (
        <header>
                <div className="header-first-column">
                    <img src="/logo.png" alt="Logo" className="header-logo" />
                </div>
                <nav className="header-second-column">
                    <ul className="header-ul">
                        <li><a href="#home">Inicio</a></li>
                        <li><a href="#about">Quienes Somos</a></li>
                        <li><a href="#location">Donde Estamos</a></li>
                        <li><a href="#schedule">Cronograma</a></li>
                        <li><a href="#contact">Contacto</a></li>
                    </ul>
                </nav>
                <div className="header-third-column">
                    <AnimatedBorder text="Inscribirse" />
                </div>
        </header>
    );
}

export default Header;