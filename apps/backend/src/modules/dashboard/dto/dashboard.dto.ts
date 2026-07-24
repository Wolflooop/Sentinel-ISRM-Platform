export interface IndicadoresGlobalesResponseDTO {
  totalOrganizaciones: number;
  totalAdministradoresTic: number;
  totalUsuarios: number;
  totalActivos: number;
  totalRiesgos: number;
  riesgosPorNivel: Record<string, number>;
  usuariosPorTipoRol: Record<string, number>;
  actividadReciente: Array<{
    id: string;
    entidad: string;
    entidadId: string;
    accion: string;
    fecha: string;
    usuario: { id: string; nombre: string };
    organizacion: { id: string; nombre: string };
  }>;
}
