import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";

const SWIPE_THRESHOLD_PX = 40;

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Estado compartido por los carruseles de "¿Quiénes somos?": índice actual, avance automático
 * (se pausa con el mouse encima, con foco dentro o si el usuario pidió menos movimiento) y
 * gesto de deslizar en pantallas táctiles.
 */
export const useCarousel = (length: number, intervalMs: number, externallyPaused = false) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const swipeStartX = useRef<number | null>(null);
  // true si el último gesto fue un deslizamiento: el "click" que algunos navegadores disparan
  // al soltar no debe contar como toque (p. ej. para no abrir la foto ampliada).
  const justSwiped = useRef(false);

  // Si la lista cambia de tamaño (p. ej. llegan los testimonios), no quedarse fuera de rango.
  useEffect(() => {
    if (index >= length) setIndex(0);
  }, [index, length]);

  const goTo = useCallback((i: number) => setIndex(((i % length) + length) % length), [length]);
  const next = useCallback(() => setIndex((i) => (i + 1) % Math.max(length, 1)), [length]);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + Math.max(length, 1)) % Math.max(length, 1)),
    [length]
  );

  // El índice va en las dependencias para que el temporizador se reinicie tras un cambio manual.
  useEffect(() => {
    if (paused || externallyPaused || length < 2 || prefersReducedMotion()) return;
    const id = window.setTimeout(next, intervalMs);
    return () => window.clearTimeout(id);
  }, [paused, externallyPaused, length, intervalMs, next, index]);

  const rootProps = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocus: () => setPaused(true),
    onBlur: () => setPaused(false),
    onPointerDown: (e: PointerEvent) => {
      justSwiped.current = false;
      if (e.pointerType !== "mouse") swipeStartX.current = e.clientX;
    },
    onPointerUp: (e: PointerEvent) => {
      if (swipeStartX.current == null) return;
      const dx = e.clientX - swipeStartX.current;
      swipeStartX.current = null;
      if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;
      justSwiped.current = true;
      if (dx < 0) next();
      else prev();
    },
    onPointerCancel: () => {
      swipeStartX.current = null;
    },
  };

  return { index, goTo, next, prev, rootProps, justSwiped };
};
