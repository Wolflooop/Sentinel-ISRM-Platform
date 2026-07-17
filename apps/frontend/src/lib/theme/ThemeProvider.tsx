import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Tema = "light" | "dark";

interface ThemeContextValue {
  tema: Tema;
  alternarTema: () => void;
}


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


  const prefiereOscuro =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  return prefiereOscuro ? "dark" : "light";
}


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
