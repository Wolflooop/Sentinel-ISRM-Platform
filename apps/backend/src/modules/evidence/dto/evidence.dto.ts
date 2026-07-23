export interface EvidenciaResponseDTO {
  id: string;
  riesgoId: string | null;
  tratamientoId: string | null;
  controlId: string | null;
  nombreArchivo: string;
  estado: string;
  comentarioValidacion: string | null;
  creadoEn: string;
  subidoPor: { id: string; nombre: string; email: string };
  validadoPor: { id: string; nombre: string; email: string } | null;
}
