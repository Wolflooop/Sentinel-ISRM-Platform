import {
  contarActivosGlobal,
  contarAdministradoresTic,
  contarOrganizaciones,
  contarRiesgosGlobal,
  contarUsuarios,
  contarUsuariosPorTipoRol,
  obtenerActividadRecienteGlobal,
  obtenerRiesgosPorNivelGlobal,
} from "../repository/dashboard.repository";
import { IndicadoresGlobales } from "../types/dashboard.types";

export async function obtenerIndicadoresGlobales(): Promise<IndicadoresGlobales> {
  const [
    totalOrganizaciones,
    totalAdministradoresTic,
    totalUsuarios,
    totalActivos,
    totalRiesgos,
    riesgosPorNivel,
    usuariosPorTipoRol,
    actividadReciente,
  ] = await Promise.all([
    contarOrganizaciones(),
    contarAdministradoresTic(),
    contarUsuarios(),
    contarActivosGlobal(),
    contarRiesgosGlobal(),
    obtenerRiesgosPorNivelGlobal(),
    contarUsuariosPorTipoRol(),
    obtenerActividadRecienteGlobal(),
  ]);

  return {
    totalOrganizaciones,
    totalAdministradoresTic,
    totalUsuarios,
    totalActivos,
    totalRiesgos,
    riesgosPorNivel,
    usuariosPorTipoRol,
    actividadReciente,
  };
}
