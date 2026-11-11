import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

const THEME_KEY = "iter412:tema-dashboard";

const initialTheme = (): Theme => {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // sin almacenamiento: se usa el del sistema
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

/**
 * Tema claro/oscuro del dashboard. Se aplica en <html data-theme> solo mientras el dashboard está
 * abierto (también afecta a modales y menús que se pintan fuera del layout); el sitio público
 * sigue siempre claro.
 */
export const useDashboardTheme = () => {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    return () => {
      delete root.dataset.theme;
    };
  }, [theme]);

  const toggle = () =>
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        // sin almacenamiento: vale solo para esta visita
      }
      return next;
    });

  return { theme, toggle };
};
