import { useCallback, useEffect, useMemo, useState } from "react";
import { listPublicEvents } from "../api/events";
import type { EventRecord } from "../api/events";
import { listCustomNotifications } from "../api/notifications";
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

// Lo leído y lo eliminado (la X de cada notificación) se guarda en este navegador, por usuario.
// (Si luego se quiere que se sincronice entre dispositivos, esto pasaría a guardarse en el backend.)
const storageKey = (userId: string) => `iter412:notificaciones-leidas:${userId}`;
const dismissedKey = (userId: string) => `iter412:notificaciones-eliminadas:${userId}`;

const loadSet = (key: string): Set<string> => {
  try {
    const raw = localStorage.getItem(key);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
};

const saveSet = (key: string, set: Set<string>) => {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    // sin almacenamiento disponible: el cambio dura solo mientras la página esté abierta
  }
};

const loadRead = (userId: string) => loadSet(storageKey(userId));

export const useNotifications = (userId: string | undefined) => {
  const [retreats, setRetreats] = useState<AppNotification[]>([]);
  const [custom, setCustom] = useState<AppNotification[]>([]);
  const [read, setRead] = useState<Set<string>>(() => (userId ? loadRead(userId) : new Set()));
  const [dismissed, setDismissed] = useState<Set<string>>(() =>
    userId ? loadSet(dismissedKey(userId)) : new Set()
  );

  // Si cambia el usuario, se recarga lo leído/eliminado de esa persona (durante el render, sin efecto).
  const [loadedFor, setLoadedFor] = useState(userId);
  if (loadedFor !== userId) {
    setLoadedFor(userId);
    setRead(userId ? loadRead(userId) : new Set());
    setDismissed(userId ? loadSet(dismissedKey(userId)) : new Set());
  }

  // Notificaciones personalizadas que publican los admins (ya vienen sin las vencidas).
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    listCustomNotifications()
      .then((items) => {
        if (cancelled) return;
        setCustom(
          items.map((n) => ({
            id: `aviso-${n._id}`,
            dateISO: n.createdAt.slice(0, 10),
            title: n.title,
            body: n.body,
          }))
        );
      })
      .catch(() => {
        // sin conexión: se muestran las demás
      });
    return () => {
      cancelled = true;
    };
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
    () =>
      [...ANNOUNCEMENTS, ...retreats, ...custom]
        .filter((n) => !dismissed.has(n.id))
        .sort((a, b) => b.dateISO.localeCompare(a.dateISO)),
    [retreats, custom, dismissed]
  );

  const unreadCount = notifications.filter((n) => !read.has(n.id)).length;

  const markRead = useCallback(
    (id: string) => {
      if (!userId) return;
      setRead((prev) => {
        if (prev.has(id)) return prev;
        const nextSet = new Set(prev).add(id);
        saveSet(storageKey(userId), nextSet);
        return nextSet;
      });
    },
    [userId]
  );

  // La X: la quita de la lista de esta persona (no la borra para los demás).
  const dismiss = useCallback(
    (id: string) => {
      if (!userId) return;
      setDismissed((prev) => {
        const nextSet = new Set(prev).add(id);
        saveSet(dismissedKey(userId), nextSet);
        return nextSet;
      });
    },
    [userId]
  );

  return { notifications, read, unreadCount, markRead, dismiss };
};
