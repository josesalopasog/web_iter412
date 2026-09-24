import "./styles.css";

type SpinnerProps = {
  size?: number;
};

export const Spinner = ({ size = 56 }: SpinnerProps) => (
  <div
    className="spinner"
    aria-hidden="true"
    style={{ "--spinner-size": `${size}px`, "--spinner-thickness": `${Math.max(3, size / 9)}px` } as React.CSSProperties}
  />
);

type PageLoaderProps = {
  /** "fullscreen" cubre toda la pantalla; "inline" se integra dentro de la página. */
  variant?: "fullscreen" | "inline";
  label?: string;
};

export const PageLoader = ({ variant = "fullscreen", label = "Cargando" }: PageLoaderProps) => (
  <div className={`pageLoader pageLoader--${variant}`} role="status" aria-live="polite" aria-label={label}>
    <Spinner size={variant === "fullscreen" ? 56 : 40} />
    {variant === "inline" && <span>{label}…</span>}
  </div>
);

export default PageLoader;
