
export interface RiesgoResponseDTO {
  id: string;
  probabilidad: number;
  impacto: number;
  valorRiesgo: number;
  nivelRiesgoInherente: string;
  nivelRiesgoResidual: string | null;
  estado: string;
  fechaUltimoCalculo: string;
  creadoEn: string;
  activo: { id: string; nombre: string };
  amenaza: { id: string; nombre: string };
  vulnerabilidad: { id: string; nombre: string };
}

export interface RiesgoHistorialResponseDTO {
  id: string;
  estadoAnterior: string | null;
  estadoNuevo: string;
  comentario: string | null;
  createdAt: string;
  usuario: { id: string; nombre: string; rol: string };
}
