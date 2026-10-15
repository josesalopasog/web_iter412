import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Rutas visitadas en esta pestaña (más reciente al final). Vive en sessionStorage para sobrevivir
// a una recarga: así "volver" lleva literalmente a la página anterior (p. ej. /profile → /dashboard)
// y no al inicio.
const STORAGE_KEY = "nav_history";
const MAX_ENTRIES = 50;

const read = (): string[] => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((p): p is string => typeof p === "string") : [];
  } catch {
    return [];
  }
};

const write = (stack: string[]) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stack.slice(-MAX_ENTRIES)));
  } catch {
    // sin sessionStorage el botón cae al respaldo de getPreviousPath
  }
};

/** Se monta una vez (en AppRoutes) y registra cada cambio de ruta. */
export const useTrackNavHistory = () => {
  const { pathname, search, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    const path = `${pathname}${search}${hash}`;
    const stack = read();
    const top = stack[stack.length - 1];

    if (top === path) return;
    if (stack[stack.length - 2] === path) {
      // Se volvió a la anterior (con nuestro botón o con el del navegador).
      stack.pop();
    } else if (navigationType === "REPLACE" && stack.length > 0) {
      // Redirecciones (p. ej. ProtectedRoute) reemplazan la entrada, no agregan otra.
      stack[stack.length - 1] = path;
    } else {
      stack.push(path);
    }
    write(stack);
  }, [pathname, search, hash, navigationType]);
};

/** Ruta anterior a la actual dentro de la app, o null si se entró directo a esta página. */
export const getPreviousPath = (): string | null => {
  const stack = read();
  return stack.length >= 2 ? stack[stack.length - 2] : null;
};
