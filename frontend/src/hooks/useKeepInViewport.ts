import { useLayoutEffect } from "react";
import type { RefObject } from "react";

const MARGIN = 8;

// Si un menú desplegable se sale de la pantalla (p. ej. en celular, cuando el botón está pegado al
// borde), lo corre lo justo para que quede adentro. Usa `translate` para no pisar `transform`.
export const useKeepInViewport = (ref: RefObject<HTMLElement | null>) => {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.translate = "";
    const rect = el.getBoundingClientRect();
    const maxRight = window.innerWidth - MARGIN;
    const maxBottom = window.innerHeight - MARGIN;

    let dx = 0;
    if (rect.right > maxRight) dx = maxRight - rect.right;
    if (rect.left + dx < MARGIN) dx = MARGIN - rect.left;

    let dy = 0;
    if (rect.bottom > maxBottom) dy = maxBottom - rect.bottom;
    if (rect.top + dy < MARGIN) dy = MARGIN - rect.top;

    if (dx || dy) el.style.translate = `${dx}px ${dy}px`;
  });
};
