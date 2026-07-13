/**
 * Tipos internos del módulo risks. No se importa `@prisma/client` aquí —
 * los enums se redefinen como uniones de string literal, igual que en el
 * resto de módulos. Solo repository.ts toca Prisma.
 *
 * IMPORTANTE: `ActivoAmenazaVulnerabilidad` (AAV) NO tiene tipo/DTO propio
 * expuesto — es un detalle interno de `crearAavYRiesgo` en el repository.
 * Estos tipos modelan únicamente lo que el módulo Riesgos expone.
 */
export type EstadoRiesgo =
  | "IDENTIFICADO"
  | "EN_ANALISIS"
  | "EVALUADO"
  | "TRATADO"
  | "CERRADO"
  | "MONITOREADO"
  | "ACEPTADO";

export type NivelRiesgo = "BAJO" | "MEDIO" | "ALTO" | "CRITICO";

export interface RiesgoConRelaciones {
  id: string;
  probabilidad: number;
  impacto: number;
  valorRiesgo: number;
  nivelRiesgoInherente: NivelRiesgo;
  nivelRiesgoResidual: NivelRiesgo | null;
  fechaUltimoCalculo: Date;
  estado: EstadoRiesgo;
  creadoEn: Date;
  aav: {
    activo: { id: string; nombre: string };
    amenaza: { id: string; nombre: string };
    vulnerabilidad: { id: string; nombre: string };
  };
}

export interface FiltrosRiesgos {
  estado?: EstadoRiesgo;
  nivelRiesgoInherente?: NivelRiesgo;
}

/**
 * Entrada del caso de uso de creación. `nivelRiesgoInherente` ya viene
 * resuelto por el Service (consultando la MatrizRiesgo del Contexto activo)
 * antes de llegar al repository transaccional. Incluye `organizacionId` y
 * `actor` porque la Auditoría se registra DENTRO de la misma transacción
 * que crea el AAV/Riesgo (corrección de auditoría: el flujo obligatorio de
 * la Fase 9 exige "crear Riesgo → registrar Auditoría → COMMIT", no una
 * escritura de auditoría posterior al commit).
 */
export interface CrearRiesgoParams {
  organizacionId: string;
  activoId: string;
  amenazaId: string;
  vulnerabilidadId: string;
  probabilidad: number;
  impacto: number;
  nivelRiesgoInherente: NivelRiesgo;
  actor: {
    usuarioId: string;
    direccionIp: string;
  };
}

export interface ActivoResumen {
  id: string;
  organizacionId: string;
  nombre: string;
  estado: string;
}

export interface AmenazaResumen {
  id: string;
  organizacionId: string | null;
  nombre: string;
}

export interface VulnerabilidadResumen {
  id: string;
  nombre: string;
}

export interface ContextoActivoResumen {
  id: string;
  organizacionId: string;
}

export interface CeldaMatrizResumen {
  nivelResultante: NivelRiesgo;
}
