import "./styles.css";

// En public/ (no en src/assets): así el mismo archivo lo puede usar tanto este componente como
// la pantalla de carga estática de index.html, que se pinta antes de que cargue el JS y no puede
// importar nada del bundle.
const LOGO_OUTLINE_SRC = "/loading-logo.webp";

type SpinnerProps = {
  size?: number;
};

export const Spinner = ({ size = 72 }: SpinnerProps) => (
  <div className="spinner" style={{ height: `${size}px`, width: `${size}px` }} aria-hidden="true">
    {/* Base: el logo siempre visible, en gris claro. */}
    <img src={LOGO_OUTLINE_SRC} alt="" className="spinner-base" />
    {/* Encima, el mismo logo a color, recortado por una franja diagonal que se desliza: el color
        "pasa" en diagonal por el logo, como en la pantalla de carga de Rockstar Games. */}
    <img src={LOGO_OUTLINE_SRC} alt="" className="spinner-shine" />
  </div>
);

type PageLoaderProps = {
  /** "fullscreen" cubre toda la pantalla; "inline" se integra dentro de la página. */
  variant?: "fullscreen" | "inline";
  label?: string;
};

export const PageLoader = ({ variant = "fullscreen", label = "Cargando" }: PageLoaderProps) => (
  <div className={`pageLoader pageLoader--${variant}`} role="status" aria-live="polite" aria-label={label}>
    <Spinner size={variant === "fullscreen" ? 108 : 84} />
    {variant === "inline" && <span>{label}…</span>}
  </div>
);

export default PageLoader;
