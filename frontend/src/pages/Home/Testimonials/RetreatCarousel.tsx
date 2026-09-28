import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useCarousel } from "./useCarousel";

const ROMAN: Record<string, number> = { i: 1, v: 5, x: 10, l: 50, c: 100 };

const romanToNumber = (roman: string) => {
  let total = 0;
  for (let i = 0; i < roman.length; i++) {
    const value = ROMAN[roman[i]] ?? 0;
    const nextValue = ROMAN[roman[i + 1]] ?? 0;
    total += value < nextValue ? -value : value;
  }
  return total;
};

// Basta con soltar una imagen nueva "retiro-<romano>.webp" en assets/images/retiros para que
// aparezca aquí, ya ordenada del retiro más reciente al más antiguo.
const imageModules = import.meta.glob<string>("../../../assets/images/retiros/retiro-*.webp", {
  eager: true,
  import: "default",
});

const SLIDES = Object.entries(imageModules)
  .map(([path, src]) => {
    const roman = path.match(/retiro-([ivxlc]+)\.webp$/i)?.[1].toLowerCase() ?? "";
    return { src, roman: roman.toUpperCase(), number: romanToNumber(roman) };
  })
  .sort((a, b) => b.number - a.number);

const AUTOPLAY_MS = 5000;

type Slide = (typeof SLIDES)[number];

type LightboxProps = {
  slide: Slide;
  position: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  /** Para no cerrar al soltar un deslizamiento sobre el fondo (móvil). */
  justSwiped: { current: boolean };
};

// Foto ampliada. Va por portal a <body>: la sección está dentro de un Reveal con transform, que
// rompería position: fixed. Muestra la misma foto que el carrusel, así al cerrarla este queda en
// la última que se vio. Los deslizamientos llegan por el árbol de React hasta el carrusel.
const PhotoLightbox = ({ slide, position, onPrev, onNext, onClose, justSwiped }: LightboxProps) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const stop = (e: MouseEvent) => e.stopPropagation();

  return createPortal(
    <div
      className="photoLightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Foto del retiro ${slide.roman}`}
      onClick={() => {
        if (!justSwiped.current) onClose();
      }}
    >
      <button
        type="button"
        className="photoLightboxClose"
        onClick={onClose}
        aria-label="Cerrar foto"
        autoFocus
      >
        ✕
      </button>

      {SLIDES.length > 1 && (
        <>
          <button
            type="button"
            className="photoLightboxArrow is-prev"
            onClick={(e) => {
              stop(e);
              onPrev();
            }}
            aria-label="Foto anterior"
          >
            ‹
          </button>
          <button
            type="button"
            className="photoLightboxArrow is-next"
            onClick={(e) => {
              stop(e);
              onNext();
            }}
            aria-label="Foto siguiente"
          >
            ›
          </button>
        </>
      )}

      <figure className="photoLightboxFigure" onClick={stop}>
        {/* key: al cambiar de foto se vuelve a montar y repite la animación de entrada. */}
        <img key={slide.src} src={slide.src} alt={`Foto del retiro ${slide.roman} de ITER 4.12`} draggable={false} />
        <figcaption>
          Retiro {slide.roman}
          <span className="photoLightboxCount">
            {position + 1} / {SLIDES.length}
          </span>
        </figcaption>
      </figure>
    </div>,
    document.body
  );
};

const RetreatCarousel = () => {
  const [zoomOpen, setZoomOpen] = useState(false);
  const { index, goTo, next, prev, rootProps, justSwiped } = useCarousel(SLIDES.length, AUTOPLAY_MS, zoomOpen);

  // Carga diferida: solo se piden la foto actual y sus vecinas; las ya vistas se conservan.
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0, 1, SLIDES.length - 1]));
  useEffect(() => {
    setLoaded((prevSet) => {
      const wanted = [index, (index + 1) % SLIDES.length, (index - 1 + SLIDES.length) % SLIDES.length];
      if (wanted.every((i) => prevSet.has(i))) return prevSet;
      return new Set([...prevSet, ...wanted]);
    });
  }, [index]);

  if (!SLIDES.length) return null;

  return (
    <div
      className="retreatColumn"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Fotos de nuestros retiros"
      {...rootProps}
    >
      <div className="retreatCarousel">
        <div className="retreatTrack" style={{ transform: `translateX(-${index * 100}%)` }}>
          {SLIDES.map((slide, i) => (
            <figure
              key={slide.src}
              className="retreatSlide"
              aria-roledescription="diapositiva"
              aria-label={`${i + 1} de ${SLIDES.length}`}
              aria-hidden={i !== index}
            >
              {loaded.has(i) && (
                <button
                  type="button"
                  className="retreatZoomBtn"
                  onClick={() => {
                    if (!justSwiped.current) setZoomOpen(true);
                  }}
                  aria-label={`Ampliar foto del retiro ${slide.roman}`}
                  tabIndex={i === index ? 0 : -1}
                >
                  <img src={slide.src} alt={`Foto del retiro ${slide.roman} de ITER 4.12`} draggable={false} />
                </button>
              )}
              <figcaption className="retreatCaption">Retiro {slide.roman}</figcaption>
            </figure>
          ))}
        </div>

        <button type="button" className="carouselArrow is-prev" onClick={prev} aria-label="Foto anterior">
          ‹
        </button>
        <button type="button" className="carouselArrow is-next" onClick={next} aria-label="Foto siguiente">
          ›
        </button>
      </div>

      {/* Debajo de la foto y no encima: muchas imágenes traen texto abajo (fecha del retiro). */}
      <div className="carouselDots">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            className={`carouselDot${i === index ? " is-active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Ver retiro ${slide.roman}`}
            aria-current={i === index}
          />
        ))}
      </div>

      {zoomOpen && (
        <PhotoLightbox
          slide={SLIDES[index]}
          position={index}
          onPrev={prev}
          onNext={next}
          onClose={() => setZoomOpen(false)}
          justSwiped={justSwiped}
        />
      )}
    </div>
  );
};

export default RetreatCarousel;
