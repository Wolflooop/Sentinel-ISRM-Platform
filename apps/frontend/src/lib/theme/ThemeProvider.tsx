import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Tema = "light" | "dark";

interface ThemeContextValue {
  tema: Tema;
  alternarTema: () => void;
}

/**
 * Misma clave que usa el script inline de index.html (evita parpadeo al
 * cargar) — un único punto de verdad para dónde vive el tema persistido.
 */
const THEME_STORAGE_KEY = "sentinel-theme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function obtenerTemaInicial(): Tema {
  if (typeof window === "undefined") {
    return "light";
  }

  const temaGuardado = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (temaGuardado === "dark" || temaGuardado === "light") {
    return temaGuardado;
  }

  // Sin preferencia guardada todavía: se respeta la preferencia del
  // sistema operativo/navegador como punto de partida (no se fuerza claro
  // por defecto).
  const prefiereOscuro =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  return prefiereOscuro ? "dark" : "light";
}

/**
 * Contexto de tema claro/oscuro para toda la aplicación.
 *
 * El interruptor real del tema es la clase `dark` en `<html>` — este
 * provider es quien la agrega/quita y persiste la elección en
 * `localStorage`. Los componentes nunca leen `localStorage` directamente;
 * siempre pasan por `useTheme()`.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(obtenerTemaInicial);

  useEffect(() => {
    const root = document.documentElement;
    if (tema === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    window.localStorage.setItem(THEME_STORAGE_KEY, tema);
  }, [tema]);

  const alternarTema = () => {
    setTema((temaActual) => (temaActual === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ tema, alternarTema }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  }
  return context;
}
