import { useEffect, useState } from "react";
import Reveal from "../../../components/Reveal";
import { listRandomTestimonials } from "../../../api/testimonials";
import type { Testimonial } from "../../../api/testimonials";
import RetreatCarousel from "./RetreatCarousel";
import TestimonialCarousel from "./TestimonialCarousel";
import "./styles.css";

// Sección sin título entre "¿Quiénes somos?" y "¿Dónde estamos?": fotos de los retiros a la
// izquierda y testimonios de servidores (al azar en cada visita) a la derecha.
const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    let cancelled = false;
    listRandomTestimonials()
      .then((data) => {
        if (!cancelled) setTestimonials(data);
      })
      .catch(() => {
        // sin testimonios: el carrusel de fotos ocupa todo el ancho
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="testimonios" aria-label="Fotos de retiros y testimonios">
      <div className="container">
        <Reveal>
          <div className={`momentsGrid${testimonials.length ? "" : " is-photosOnly"}`}>
            <RetreatCarousel />
            {testimonials.length > 0 && <TestimonialCarousel testimonials={testimonials} />}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default Testimonials;
