/**
 * Tipos internos del módulo context (Contexto ISO), compartidos entre
 * repository y service. No son DTO de respuesta (ver dto/context.dto.ts) ni
 * esquemas de validación de entrada (ver schema/context.schema.ts).
 *
 * Reflejan exactamente los modelos `Contexto`, `EscalaImpacto`,
 * `EscalaProbabilidad` y `MatrizRiesgo` de schema.prisma — ningún campo
 * agregado ni omitido. El enum se redefine como unión de string literal (no
 * se importa `@prisma/client` aquí), igual que en organizations.types.ts.
 */
export type NivelRiesgo = "BAJO" | "MEDIO" | "ALTO" | "CRITICO";

export interface Contexto {
  id: string;
  organizacionId: string;
  alcance: string;
  criteriosAceptacion: string;
  activo: boolean;
  creadoEn: Date;
}

export interface EscalaImpacto {
  id: string;
  contextoId: string;
  nivel: number;
  etiqueta: string;
  descripcion: string | null;
}

export interface EscalaProbabilidad {
  id: string;
  contextoId: string;
  nivel: number;
  etiqueta: string;
  descripcion: string | null;
}

export interface MatrizCelda {
  id: string;
  contextoId: string;
  nivelProbabilidad: number;
  nivelImpacto: number;
  nivelResultante: NivelRiesgo;
}

export interface ContextoConDetalle extends Contexto {
  escalasImpacto: EscalaImpacto[];
  escalasProbabilidad: EscalaProbabilidad[];
  matriz: MatrizCelda[];
}

export interface CrearContextoParams {
  organizacionId: string;
  alcance: string;
  criteriosAceptacion: string;
}

export interface ActualizarContextoParams {
  alcance?: string;
  criteriosAceptacion?: string;
}

export interface EscalaItemParams {
  nivel: number;
  etiqueta: string;
  descripcion?: string;
}

export interface MatrizCeldaParams {
  nivelProbabilidad: number;
  nivelImpacto: number;
  nivelResultante: NivelRiesgo;
}

export interface RegistrarAuditoriaParams {
  usuarioId: string;
  organizacionId: string;
  entidad: string;
  entidadId: string;
  accion: "CREAR" | "EDITAR" | "ELIMINAR" | "APROBAR";
  datosAnteriores?: unknown;
  datosNuevos?: unknown;
  direccionIp: string;
}
