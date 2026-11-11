import { MoonIcon, SunIcon } from "./icons";
import type { Theme } from "./useDashboardTheme";

const ThemeToggle = ({ theme, onToggle }: { theme: Theme; onToggle: () => void }) => {
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      className="adIconButton adThemeButton"
      onClick={onToggle}
      aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title={isDark ? "Tema claro" : "Tema oscuro"}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
};

export default ThemeToggle;
