import { apiClient } from "../../../lib/apiClient";
import { getOrganizacionIdActual } from "../../../lib/authSession";
import { ActivoResumen, ControlResumen, IndicadoresDashboard, RiesgoResumen } from "../types/dashboard.types";

/**
 * Un riesgo se cuenta como "crítico" por su nivel residual cuando ya fue
 * evaluado tras tratamiento; si aún no tiene nivel residual, se usa el
 * inherente. Esto refleja el nivel de riesgo vigente en cada momento,
 * consistente con cómo el módulo de Riesgos expone ambos campos.
 */
function esRiesgoCritico(riesgo: RiesgoResumen): boolean {
  const nivelVigente = riesgo.nivelRiesgoResidual ?? riesgo.nivelRiesgoInherente;
  return nivelVigente === "CRITICO";
}

export async function obtenerIndicadoresDashboard(): Promise<IndicadoresDashboard> {
  const organizacionId = getOrganizacionIdActual();

  const [activosRes, riesgosRes, controlesRes] = await Promise.all([
    apiClient.get<ActivoResumen[]>("/activos"),
    apiClient.get<RiesgoResumen[]>("/riesgos"),
    apiClient.get<ControlResumen[]>("/controles", {
      params: organizacionId ? { organizacionId } : undefined,
    }),
  ]);

  const riesgos = riesgosRes.data;

  return {
    totalActivos: activosRes.data.length,
    totalRiesgos: riesgos.length,
    riesgosCriticos: riesgos.filter(esRiesgoCritico).length,
    totalControles: controlesRes.data.length,
  };
}
