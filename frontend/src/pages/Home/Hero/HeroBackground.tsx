import { useEffect, useRef } from "react";
import sky from "../../../assets/webp/hero/sky.webp";
import mountainsBack from "../../../assets/webp/hero/mountains_back.webp";
import mountainsFront from "../../../assets/webp/hero/mountains_front.webp";
import brushGreen from "../../../assets/webp/hero/brush_green.webp";
import brushPurple from "../../../assets/webp/hero/brush_purple.webp";
import cross from "../../../assets/webp/hero/cross.webp";
import treesLeft from "../../../assets/webp/hero/trees_left.webp";
import treesRight from "../../../assets/webp/hero/trees_right.webp";
import youthSilhouette from "../../../assets/webp/hero/youth_silhouette.webp";
import "./HeroBackground.css";

type LayerKey =
  | "sky"
  | "mountains-back"
  | "brush-green"
  | "brush-purple"
  | "mountains-front"
  | "trees-left"
  | "trees-right"
  | "youth";

// Intensidad de parallax por capa: cuánto se mueve respecto al cursor. Las más "cercanas" a la
// cámara (cruz, pinceles, montañas del frente) se mueven más que el fondo (cielo).
const LAYERS: { key: LayerKey; src: string; className: string; intensity: number }[] = [
  { key: "sky", src: sky, className: "hb-sky", intensity: 0.02 },
  { key: "mountains-back", src: mountainsBack, className: "hb-mountains-back", intensity: 0.07 },
  { key: "brush-green", src: brushGreen, className: "hb-brush-green", intensity: 0.12 },
  { key: "brush-purple", src: brushPurple, className: "hb-brush-purple", intensity: 0.12 },
  { key: "mountains-front", src: mountainsFront, className: "hb-mountains-front", intensity: 0.15 },
];

const FRONT_LAYERS: { key: LayerKey; src: string; className: string; intensity: number }[] = [
  { key: "trees-left", src: treesLeft, className: "hb-trees-left", intensity: 0.14 },
  { key: "trees-right", src: treesRight, className: "hb-trees-right", intensity: 0.14 },
];

const YOUTH_LAYER = { key: "youth" as const, src: youthSilhouette, className: "hb-youth", intensity: 0.05 };

const CROSS_INTENSITY = 0.2;
const MAX_PARALLAX_PX = 55;
const CROSS_TILT_DEG = 2.5; // rotación casi imperceptible, solo un leve "peso" 3D
const LERP_FACTOR = 0.06;
const TABLET_BREAKPOINT = 1024;

/**
 * Fondo 2.5D del Hero: capas planas (imágenes ya recortadas) apiladas con profundidad simulada
 * vía parallax por mouse + una entrada escalonada. Todo en CSS transforms + rAF, sin librerías
 * 3D — las capas se mueven con requestAnimationFrame directo al DOM (sin setState) para no
 * disparar renders de React en cada frame.
 */
const HeroBackground = () => {
  const layerRefs = useRef<Partial<Record<LayerKey, HTMLDivElement | null>>>({});
  const crossRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return; // Deja todo estático: sin listeners ni loop de animación.

    const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!hasFinePointer) return; // Móvil/táctil: sin parallax por mouse (la composición se queda fija).

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = 0;

    const onMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const tick = () => {
      // Suavizado: la "cámara" persigue al cursor en vez de pegarse a él.
      currentX += (targetX - currentX) * LERP_FACTOR;
      currentY += (targetY - currentY) * LERP_FACTOR;

      // Tablet (con puntero fino, p. ej. trackpad): parallax reducido a la mitad.
      const scale = window.innerWidth < TABLET_BREAKPOINT ? 0.5 : 1;

      const applyTo = (el: HTMLElement | null | undefined, intensity: number) => {
        if (!el) return;
        const dx = currentX * intensity * MAX_PARALLAX_PX * scale;
        const dy = currentY * intensity * MAX_PARALLAX_PX * scale;
        el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      };

      for (const layer of LAYERS) applyTo(layerRefs.current[layer.key], layer.intensity);
      for (const layer of FRONT_LAYERS) applyTo(layerRefs.current[layer.key], layer.intensity);
      applyTo(layerRefs.current.youth, YOUTH_LAYER.intensity);

      if (crossRef.current) {
        const dx = currentX * CROSS_INTENSITY * MAX_PARALLAX_PX * scale;
        const dy = currentY * CROSS_INTENSITY * MAX_PARALLAX_PX * scale;
        const rotY = currentX * CROSS_TILT_DEG * scale;
        const rotX = -currentY * CROSS_TILT_DEG * scale;
        crossRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="hero-background" aria-hidden="true">
      {LAYERS.map((layer) => (
        <div
          key={layer.key}
          ref={(el) => {
            layerRefs.current[layer.key] = el;
          }}
          className={`hb-layer ${layer.className}`}
        >
          <img src={layer.src} alt="" />
        </div>
      ))}

      {/* Cruz: foco visual principal, con su propio flotar sutil además del parallax. */}
      <div ref={crossRef} className="hb-layer hb-cross">
        <img src={cross} alt="" className="hb-cross-img" />
      </div>

      {FRONT_LAYERS.map((layer) => (
        <div
          key={layer.key}
          ref={(el) => {
            layerRefs.current[layer.key] = el;
          }}
          className={`hb-layer ${layer.className}`}
        >
          <img src={layer.src} alt="" />
        </div>
      ))}

      <div
        ref={(el) => {
          layerRefs.current.youth = el;
        }}
        className={`hb-layer ${YOUTH_LAYER.className}`}
      >
        <img src={YOUTH_LAYER.src} alt="" />
      </div>
    </div>
  );
};

export default HeroBackground;
