export interface RiesgoResponseDTO {
  id: string;
  origen: string;
  titulo: string | null;
  descripcion: string | null;
  justificacionOrigen: string | null;
  estado: string;
  creadoEn: string;

  creador: {
    id: string;
    nombre: string;
  };

  responsable: {
    id: string;
    nombre: string;
  } | null;

  categoriaIdentificacion: {
    id: string;
    nombre: string;
  } | null;

  activo: {
    id: string;
    nombre: string;
  } | null;

  amenaza: {
    id: string;
    nombre: string;
  } | null;

  vulnerabilidad: {
    id: string;
    nombre: string;
  } | null;

  evaluacionActual: {
    id: string;
    tipoEvaluacion: string;
    probabilidad: number;
    impacto: number;
    valorCalculado: number;
    nivelRiesgo: string;
    fechaEvaluacion: string;
  } | null;
}

export interface RiesgoHistorialResponseDTO {
  id: string;
  estadoAnterior: string | null;
  estadoNuevo: string;
  comentario: string | null;
  createdAt: string;
  usuario: {
    id: string;
    nombre: string;
    rol: string;
  };
}