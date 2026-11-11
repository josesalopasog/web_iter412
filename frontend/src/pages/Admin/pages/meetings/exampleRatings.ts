import type { EventRecord } from "../../../../api/events";

// ===== Calificaciones de reuniones: DATOS DE EJEMPLO =====
// Los servidores califican las reuniones desde /profile/reuniones. Mientras nadie haya calificado,
// el dashboard muestra estas calificaciones generadas a partir del id del evento, para que se vea
// cómo quedará el análisis. No vienen del backend ni se guardan en ningún lado.

export type MeetingRating = {
  eventId: string;
  title: string;
  dateISO: string;
  votes: number;
  average: number;
  /** Cantidad de votos por estrella: índice 0 = 1 estrella ... índice 4 = 5 estrellas. */
  stars: [number, number, number, number, number];
  comments: { author: string; stars: number; text: string }[];
};

const SAMPLE_COMMENTS = [
  { stars: 5, text: "Muy buena reunión, salimos con todo claro para el retiro." },
  { stars: 5, text: "La alabanza estuvo hermosa, gracias por organizarla." },
  { stars: 4, text: "Buena, pero empezó un poco tarde." },
  { stars: 4, text: "Me gustó la dinámica por servicios." },
  { stars: 3, text: "Faltó tiempo para resolver dudas de logística." },
  { stars: 5, text: "Se sintió mucha unidad en el equipo." },
  { stars: 2, text: "El lugar quedó pequeño para todos." },
  { stars: 4, text: "Clara la explicación de los horarios." },
];

const SAMPLE_AUTHORS = ["Servidor A.", "Servidora M.", "Servidor J.", "Servidora L.", "Servidor D.", "Servidora C."];

// Número pseudoaleatorio estable a partir de un texto (siempre el mismo para el mismo evento).
const seeded = (text: string) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
};

const FALLBACK_EVENTS: Pick<EventRecord, "_id" | "title" | "dateISO">[] = [
  { _id: "ejemplo-1", title: "Reunión general de servidores", dateISO: "2026-09-12" },
  { _id: "ejemplo-2", title: "Reunión de líderes de mesa", dateISO: "2026-10-03" },
  { _id: "ejemplo-3", title: "Ensayo de alabanza", dateISO: "2026-10-17" },
  { _id: "ejemplo-4", title: "Reunión de logística", dateISO: "2026-10-31" },
];

export const buildExampleRatings = (events: EventRecord[], today: string): MeetingRating[] => {
  const past = events.filter((e) => (e.tag ?? "Reunión") === "Reunión" && e.dateISO <= today);
  const source = past.length ? past : FALLBACK_EVENTS;
  return source.map((e) => {
    const rand = seeded(e._id);
    const votes = 6 + Math.floor(rand() * 18);
    const bias = 0.55 + rand() * 0.4; // Qué tan bien le fue a la reunión
    const stars: MeetingRating["stars"] = [0, 0, 0, 0, 0];
    for (let i = 0; i < votes; i += 1) {
      const r = rand();
      const value = r < bias * 0.6 ? 5 : r < bias ? 4 : r < bias + 0.2 ? 3 : r < 0.95 ? 2 : 1;
      stars[value - 1] += 1;
    }
    const average = stars.reduce((sum, n, i) => sum + n * (i + 1), 0) / votes;
    const comments = Array.from({ length: 2 + Math.floor(rand() * 2) }, (_, i) => {
      const c = SAMPLE_COMMENTS[Math.floor(rand() * SAMPLE_COMMENTS.length)];
      return { ...c, author: SAMPLE_AUTHORS[(i + Math.floor(rand() * 6)) % SAMPLE_AUTHORS.length] };
    });
    return { eventId: e._id, title: e.title, dateISO: e.dateISO, votes, average, stars, comments };
  });
};

export const formatStars = (average: number) => `${average.toFixed(1).replace(".", ",")} ★`;
