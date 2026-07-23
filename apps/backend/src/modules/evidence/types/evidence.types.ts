export type EstadoEvidencia = "SUBIDA" | "VALIDADA" | "RECHAZADA";

export interface EvidenciaConRelaciones {
  id: string;
  riesgoId: string | null;
  tratamientoId: string | null;
  controlId: string | null;
  nombreArchivo: string;
  rutaArchivo: string;
  estado: EstadoEvidencia;
  subidoPorId: string;
  validadoPorId: string | null;
  comentarioValidacion: string | null;
  creadoEn: Date;
  subidoPor: { id: string; nombre: string; email: string };
  validadoPor: { id: string; nombre: string; email: string } | null;
}

export interface CrearEvidenciaParams {
  riesgoId: string | null;
  tratamientoId: string | null;
  controlId: string | null;
  nombreArchivo: string;
  rutaArchivo: string;
  subidoPorId: string;
  organizacionId: string;
  direccionIp: string;
}

export interface ValidarEvidenciaParams {
  evidenciaId: string;
  estado: "VALIDADA" | "RECHAZADA";
  comentarioValidacion: string | null;
  validadoPorId: string;
  organizacionId: string;
  direccionIp: string;
}

export interface FiltrosEvidencias {
  riesgoId?: string;
  tratamientoId?: string;
  controlId?: string;
  estado?: EstadoEvidencia;
}
