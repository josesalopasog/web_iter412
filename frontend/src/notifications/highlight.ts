const HIGHLIGHT_CLASS = "sectionHighlight";
const HIGHLIGHT_MS = 2600;

/**
 * Lleva la vista hasta un elemento y lo resalta un momento; el sombreado se desvanece solo
 * (la transición está en index.css). Reintenta unos instantes por si el elemento aún no existe
 * (p. ej. recién se navegó a otra página o el contenido todavía está cargando).
 */
export const highlightSection = (id: string, attempts = 20) => {
  const el = document.getElementById(id);
  if (!el) {
    if (attempts > 0) window.setTimeout(() => highlightSection(id, attempts - 1), 150);
    return;
  }
  // Centrado en pantalla (o arriba, si es más alto que la pantalla), dejando espacio al header fijo.
  const rect = el.getBoundingClientRect();
  const HEADER_SPACE = 90;
  const offset = rect.height < window.innerHeight - HEADER_SPACE ? (window.innerHeight - rect.height) / 2 : HEADER_SPACE;
  window.scrollTo({ top: Math.max(0, rect.top + window.scrollY - offset), behavior: "smooth" });
  el.classList.remove(HIGHLIGHT_CLASS);
  // Forzar reflow para que la animación arranque de nuevo si ya estaba resaltado.
  void el.offsetWidth;
  el.classList.add(HIGHLIGHT_CLASS);
  window.setTimeout(() => el.classList.remove(HIGHLIGHT_CLASS), HIGHLIGHT_MS);
};
