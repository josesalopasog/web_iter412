import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BellIcon, XMarkIcon } from "../../../assets/icons";
import { highlightSection } from "../../../notifications/highlight";
import { useNotifications } from "../../../notifications/useNotifications";
import type { AppNotification } from "../../../notifications/types";
import { useAuth } from "../../../auth/AuthContext";
import { TOURS, requestTourStart } from "../../../tours/tours";
import type { Tour } from "../../../tours/tours";
import "./NotificationsBell.css";

const formatShortDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
};

type Props = {
  userId: string | undefined;
};

const NotificationsBell = ({ userId }: Props) => {
  const { notifications, read, dismissed, unreadCount, markRead, dismiss } = useNotifications(userId);
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN" || user?.role === "TREASURER";
  // Tutoriales para volver a ver. La X los quita de aquí para siempre (como una notificación).
  const tutorials = [isAdmin && TOURS.dashboard, TOURS.perfil].filter(
    (t): t is Tour => Boolean(t) && !dismissed.has(`tutorial-${(t as Tour).id}`)
  );
  const [open, setOpen] = useState(false);
  // En pantallas angostas el panel va fijo a la pantalla (ver .notifPanel en styles.css), justo
  // debajo de la campana: el header puede partirse en dos filas, así que su borde se mide.
  const [panelTop, setPanelTop] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // La notificación queda en la lista (solo se marca como leída); lo que desaparece es el
  // resaltado de la sección, a los pocos segundos.
  const handleOpen = (n: AppNotification) => {
    markRead(n.id);
    setOpen(false);
    if (!n.target) return;
    if (n.target.path === location.pathname) highlightSection(n.target.sectionId);
    else navigate(n.target.path, { state: { highlight: n.target.sectionId } });
  };

  const handleOpenTutorial = (tour: Tour) => {
    setOpen(false);
    if (tour.path === location.pathname) requestTourStart(tour.id);
    else navigate(tour.path, { state: { tour: tour.id } });
  };

  return (
    <div className="notifRoot" ref={rootRef} data-tour="bell">
      <button
        className="iconBtn notifBellBtn"
        type="button"
        title="Notificaciones"
        aria-label={unreadCount ? `Notificaciones (${unreadCount} sin leer)` : "Notificaciones"}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => {
          setPanelTop((rootRef.current?.getBoundingClientRect().bottom ?? 0) + 10);
          setOpen((v) => !v);
        }}
      >
        <BellIcon className="w-5 h-5" />
        {unreadCount > 0 && <span className="notifBadge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>

      {open && (
        <div
          className="notifPanel"
          role="menu"
          aria-label="Notificaciones"
          style={{ "--notif-top": `${panelTop}px` } as CSSProperties}
        >
          <div className="notifPanelHead">
            <span>Notificaciones</span>
            <button
              type="button"
              className="notifCloseBtn"
              onClick={() => setOpen(false)}
              aria-label="Cerrar notificaciones"
              title="Cerrar"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          {notifications.length === 0 ? (
            <p className="notifEmpty">No tienes notificaciones.</p>
          ) : (
            <ul className="notifList">
              {notifications.map((n) => {
                const unread = !read.has(n.id);
                return (
                  <li key={n.id} className="notifListItem">
                    <button
                      type="button"
                      role="menuitem"
                      className={`notifItem${unread ? " is-unread" : ""}`}
                      onClick={() => handleOpen(n)}
                    >
                      <span className="notifDot" aria-hidden="true" />
                      <span className="notifContent">
                        <span className="notifTitle">{n.title}</span>
                        <span className="notifBody">{n.body}</span>
                        <span className="notifDate">{formatShortDate(n.dateISO)}</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="notifDismissBtn"
                      onClick={() => dismiss(n.id)}
                      aria-label={`Eliminar notificación: ${n.title}`}
                      title="Eliminar notificación"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {tutorials.length > 0 && (
            <>
              <div className="notifSectionTitle">Tutoriales</div>
              <ul className="notifList">
                {tutorials.map((t) => (
                  <li key={t.id} className="notifListItem">
                    <button
                      type="button"
                      role="menuitem"
                      className="notifItem"
                      onClick={() => handleOpenTutorial(t)}
                    >
                      <span className="notifDot" aria-hidden="true" />
                      <span className="notifContent">
                        <span className="notifTitle">{t.label}</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="notifDismissBtn"
                      onClick={() => dismiss(`tutorial-${t.id}`)}
                      aria-label={`Quitar: ${t.label}`}
                      title="Quitar (no se podrá volver a ver)"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;
