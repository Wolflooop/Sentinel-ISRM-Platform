export interface ReporteResponseDTO {
  id: string;
  organizacionId: string;
  tipo: string;
  formato: string;
  fecha: string;
  usuario: {
    id: string;
    nombre: string;
  };
}
