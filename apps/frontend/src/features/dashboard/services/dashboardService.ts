import { apiClient } from "../../../lib/apiClient";
import { getOrganizacionIdActual } from "../../../lib/authSession";
import {
  ActivoResumen,
  ConteoPorEstadoControl,
  ConteoPorNivel,
  ControlResumen,
  EstadoImplementacionControl,
  IndicadoresDashboard,
  NivelRiesgo,
  RiesgoResumen,
} from "../types/dashboard.types";

const NIVELES_RIESGO: NivelRiesgo[] = ["BAJO", "MEDIO", "ALTO", "CRITICO"];
const ESTADOS_CONTROL: EstadoImplementacionControl[] = [
  "NO_INICIADO",
  "EN_PROGRESO",
  "IMPLEMENTADO",
  "VERIFICADO",
];

// V2: el nivel vigente de un riesgo es el de su evaluacionActual (que
// puede ser INHERENTE o RESIDUAL, según cuál se haya registrado más
// recientemente — ver Riesgo.evaluacionActualId en el schema). Un riesgo
// recién creado sin Contexto ISO activo podría no tener evaluacionActual;
// esos casos se excluyen del conteo en vez de asumir un nivel.
function nivelVigente(riesgo: RiesgoResumen): NivelRiesgo | null {
  return riesgo.evaluacionActual?.nivelRiesgo ?? null;
}

function contarPorNivel(riesgos: RiesgoResumen[]): ConteoPorNivel {
  const conteo = Object.fromEntries(NIVELES_RIESGO.map((nivel) => [nivel, 0])) as ConteoPorNivel;
  for (const riesgo of riesgos) {
    const nivel = nivelVigente(riesgo);
    if (nivel) {
      conteo[nivel] += 1;
    }
  }
  return conteo;
}

function contarPorEstadoControl(controles: ControlResumen[]): ConteoPorEstadoControl {
  const conteo = Object.fromEntries(ESTADOS_CONTROL.map((estado) => [estado, 0])) as ConteoPorEstadoControl;
  for (const control of controles) {
    conteo[control.estadoImplementacion] += 1;
  }
  return conteo;
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
  const controles = controlesRes.data;
  const riesgosPorNivel = contarPorNivel(riesgos);

  return {
    totalActivos: activosRes.data.length,
    totalRiesgos: riesgos.length,
    riesgosCriticos: riesgosPorNivel.CRITICO,
    totalControles: controles.length,
    riesgosPorNivel,
    controlesPorEstado: contarPorEstadoControl(controles),
  };
}
