// Ayudas del calendario mensual (separadas del componente para que el recargado rápido funcione).

export type CalendarItem = {
  _id: string;
  title: string;
  dateISO: string;
  endDateISO?: string;
  start?: string;
  tag?: string;
  isOpen?: boolean;
};

export const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
export const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/** Clase de color de cada etiqueta de evento. */
export const TAG_CLASS: Record<string, string> = { Reunión: "reunion", Retiro: "retiro", Formación: "formacion", Otro: "otro" };

/** "YYYY-MM" del mes siguiente/anterior. */
export const shiftMonth = (month: string, delta: number) => {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const monthOf = (day: string) => day.slice(0, 7);

export const daysOf = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  const count = new Date(y, m, 0).getDate();
  return Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`);
};

/** Eventos de un día (los de varios días aparecen en cada día de su rango). */
export const eventsOn = <T extends CalendarItem>(events: T[], day: string) =>
  events
    .filter((e) => e.dateISO <= day && day <= (e.endDateISO || e.dateISO))
    .sort((a, b) => (a.start ?? "").localeCompare(b.start ?? ""));

export const formatDayTitle = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  const text = new Date(y, m - 1, d).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/** "YYYY-MM-DD" de hoy en este equipo. */
export const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Cumpleaños de un día ("YYYY-MM-DD"): se repiten cada año. */
export const birthdaysOn = <T extends { monthDay: string }>(list: T[], day: string) => list.filter((b) => b.monthDay === day.slice(5));

/** Clase de color de un evento: las reuniones van en verde si están abiertas y en rojo si están cerradas. */
export const eventClass = (e: { tag?: string; isOpen?: boolean }) =>
  (e.tag ?? "Reunión") === "Reunión" ? (e.isOpen === false ? "cerrada" : "abierta") : (TAG_CLASS[e.tag ?? ""] ?? "otro");
