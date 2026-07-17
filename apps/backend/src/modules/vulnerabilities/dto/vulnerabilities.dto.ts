
export interface VulnerabilidadResponseDTO {
  id: string;
  nombre: string;
  descripcion: string | null;
  severidad: number;
  referenciaCVE: string | null;
  categoria: { id: string; nombre: string };
}

export interface CategoriaVulnerabilidadResponseDTO {
  id: string;
  nombre: string;
  descripcion: string | null;
}
