import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BellIcon } from "../../../assets/icons";
import { highlightSection } from "../../../notifications/highlight";
import { useNotifications } from "../../../notifications/useNotifications";
import type { AppNotification } from "../../../notifications/types";

const formatShortDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
};

type Props = {
  userId: string | undefined;
};

const NotificationsBell = ({ userId }: Props) => {
  const { notifications, read, unreadCount, markRead } = useNotifications(userId);
  const [open, setOpen] = useState(false);
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

  return (
    <div className="notifRoot" ref={rootRef}>
      <button
        className="iconBtn notifBellBtn"
        type="button"
        title="Notificaciones"
        aria-label={unreadCount ? `Notificaciones (${unreadCount} sin leer)` : "Notificaciones"}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <BellIcon className="w-5 h-5" />
        {unreadCount > 0 && <span className="notifBadge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>

      {open && (
        <div className="notifPanel" role="menu" aria-label="Notificaciones">
          <div className="notifPanelHead">Notificaciones</div>
          {notifications.length === 0 ? (
            <p className="notifEmpty">No tienes notificaciones.</p>
          ) : (
            <ul className="notifList">
              {notifications.map((n) => {
                const unread = !read.has(n.id);
                return (
                  <li key={n.id}>
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
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;
