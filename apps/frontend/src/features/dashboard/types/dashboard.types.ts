export type NivelRiesgo = "BAJO" | "MEDIO" | "ALTO" | "CRITICO";
export type EstadoImplementacionControl = "NO_INICIADO" | "EN_PROGRESO" | "IMPLEMENTADO" | "VERIFICADO";

export interface ActivoResumen {
  id: string;
}

// V2: el nivel de riesgo ya no vive como campos planos en Riesgo — vive en
// la Evaluacion vigente (evaluacionActual), que puede ser INHERENTE o
// RESIDUAL según cuál se haya registrado más recientemente.
export interface RiesgoResumen {
  id: string;
  evaluacionActual: {
    nivelRiesgo: NivelRiesgo;
  } | null;
}

export interface ControlResumen {
  id: string;
  estadoImplementacion: EstadoImplementacionControl;
}

export type ConteoPorNivel = Record<NivelRiesgo, number>;
export type ConteoPorEstadoControl = Record<EstadoImplementacionControl, number>;

export interface IndicadoresDashboard {
  totalActivos: number;
  totalRiesgos: number;
  riesgosCriticos: number;
  totalControles: number;
  riesgosPorNivel: ConteoPorNivel;
  controlesPorEstado: ConteoPorEstadoControl;
}

export type ConteoPorTipoRol = Record<"SUPER_ADMIN" | "ADMIN_TIC" | "USUARIO_COMUN", number>;

export type AccionAuditoria = "CREAR" | "EDITAR" | "ELIMINAR" | "APROBAR";

export interface ActividadRecienteGlobal {
  id: string;
  entidad: string;
  entidadId: string;
  accion: AccionAuditoria;
  fecha: string;
  usuario: { id: string; nombre: string };
  organizacion: { id: string; nombre: string };
}

// Indicadores de administración GLOBAL de la plataforma (GET
// /api/dashboard/global) — exclusivos del Administrador Principal
// (SUPER_ADMIN). No confundir con IndicadoresDashboard, que es el
// resumen organizacional de ADMIN_TIC/USUARIO_COMUN.
export interface IndicadoresGlobales {
  totalOrganizaciones: number;
  totalAdministradoresTic: number;
  totalUsuarios: number;
  totalActivos: number;
  totalRiesgos: number;
  riesgosPorNivel: ConteoPorNivel;
  usuariosPorTipoRol: ConteoPorTipoRol;
  actividadReciente: ActividadRecienteGlobal[];
}
