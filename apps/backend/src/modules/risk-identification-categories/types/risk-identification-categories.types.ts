export interface CategoriaIdentificacionRiesgo {
  id: string;
  nombre: string;
  descripcion: string | null;
}

export interface CrearCategoriaIdentificacionParams {
  nombre: string;
  descripcion?: string;
}

export interface ActualizarCategoriaIdentificacionParams {
  nombre?: string;
  descripcion?: string;
}
