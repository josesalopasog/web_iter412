import type { Testimonial } from "../../../api/testimonials";
import { useCarousel } from "./useCarousel";

const AUTOPLAY_MS = 7000;

type Props = {
  testimonials: Testimonial[];
};

const TestimonialCarousel = ({ testimonials }: Props) => {
  const { index, goTo, rootProps } = useCarousel(testimonials.length, AUTOPLAY_MS);

  return (
    <div
      className="testimonialCarousel"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Testimonios de servidores"
      {...rootProps}
    >
      {/* Todas las tarjetas ocupan la misma celda de la grilla: el alto lo marca la más larga
          y el cambio es un fundido, sin saltos de tamaño. */}
      <div className="testimonialStack">
        {testimonials.map((t, i) => (
          <blockquote
            key={t.id}
            className={`testimonialSlide${i === index ? " is-active" : ""}`}
            aria-hidden={i !== index}
          >
            <p className="testimonialText">{t.text}</p>
            <p className="testimonialAuthor">- {t.author}</p>
          </blockquote>
        ))}
      </div>

      {testimonials.length > 1 && (
        <div className="carouselDots">
          {testimonials.map((t, i) => (
            <button
              key={t.id}
              type="button"
              className={`carouselDot${i === index ? " is-active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Ver testimonio ${i + 1} de ${testimonials.length}`}
              aria-current={i === index}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TestimonialCarousel;
