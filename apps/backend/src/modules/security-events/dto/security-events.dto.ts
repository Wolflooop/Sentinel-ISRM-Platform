export interface EventoSeguridadResponseDTO {
  id: string;
  evento: string;
  resultado: string;
  severidad: string;
  direccionIp: string;
  descripcion: string;
  detalles: unknown;
  fecha: string;
  usuario: { id: string; nombre: string; email: string } | null;
}
