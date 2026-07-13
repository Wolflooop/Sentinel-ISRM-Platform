/**
 * Sin `esPropia`/`esPredefinida` (a diferencia de threats.dto.ts): el
 * catálogo de Vulnerabilidad es 100% global y compartido por igual entre
 * todas las organizaciones — no existe la distinción física en
 * schema.prisma, por lo que no se deriva ningún campo equivalente aquí.
 */
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
