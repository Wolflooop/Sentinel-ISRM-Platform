import { useQuery } from "@tanstack/react-query";
import { obtenerIndicadoresDashboard } from "../services/dashboardService";

export function useIndicadoresDashboard() {
  return useQuery({
    queryKey: ["dashboard", "indicadores"],
    queryFn: obtenerIndicadoresDashboard,
  });
}
