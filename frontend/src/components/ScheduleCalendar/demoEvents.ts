import type { EventRecord } from "../../api/events";

// Eventos de ejemplo SOLO para desarrollo (npm run dev): no se guardan en la base de datos ni
// aparecen en producción. Las fechas son relativas a hoy para que siempre se vean en el calendario.
const inDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const getDemoEvents = (): EventRecord[] => [
  {
    _id: "demo-1",
    title: "Reunión de servidores",
    dateISO: inDays(2),
    start: "19:00",
    end: "21:00",
    location: "Parroquia San Juan Bautista, salón 3",
    tag: "Reunión",
    description: "Planeación del próximo retiro.\nTraer agenda y propuestas de actividades.",
    isOpen: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-2",
    title: "Formación: Lectio Divina",
    dateISO: inDays(5),
    start: "10:00",
    end: "12:30",
    location: "Capilla del Santísimo",
    tag: "Formación",
    description: "Taller abierto a todos los jóvenes. Trae tu Biblia y un cuaderno.",
    isOpen: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-3",
    title: "Retiro de jóvenes – Fin de semana",
    dateISO: inDays(9),
    start: "17:00",
    endDateISO: inDays(11),
    end: "15:00",
    location: "Casa de retiros El Carmen, La Calera",
    tag: "Retiro",
    description: "Inicio viernes 5:00pm. Finaliza domingo 3:00pm.\nIncluye alimentación y hospedaje.",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-4",
    title: "Jornada de adoración",
    dateISO: inDays(14),
    tag: "Otro",
    description: "Adoración durante todo el día. Puedes llegar a la hora que quieras.",
    isOpen: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-5",
    title: "Ensayo del coro",
    dateISO: inDays(14),
    start: "18:00",
    end: "20:00",
    tag: "Reunión",
    isOpen: false,
    createdAt: new Date().toISOString(),
  },
];
