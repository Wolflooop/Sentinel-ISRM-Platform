import { AccionAuditoria, NivelRiesgo, TipoRol } from "@prisma/client";

export type ConteoPorNivelRiesgo = Record<NivelRiesgo, number>;
export type ConteoPorTipoRol = Record<TipoRol, number>;

export interface ActividadRecienteGlobal {
  id: string;
  entidad: string;
  entidadId: string;
  accion: AccionAuditoria;
  fecha: Date;
  usuario: {
    id: string;
    nombre: string;
  };
  organizacion: {
    id: string;
    nombre: string;
  };
}

// Indicadores de administración GLOBAL de la plataforma — exclusivos del
// Administrador Principal (SUPER_ADMIN). No confundir con
// IndicadoresDashboard (frontend/src/features/dashboard), que es el
// resumen ORGANIZACIONAL de ADMIN_TIC/USUARIO_COMUN: ese sigue viviendo
// del lado del cliente, agregando /activos, /riesgos y /controles de la
// propia organización. Este es un agregado multiempresa que solo puede
// calcularse del lado del servidor.
export interface IndicadoresGlobales {
  totalOrganizaciones: number;
  totalAdministradoresTic: number;
  totalUsuarios: number;
  totalActivos: number;
  totalRiesgos: number;
  riesgosPorNivel: ConteoPorNivelRiesgo;
  usuariosPorTipoRol: ConteoPorTipoRol;
  actividadReciente: ActividadRecienteGlobal[];
}
