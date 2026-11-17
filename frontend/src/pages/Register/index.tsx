import "./styles.css";
import { Link } from "react-router-dom";
import { usePublicSettings } from "../../hooks/usePublicSettings";
import { useRegisterSoldadoForm } from "./form/useRegisterSoldadoForm";
import { RegisterView } from "./ui/RegisterView";

// Página del retiro: si el equipo la cerró (Gestión → Ajustes del retiro), muestra un aviso en vez
// de la información y el formulario.
const Register = () => {
  const { retreatInfoOpen } = usePublicSettings();
  const form = useRegisterSoldadoForm();

  if (retreatInfoOpen === false) {
    return (
      <section id="register" className="retreatClosed" aria-label="Retiro">
        <div className="retreatClosedCard">
          <span className="retreatClosedIcon" aria-hidden="true">
            ⛰️
          </span>
          <h2>Pronto abriremos las inscripciones del próximo retiro</h2>
          <p>
            Estamos preparando todo para el siguiente retiro de ITER 4.12. Muy pronto podrás ver aquí la información y
            reservar tu cupo. ¡Te esperamos!
          </p>
          <Link to="/" className="retreatClosedLink">
            ← Volver al inicio
          </Link>
        </div>
      </section>
    );
  }

  return <RegisterView {...form} />;
};

export default Register;
