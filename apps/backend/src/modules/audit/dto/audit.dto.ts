export interface RegistroAuditoriaResponseDTO {
  id: string;
  entidad: string;
  entidadId: string;
  accion: string;
  datosAnteriores: unknown;
  datosNuevos: unknown;
  direccionIp: string;
  fecha: string;
  usuario: {
    id: string;
    nombre: string;
    email: string;
  };
}
