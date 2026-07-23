export interface ResolucionRiesgoResponseDTO {
  id: string;
  riesgoId: string;
  tipo: string;
  justificacion: string;
  fecha: string;
  usuario: { id: string; nombre: string };
}
