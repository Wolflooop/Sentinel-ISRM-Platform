import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  descargarReporteRequest,
  generarReporteRequest,
  listarReportesRequest,
} from "../services/reportsService";
import { FiltrosReportes, GenerarReporteInput, Reporte } from "../types/reports.types";

export function useReportes(filtros: FiltrosReportes) {
  return useQuery({
    queryKey: ["reportes", filtros],
    queryFn: () => listarReportesRequest(filtros),
  });
}

export function useGenerarReporte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: GenerarReporteInput) => generarReporteRequest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reportes"] });
    },
  });
}

export function useDescargarReporte() {
  return useMutation({
    mutationFn: (reporte: Reporte) => descargarReporteRequest(reporte),
  });
}
