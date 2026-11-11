import type { ServidorRecord, SoldadoRecord } from "../../../api/adminUsers";
import { dayKeyOf, isHombre, isMujer, lastDays } from "../format";
import { formatEnumLabel } from "../../Profile/ui/format";

type Person = SoldadoRecord | ServidorRecord;

const sumField = (list: Person[], field: "paymentAmount" | "subsidyAmount") =>
  list.reduce((sum, s) => sum + (Number(s[field]) || 0), 0);

/** Totales de las tarjetas (mismo cálculo del dashboard anterior). */
export const buildStats = (rows: Person[], price: number) => {
  const hombresList = rows.filter((s) => isHombre(s.gender));
  const mujeresList = rows.filter((s) => isMujer(s.gender));
  const total = rows.length;
  const totalPaid = sumField(rows, "paymentAmount");
  const totalSubsidy = sumField(rows, "subsidyAmount");
  const hombresPaid = sumField(hombresList, "paymentAmount");
  const hombresSubsidy = sumField(hombresList, "subsidyAmount");
  const mujeresPaid = sumField(mujeresList, "paymentAmount");
  const mujeresSubsidy = sumField(mujeresList, "subsidyAmount");

  return {
    total,
    hombres: hombresList.length,
    mujeres: mujeresList.length,
    totalPaid,
    totalDue: Math.max(0, total * price - totalPaid - totalSubsidy),
    totalSubsidy,
    hombresPaid,
    hombresDue: Math.max(0, hombresList.length * price - hombresPaid - hombresSubsidy),
    hombresSubsidy,
    mujeresPaid,
    mujeresDue: Math.max(0, mujeresList.length * price - mujeresPaid - mujeresSubsidy),
    mujeresSubsidy,
  };
};

/** Inscripciones por día en los últimos `days` días, separadas por género. */
export const registrationsByDay = (rows: Person[], days = 30) => {
  const keys = lastDays(days);
  const map = new Map(keys.map((k) => [k, { date: k, hombres: 0, mujeres: 0 }]));
  for (const r of rows) {
    const point = map.get(dayKeyOf(String(r.createdAt ?? "")));
    if (!point) continue;
    if (isMujer(r.gender)) point.mujeres += 1;
    else point.hombres += 1;
  }
  return [...map.values()];
};

/** Conteo por un campo de texto (o lista), ordenado de mayor a menor. */
export const countBy = (rows: Person[], pick: (row: Person) => string | string[] | undefined, limit = 6) => {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const raw = pick(r);
    const values = Array.isArray(raw) ? raw : [raw];
    for (const v of values) {
      const key = String(v ?? "").trim();
      if (!key || key === "NINGUNO" || key === "NINGUNA") continue;
      const label = key === key.toUpperCase() ? formatEnumLabel(key) : key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }));
};

const AGE_BUCKETS = [
  { label: "< 18", min: 0, max: 17 },
  { label: "18-21", min: 18, max: 21 },
  { label: "22-25", min: 22, max: 25 },
  { label: "26-30", min: 26, max: 30 },
  { label: "31-40", min: 31, max: 40 },
  { label: "41+", min: 41, max: 200 },
];

export const ageBuckets = (rows: Person[]) =>
  AGE_BUCKETS.map((b) => ({
    label: b.label,
    count: rows.filter((r) => {
      const age = Number(r.age);
      return Number.isFinite(age) && age >= b.min && age <= b.max;
    }).length,
  }));

export const averageAge = (rows: Person[]) => {
  const ages = rows.map((r) => Number(r.age)).filter((a) => Number.isFinite(a) && a > 0);
  return ages.length ? ages.reduce((s, a) => s + a, 0) / ages.length : 0;
};
