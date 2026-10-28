import { useEffect, useRef, useState } from "react";
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

const Footer = () => {
    // Ícono de info: al pasar el mouse muestra el crédito (CSS); al hacer click abre la vista previa
    // de la página del autor.
    const [showPreview, setShowPreview] = useState(false);
    const footerRef = useRef<HTMLElement>(null);

    // Los botones flotantes (volver, subir, "Quiero Inscribirme", perfil) no bajan del footer: al
    // llegar a él, --fab-lift los sube para que se queden justo encima, con el mismo margen que
    // tienen respecto al borde de la pantalla.
    useEffect(() => {
        const footer = footerRef.current;
        if (!footer) return;
        const root = document.documentElement;
        let frame = 0;
        let lastLift = -1;

        const update = () => {
            frame = 0;
            const lift = Math.max(0, Math.ceil(window.innerHeight - footer.getBoundingClientRect().top));
            if (lift !== lastLift) {
                root.style.setProperty("--fab-lift", `${lift}px`);
                lastLift = lift;
            }
        };
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };

        update();
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        // El alto de la página cambia al cargar contenido sin que haya scroll.
        const observer = new ResizeObserver(schedule);
        observer.observe(document.body);
        return () => {
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
            observer.disconnect();
            cancelAnimationFrame(frame);
            root.style.removeProperty("--fab-lift");
        };
    }, []);

    useEffect(() => {
        if (!showPreview) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setShowPreview(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [showPreview]);

    return (
        <footer ref={footerRef}>
            <div className="container mx-auto text-center footerContent">
                <p>&copy; {new Date().getFullYear()} Iter 4.12 - 💚❤️💜 ¡Por Dios y Para Dios!</p>
                <div className="footerCredit">
                    <button
                        type="button"
                        className="footerInfoBtn"
                        aria-label="Créditos de la página"
                        onClick={() => setShowPreview(true)}
                    >
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
                                    <button
                                        type="button"
                                        className="footerPreviewClose"
                                        title="Cerrar"
                                        onClick={() => setShowPreview(false)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                            <iframe className="footerPreviewFrame" src={AUTHOR_URL} title="josesalopaso.com" loading="lazy" />
                        </div>
                    </div>,
                    document.body
                )}
        </footer>
    );
}

export default Footer;
