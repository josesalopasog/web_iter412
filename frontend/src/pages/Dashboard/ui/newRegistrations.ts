// Inscripciones nuevas: las que llegaron después de la última vez que esta persona cargó el
// dashboard. Su fila se resalta en azul claro; al guardar la marca, en la siguiente carga ya no
// salen como nuevas. Se guarda en este navegador, por usuario y por vista.
type Row = { _id: string; createdAt?: unknown };

const storageKey = (userId: string, view: string) => `iter412:dashboard-ultima-inscripcion-vista:${userId}:${view}`;

const FIRST_VISIT_WINDOW_MS = 24 * 60 * 60 * 1000;

const createdAtOf = (row: Row) => (typeof row.createdAt === "string" ? row.createdAt : "");

/**
 * Devuelve los ids nuevos y deja guardada como vista la inscripción más reciente.
 * La marca es el createdAt del servidor (no el reloj de este equipo), así no hay desfases.
 * La primera vez que se usa no hay marca: salen como nuevas las de las últimas 24 horas.
 */
export const takeNewRegistrations = (userId: string, view: string, rows: Row[]): Set<string> => {
  const key = storageKey(userId, view);
  let lastSeen: string | null = null;
  try {
    lastSeen = localStorage.getItem(key);
  } catch {
    // sin almacenamiento: no se marca nada
  }

  const newest = rows.reduce((max, r) => (createdAtOf(r) > max ? createdAtOf(r) : max), "");
  if (newest && newest !== lastSeen) {
    try {
      localStorage.setItem(key, newest);
    } catch {
      // sin almacenamiento: el punto se seguiría mostrando hasta poder guardar
    }
  }

  const since = lastSeen ?? new Date(Date.now() - FIRST_VISIT_WINDOW_MS).toISOString();
  return new Set(rows.filter((r) => createdAtOf(r) > since).map((r) => r._id));
};
