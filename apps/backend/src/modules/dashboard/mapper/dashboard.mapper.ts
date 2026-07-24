import { IndicadoresGlobales } from "../types/dashboard.types";
import { IndicadoresGlobalesResponseDTO } from "../dto/dashboard.dto";

export function toIndicadoresGlobalesResponseDTO(
  indicadores: IndicadoresGlobales
): IndicadoresGlobalesResponseDTO {
  return {
    totalOrganizaciones: indicadores.totalOrganizaciones,
    totalAdministradoresTic: indicadores.totalAdministradoresTic,
    totalUsuarios: indicadores.totalUsuarios,
    totalActivos: indicadores.totalActivos,
    totalRiesgos: indicadores.totalRiesgos,
    riesgosPorNivel: indicadores.riesgosPorNivel,
    usuariosPorTipoRol: indicadores.usuariosPorTipoRol,
    actividadReciente: indicadores.actividadReciente.map((registro) => ({
      id: registro.id,
      entidad: registro.entidad,
      entidadId: registro.entidadId,
      accion: registro.accion,
      fecha: registro.fecha.toISOString(),
      usuario: registro.usuario,
      organizacion: registro.organizacion,
    })),
  };
}
