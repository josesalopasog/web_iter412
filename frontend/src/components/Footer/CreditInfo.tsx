import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./styles.css";

const AUTHOR_URL = "https://josesalopaso.com";

// Ícono "i": el mismo dibujo en gris (base) y con el degradado cyan→magenta (brillo que lo recorre).
const InfoGlyph = ({ stroke }: { stroke: string }) => (
  <>
    <circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth={1.8} />
    <path d="M12 11v5" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" />
    <circle cx="12" cy="7.8" r="1.1" fill={stroke} />
  </>
);

/**
 * Crédito de quién hizo la página: la "i" muestra el crédito al pasar el mouse y al hacer click
 * abre la vista previa de la página del autor. Se usa en el footer y en el menú del dashboard.
 */
const CreditInfo = ({ className = "" }: { className?: string }) => {
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!showPreview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowPreview(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showPreview]);

  return (
    <>
      <div className={`footerCredit ${className}`}>
        <button type="button" className="footerInfoBtn" aria-label="Créditos de la página" onClick={() => setShowPreview(true)}>
          <span className="footerInfoIcon">
            <svg className="footerInfoBase" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <InfoGlyph stroke="currentColor" />
            </svg>
            <svg className="footerInfoShine" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <defs>
                <linearGradient id="footerInfoGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#00e5ff" />
                  <stop offset="100%" stopColor="#ff00cc" />
                </linearGradient>
              </defs>
              <InfoGlyph stroke="url(#footerInfoGradient)" />
            </svg>
          </span>
        </button>
        <div className="footerCreditBubble" role="note">
          Esta página fue realizada con el corazón{" "}
          <svg className="footerHeart" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 20.5s-7.5-4.6-9.3-9.4C1.4 7.6 3.6 4 7.2 4c2 0 3.5 1.1 4.8 2.8C13.3 5.1 14.8 4 16.8 4c3.6 0 5.8 3.6 4.5 7.1-1.8 4.8-9.3 9.4-9.3 9.4Z" />
          </svg>{" "}
          por{" "}
          <a href={AUTHOR_URL} target="_blank" rel="noopener noreferrer">
            José Salopaso
          </a>
        </div>
      </div>

      {showPreview &&
        createPortal(
          <div
            className="footerPreviewOverlay"
            role="dialog"
            aria-modal="true"
            aria-label="Vista previa de josesalopaso.com"
            onClick={() => setShowPreview(false)}
          >
            <div className="footerPreviewCard" onClick={(e) => e.stopPropagation()}>
              <div className="footerPreviewHead">
                <span className="footerPreviewTitle">José Salopaso</span>
                <div className="footerPreviewActions">
                  <a className="footerPreviewOpen" href={AUTHOR_URL} target="_blank" rel="noopener noreferrer">
                    Abrir página ↗
                  </a>
                  <button type="button" className="footerPreviewClose" title="Cerrar" onClick={() => setShowPreview(false)}>
                    ✕
                  </button>
                </div>
              </div>
              <iframe className="footerPreviewFrame" src={AUTHOR_URL} title="josesalopaso.com" loading="lazy" />
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default CreditInfo;
