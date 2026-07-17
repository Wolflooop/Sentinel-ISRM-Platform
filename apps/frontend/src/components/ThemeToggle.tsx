import { Moon, Sun } from "lucide-react";
import { useTheme } from "../lib/theme/ThemeProvider";

/**
 * Botón visible de cambio de tema (sol/luna), pensado para vivir en el
 * header de AppShell. No mantiene estado propio: delega por completo en
 * `useTheme()` (ThemeProvider), que es quien persiste la elección.
 */
export function ThemeToggle() {
  const { tema, alternarTema } = useTheme();
  const esOscuro = tema === "dark";

  return (
    <button
      type="button"
      onClick={alternarTema}
      aria-label={esOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={esOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="rounded-md border border-border p-2 text-ink hover:bg-surface"
    >
      {esOscuro ? <Sun className="h-4 w-4" strokeWidth={2} /> : <Moon className="h-4 w-4" strokeWidth={2} />}
    </button>
  );
}
