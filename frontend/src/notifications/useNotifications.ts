import { useCallback, useEffect, useMemo, useState } from "react";
import { listPublicEvents } from "../api/events";
import type { EventRecord } from "../api/events";
import { ANNOUNCEMENTS } from "./announcements";
import type { AppNotification } from "./types";

const todayISO = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
};

const retreatToNotification = (event: EventRecord): AppNotification => {
  const when =
    event.endDateISO && event.endDateISO !== event.dateISO
      ? `del ${formatDate(event.dateISO)} al ${formatDate(event.endDateISO)}`
      : `el ${formatDate(event.dateISO)}`;
  return {
    id: `retiro-${event._id}`,
    // Se ordena por cuándo se publicó el retiro, no por cuándo ocurre.
    dateISO: event.createdAt.slice(0, 10),
    title: `Nuevo retiro: ${event.title}`,
    body: `Será ${when}${event.location ? ` en ${event.location}` : ""}. Míralo en el cronograma.`,
    target: { path: "/", sectionId: "calendario" },
  };
};

// Lo leído se guarda en este navegador, por usuario. (Si luego se quiere que se sincronice entre
// dispositivos, esto pasaría a guardarse en el backend.)
const storageKey = (userId: string) => `iter412:notificaciones-leidas:${userId}`;

const loadRead = (userId: string): Set<string> => {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
};

export const useNotifications = (userId: string | undefined) => {
  const [retreats, setRetreats] = useState<AppNotification[]>([]);
  const [read, setRead] = useState<Set<string>>(() => (userId ? loadRead(userId) : new Set()));

  useEffect(() => {
    if (userId) setRead(loadRead(userId));
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    listPublicEvents()
      .then((events) => {
        if (cancelled) return;
        const today = todayISO();
        setRetreats(
          events
            .filter((e) => e.tag === "Retiro" && (e.endDateISO ?? e.dateISO) >= today)
            .map(retreatToNotification)
        );
      })
      .catch(() => {
        // sin conexión: solo se muestran los anuncios fijos
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const notifications = useMemo(
    () => [...ANNOUNCEMENTS, ...retreats].sort((a, b) => b.dateISO.localeCompare(a.dateISO)),
    [retreats]
  );

  const unreadCount = notifications.filter((n) => !read.has(n.id)).length;

  const markRead = useCallback(
    (id: string) => {
      if (!userId) return;
      setRead((prev) => {
        if (prev.has(id)) return prev;
        const nextSet = new Set(prev).add(id);
        try {
          localStorage.setItem(storageKey(userId), JSON.stringify([...nextSet]));
        } catch {
          // sin almacenamiento disponible: queda leída solo mientras la página esté abierta
        }
        return nextSet;
      });
    },
    [userId]
  );

  return { notifications, read, unreadCount, markRead };
};
