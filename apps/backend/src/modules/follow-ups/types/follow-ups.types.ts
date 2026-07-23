export interface SeguimientoConRelaciones {
  id: string;
  riesgoId: string | null;
  tratamientoId: string | null;
  controlId: string | null;
  usuarioId: string;
  descripcion: string;
  fecha: Date;
  usuario: { id: string; nombre: string; email: string };
}

export interface CrearSeguimientoParams {
  riesgoId: string | null;
  tratamientoId: string | null;
  controlId: string | null;
  usuarioId: string;
  descripcion: string;
  organizacionId: string;
  direccionIp: string;
}

export interface FiltrosSeguimientos {
  riesgoId?: string;
  tratamientoId?: string;
  controlId?: string;
}
