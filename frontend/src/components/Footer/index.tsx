import { useEffect, useRef } from "react";
import CreditInfo from "./CreditInfo";
import "./styles.css";

const Footer = () => {
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

    return (
        <footer ref={footerRef}>
            <div className="container mx-auto text-center footerContent">
                <p>&copy; {new Date().getFullYear()} Iter 4.12 - 💚❤️💜 ¡Por Dios y Para Dios!</p>
                <CreditInfo />
            </div>

        </footer>
    );
}

export default Footer;
