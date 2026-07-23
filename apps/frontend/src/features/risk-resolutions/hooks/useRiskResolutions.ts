import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listarResolucionesRequest, crearResolucionRequest } from "../services/riskResolutionsService";
import { TipoResolucionRiesgo } from "../types/risk-resolutions.types";

export function useResolucionesRiesgo(riesgoId: string | undefined) {
  return useQuery({
    queryKey: ["resoluciones-riesgo", riesgoId],
    queryFn: () => listarResolucionesRequest(riesgoId as string),
    enabled: Boolean(riesgoId),
  });
}

export function useCrearResolucion(riesgoId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tipo, justificacion }: { tipo: TipoResolucionRiesgo; justificacion: string }) =>
      crearResolucionRequest(riesgoId as string, tipo, justificacion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resoluciones-riesgo", riesgoId] });
      queryClient.invalidateQueries({ queryKey: ["riesgos", riesgoId] });
      queryClient.invalidateQueries({ queryKey: ["riesgos"] });
      queryClient.invalidateQueries({ queryKey: ["riesgos", riesgoId, "historial"] });
    },
  });
}
