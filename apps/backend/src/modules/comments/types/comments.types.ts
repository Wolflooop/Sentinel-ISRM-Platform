export type DestinoComentario = "RIESGO" | "EVALUACION" | "TRATAMIENTO" | "CONTROL";

export interface ComentarioConRelaciones {
  id: string;
  riesgoId: string | null;
  evaluacionId: string | null;
  tratamientoId: string | null;
  controlId: string | null;
  usuarioId: string;
  contenido: string;
  creadoEn: Date;
  usuario: { id: string; nombre: string; email: string };
}

export interface CrearComentarioParams {
  riesgoId: string | null;
  evaluacionId: string | null;
  tratamientoId: string | null;
  controlId: string | null;
  usuarioId: string;
  contenido: string;
  organizacionId: string;
  direccionIp: string;
}

export interface FiltrosComentarios {
  riesgoId?: string;
  evaluacionId?: string;
  tratamientoId?: string;
  controlId?: string;
}
