import type { NotificationTarget } from "./types";

export type Announcement = {
  /** Único y estable: con él se recuerda si ya se leyó. No reutilizar ids. */
  id: string;
  /** Fecha de publicación (YYYY-MM-DD): ordena la lista, lo más nuevo arriba. */
  dateISO: string;
  title: string;
  body: string;
  target?: NotificationTarget;
};

// Novedades fijas para los servidores. Para anunciar algo nuevo, agregar un elemento aquí.
// (Los retiros próximos se notifican solos a partir del calendario.)
export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "nueva-seccion-testimonios",
    dateISO: "2026-09-28",
    title: "Nuevo: cuéntanos tu testimonio",
    body: "Escribe en 20 a 35 palabras por qué hacer el retiro. Tu testimonio aparecerá en la página principal.",
    target: { path: "/profile", sectionId: "testimonio" },
  },
];
