// Fechas de los reportes del dashboard (analítica, finanzas, resumen). Todo se agrupa por día en
// hora de Colombia (UTC-5 todo el año, sin horario de verano).

export const TIMEZONE = "America/Bogota";
const OFFSET_MS = 5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const RANGES = [7, 30, 90] as const;
export type Range = (typeof RANGES)[number];

export const parseRange = (value: unknown): Range | null => {
  const num = Number(value ?? 30);
  return (RANGES as readonly number[]).includes(num) ? (num as Range) : null;
};

/** "YYYY-MM-DD" del día en Colombia al que pertenece una fecha. */
export const toDayKey = (date: Date) => new Date(date.getTime() - OFFSET_MS).toISOString().slice(0, 10);

/** Medianoche de Colombia (en UTC) del día "YYYY-MM-DD". */
const startOfDay = (dayKey: string) => new Date(new Date(`${dayKey}T00:00:00Z`).getTime() + OFFSET_MS);

/**
 * Periodo de los últimos `range` días contando hoy, y el periodo anterior del mismo largo
 * (para comparar los KPIs).
 */
export const getPeriod = (range: Range) => {
  const today = toDayKey(new Date());
  const to = new Date(startOfDay(today).getTime() + DAY_MS); // Fin de hoy (exclusivo)
  const from = new Date(to.getTime() - range * DAY_MS);
  const previousFrom = new Date(from.getTime() - range * DAY_MS);
  const days = Array.from({ length: range }, (_, i) => toDayKey(new Date(from.getTime() + i * DAY_MS + OFFSET_MS)));
  return { today, firstDay: days[0], from, to, previousFrom, days };
};

/** Expresión de Mongo que convierte createdAt en "YYYY-MM-DD" de Colombia (para $group). */
export const dayKeyExpr = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: TIMEZONE } };
