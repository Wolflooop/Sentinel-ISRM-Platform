export interface SeguimientoResponseDTO {
  id: string;
  riesgoId: string | null;
  tratamientoId: string | null;
  controlId: string | null;
  descripcion: string;
  fecha: string;
  usuario: { id: string; nombre: string; email: string };
}
