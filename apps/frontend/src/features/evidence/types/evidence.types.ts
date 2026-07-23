export type EstadoEvidencia = "SUBIDA" | "VALIDADA" | "RECHAZADA";

export interface Evidencia {
  id: string;
  riesgoId: string | null;
  tratamientoId: string | null;
  controlId: string | null;
  nombreArchivo: string;
  estado: EstadoEvidencia;
  comentarioValidacion: string | null;
  creadoEn: string;
  subidoPor: { id: string; nombre: string; email: string };
  validadoPor: { id: string; nombre: string; email: string } | null;
}

export type DestinoEvidencia =
  | { riesgoId: string }
  | { tratamientoId: string }
  | { controlId: string };
