// Formatos de números, dinero y fechas del dashboard (es-CO).

const cop = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat("es-CO", { notation: "compact", maximumFractionDigits: 1 });
const pct = new Intl.NumberFormat("es-CO", { style: "percent", maximumFractionDigits: 1 });

export const formatCOP = (value: number) => cop.format(value);
export const formatNumber = (value: number) => num.format(value);
export const formatPercent = (value: number) => pct.format(value);
export const formatCompactNumber = (value: number) => compact.format(value);
export const formatCompactCOP = (value: number) => `$${compact.format(value)}`;

const fromDayKey = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

/** "12 nov" */
export const formatShortDay = (day: string) =>
  fromDayKey(day).toLocaleDateString("es-CO", { day: "numeric", month: "short" }).replace(".", "");

/** "miércoles, 12 de noviembre" */
export const formatLongDay = (day: string) =>
  fromDayKey(day).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });

export const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};

export const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
};

/** "YYYY-MM-DD" del día local de una fecha ISO (para agrupar en el navegador). */
export const dayKeyOf = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/** Últimos `count` días (hoy incluido) como "YYYY-MM-DD". */
export const lastDays = (count: number) => {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (count - 1 - i));
    return dayKeyOf(d.toISOString());
  });
};

export type KpiValue = { value: number; previous: number };

/** Cambio porcentual contra el periodo anterior (null si no hay con qué comparar). */
export const getChange = ({ value, previous }: KpiValue) => {
  if (!previous) return null;
  const change = (value - previous) / Math.abs(previous);
  return { value: formatPercent(Math.abs(change)), isUp: change >= 0 };
};

export const formatRegNum = (n: number | null | undefined) =>
  n == null || Number.isNaN(n) ? "s/n" : String(n).padStart(3, "0");

export const isHombre = (gender?: unknown) => gender === "Hombre" || gender === "Masculino";
export const isMujer = (gender?: unknown) => gender === "Mujer" || gender === "Femenino";
