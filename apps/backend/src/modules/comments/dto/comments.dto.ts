export interface ComentarioResponseDTO {
  id: string;
  riesgoId: string | null;
  evaluacionId: string | null;
  tratamientoId: string | null;
  controlId: string | null;
  contenido: string;
  creadoEn: string;
  usuario: { id: string; nombre: string; email: string };
}
