import { useQuery } from "@tanstack/react-query";
import { obtenerIndicadoresDashboard, obtenerIndicadoresGlobales } from "../services/dashboardService";

export function useIndicadoresDashboard() {
  return useQuery({
    queryKey: ["dashboard", "indicadores"],
    queryFn: obtenerIndicadoresDashboard,
  });
}

export function useIndicadoresGlobales() {
  return useQuery({
    queryKey: ["dashboard", "indicadores-globales"],
    queryFn: obtenerIndicadoresGlobales,
  });
}
