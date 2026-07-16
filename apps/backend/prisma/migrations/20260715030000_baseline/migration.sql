-- Baseline migration escrita a mano (ver docs de auditoría técnica).
-- Motivo: el motor de Prisma no puede descargarse en este entorno
-- (binaries.prisma.sh bloqueado), por lo que no fue posible generar esta
-- migración con `prisma migrate dev`. Este SQL fue validado directamente
-- contra una base limpia con psql y verificado columna por columna,
-- constraint por constraint y FK por FK contra schema.prisma.
-- Cubre todo el esquema EXCEPTO EventoSeguridad (migración posterior
-- 20260715035125_add_evento_seguridad).

-- ============================================================================
-- ENUMERACIONES (15)
-- ============================================================================

CREATE TYPE "Sector" AS ENUM ('PUBLICO', 'PRIVADO');

CREATE TYPE "TamanoOrganizacion" AS ENUM ('MICRO', 'PEQUENA', 'MEDIANA', 'GRANDE');

CREATE TYPE "EstadoOrganizacion" AS ENUM ('ACTIVA', 'SUSPENDIDA', 'INACTIVA');

CREATE TYPE "FormatoReporte" AS ENUM ('PDF', 'XLSX', 'CSV');

CREATE TYPE "AccionAuditoria" AS ENUM ('CREAR', 'EDITAR', 'ELIMINAR', 'APROBAR');

CREATE TYPE "NivelRiesgo" AS ENUM ('BAJO', 'MEDIO', 'ALTO', 'CRITICO');

CREATE TYPE "EstadoActivo" AS ENUM ('ACTIVO', 'INACTIVO', 'RETIRADO');

CREATE TYPE "OrigenAmenaza" AS ENUM ('INTERNO', 'EXTERNO');

CREATE TYPE "EstadoRiesgo" AS ENUM ('IDENTIFICADO', 'EN_ANALISIS', 'EVALUADO', 'TRATADO', 'CERRADO', 'MONITOREADO', 'ACEPTADO');

CREATE TYPE "ResultadoEvaluacion" AS ENUM ('ACEPTABLE', 'NO_ACEPTABLE');

CREATE TYPE "EstrategiaTratamiento" AS ENUM ('EVITAR', 'MITIGAR', 'TRANSFERIR', 'ACEPTAR');

CREATE TYPE "EstadoTratamiento" AS ENUM ('PLANIFICADO', 'EN_PROGRESO', 'IMPLEMENTADO', 'VENCIDO');

CREATE TYPE "TipoControl" AS ENUM ('PREVENTIVO', 'DETECTIVO', 'CORRECTIVO');

CREATE TYPE "EstadoImplementacionControl" AS ENUM ('NO_APLICADO', 'PLANIFICADO', 'EN_PROGRESO', 'IMPLEMENTADO');

CREATE TYPE "TipoReporte" AS ENUM ('EJECUTIVO', 'TECNICO', 'GENERAL');

-- ============================================================================
-- TABLAS (23)
-- ============================================================================

-- 1. ADMINISTRACIÓN

CREATE TABLE "Organizacion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "sector" "Sector" NOT NULL,
    "tamano" "TamanoOrganizacion" NOT NULL,
    "paisIso" CHAR(2) NOT NULL,
    "correoContacto" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "estado" "EstadoOrganizacion" NOT NULL DEFAULT 'ACTIVA',
    "diasAlertaTratamiento" INTEGER DEFAULT 15,
    "formatoReportePredeterminado" "FormatoReporte" DEFAULT 'PDF',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organizacion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "organizacionId" TEXT NOT NULL,
    "rolId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "intentosFallidos" INTEGER NOT NULL DEFAULT 0,
    "bloqueadoHasta" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoLogin" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Rol" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "esSistema" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Permiso" (
    "id" TEXT NOT NULL,
    "recurso" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "Permiso_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RolPermiso" (
    "rolId" TEXT NOT NULL,
    "permisoId" TEXT NOT NULL,

    CONSTRAINT "RolPermiso_pkey" PRIMARY KEY ("rolId","permisoId")
);

CREATE TABLE "Sesion" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "revocado" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sesion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Auditoria" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "organizacionId" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "accion" "AccionAuditoria" NOT NULL,
    "datosAnteriores" JSONB,
    "datosNuevos" JSONB,
    "direccionIp" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Auditoria_pkey" PRIMARY KEY ("id")
);

-- 2. CONTEXTO ISO

CREATE TABLE "Contexto" (
    "id" TEXT NOT NULL,
    "organizacionId" TEXT NOT NULL,
    "alcance" TEXT NOT NULL,
    "criteriosAceptacion" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contexto_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EscalaImpacto" (
    "id" TEXT NOT NULL,
    "contextoId" TEXT NOT NULL,
    "nivel" INTEGER NOT NULL,
    "etiqueta" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "EscalaImpacto_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EscalaProbabilidad" (
    "id" TEXT NOT NULL,
    "contextoId" TEXT NOT NULL,
    "nivel" INTEGER NOT NULL,
    "etiqueta" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "EscalaProbabilidad_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MatrizRiesgo" (
    "id" TEXT NOT NULL,
    "contextoId" TEXT NOT NULL,
    "nivelProbabilidad" INTEGER NOT NULL,
    "nivelImpacto" INTEGER NOT NULL,
    "nivelResultante" "NivelRiesgo" NOT NULL,

    CONSTRAINT "MatrizRiesgo_pkey" PRIMARY KEY ("id")
);

-- 3. INVENTARIO, AMENAZAS, VULNERABILIDADES

CREATE TABLE "CategoriaActivo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "CategoriaActivo_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Activo" (
    "id" TEXT NOT NULL,
    "organizacionId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "usuarioResponsableId" TEXT NOT NULL,
    "ubicacion" TEXT,
    "criticidad" INTEGER NOT NULL,
    "valorEconomicoEstimado" DECIMAL(14,2),
    "estado" "EstadoActivo" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "Activo_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CategoriaAmenaza" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "CategoriaAmenaza_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Amenaza" (
    "id" TEXT NOT NULL,
    "organizacionId" TEXT,
    "categoriaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "origen" "OrigenAmenaza" NOT NULL,
    "esPredefinida" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Amenaza_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CategoriaVulnerabilidad" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "CategoriaVulnerabilidad_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Vulnerabilidad" (
    "id" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "severidad" INTEGER NOT NULL,
    "referenciaCVE" TEXT,

    CONSTRAINT "Vulnerabilidad_pkey" PRIMARY KEY ("id")
);

-- 4. ANÁLISIS (AAV, RIESGO, EVALUACIÓN)

CREATE TABLE "ActivoAmenazaVulnerabilidad" (
    "id" TEXT NOT NULL,
    "activoId" TEXT NOT NULL,
    "amenazaId" TEXT NOT NULL,
    "vulnerabilidadId" TEXT NOT NULL,

    CONSTRAINT "ActivoAmenazaVulnerabilidad_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Riesgo" (
    "id" TEXT NOT NULL,
    "aavId" TEXT NOT NULL,
    "probabilidad" INTEGER NOT NULL,
    "impacto" INTEGER NOT NULL,
    "valorRiesgo" INTEGER NOT NULL,
    "nivelRiesgoInherente" "NivelRiesgo" NOT NULL,
    "nivelRiesgoResidual" "NivelRiesgo",
    "fechaUltimoCalculo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoRiesgo" NOT NULL DEFAULT 'IDENTIFICADO',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Riesgo_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Evaluacion" (
    "id" TEXT NOT NULL,
    "riesgoId" TEXT NOT NULL,
    "contextoId" TEXT NOT NULL,
    "resultado" "ResultadoEvaluacion" NOT NULL,
    "justificacion" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "fechaEvaluacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evaluacion_pkey" PRIMARY KEY ("id")
);

-- 5. TRATAMIENTO

CREATE TABLE "Tratamiento" (
    "id" TEXT NOT NULL,
    "evaluacionId" TEXT NOT NULL,
    "controlPrincipalId" TEXT,
    "estrategia" "EstrategiaTratamiento" NOT NULL,
    "descripcionPlan" TEXT NOT NULL,
    "usuarioResponsableId" TEXT NOT NULL,
    "fechaLimite" DATE NOT NULL,
    "estado" "EstadoTratamiento" NOT NULL DEFAULT 'PLANIFICADO',
    "porcentajeAvance" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Tratamiento_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Control" (
    "id" TEXT NOT NULL,
    "organizacionId" TEXT,
    "codigoIso27001" TEXT,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoControl" NOT NULL,
    "estadoImplementacion" "EstadoImplementacionControl" NOT NULL DEFAULT 'NO_APLICADO',
    "fechaImplementacion" DATE,
    "observaciones" TEXT,
    "descripcionImplementacion" TEXT,

    CONSTRAINT "Control_pkey" PRIMARY KEY ("id")
);

-- 6. REPORTES

CREATE TABLE "Reporte" (
    "id" TEXT NOT NULL,
    "organizacionId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "TipoReporte" NOT NULL,
    "formato" "FormatoReporte" NOT NULL,
    "rutaArchivo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reporte_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- ÍNDICES ÚNICOS Y REGULARES
-- ============================================================================

CREATE UNIQUE INDEX "Organizacion_nombre_key" ON "Organizacion"("nombre");

CREATE UNIQUE INDEX "Usuario_organizacionId_email_key" ON "Usuario"("organizacionId", "email");
CREATE INDEX "Usuario_rolId_idx" ON "Usuario"("rolId");

CREATE UNIQUE INDEX "Rol_nombre_key" ON "Rol"("nombre");

CREATE UNIQUE INDEX "Permiso_recurso_accion_key" ON "Permiso"("recurso", "accion");

CREATE UNIQUE INDEX "Sesion_tokenHash_key" ON "Sesion"("tokenHash");
CREATE INDEX "Sesion_usuarioId_idx" ON "Sesion"("usuarioId");

CREATE INDEX "Contexto_organizacionId_idx" ON "Contexto"("organizacionId");
-- Índice único parcial (documentado en schema.prisma, Prisma no lo expresa nativamente):
-- garantiza como máximo un Contexto activo por organización.
CREATE UNIQUE INDEX "contexto_organizacion_activo_unique" ON "Contexto"("organizacionId") WHERE "activo" = true;

CREATE UNIQUE INDEX "EscalaImpacto_contextoId_nivel_key" ON "EscalaImpacto"("contextoId", "nivel");

CREATE UNIQUE INDEX "EscalaProbabilidad_contextoId_nivel_key" ON "EscalaProbabilidad"("contextoId", "nivel");

CREATE UNIQUE INDEX "MatrizRiesgo_contextoId_nivelProbabilidad_nivelImpacto_key" ON "MatrizRiesgo"("contextoId", "nivelProbabilidad", "nivelImpacto");

CREATE UNIQUE INDEX "CategoriaActivo_nombre_key" ON "CategoriaActivo"("nombre");

CREATE UNIQUE INDEX "Activo_organizacionId_nombre_key" ON "Activo"("organizacionId", "nombre");
CREATE INDEX "Activo_categoriaId_idx" ON "Activo"("categoriaId");
CREATE INDEX "Activo_criticidad_idx" ON "Activo"("criticidad");

CREATE UNIQUE INDEX "CategoriaAmenaza_nombre_key" ON "CategoriaAmenaza"("nombre");

CREATE UNIQUE INDEX "Amenaza_organizacionId_nombre_key" ON "Amenaza"("organizacionId", "nombre");
CREATE INDEX "Amenaza_esPredefinida_idx" ON "Amenaza"("esPredefinida");

CREATE UNIQUE INDEX "CategoriaVulnerabilidad_nombre_key" ON "CategoriaVulnerabilidad"("nombre");

CREATE INDEX "Vulnerabilidad_severidad_idx" ON "Vulnerabilidad"("severidad");

CREATE UNIQUE INDEX "ActivoAmenazaVulnerabilidad_activoId_amenazaId_vulnerabilidadId_key" ON "ActivoAmenazaVulnerabilidad"("activoId", "amenazaId", "vulnerabilidadId");
CREATE INDEX "ActivoAmenazaVulnerabilidad_amenazaId_idx" ON "ActivoAmenazaVulnerabilidad"("amenazaId");
CREATE INDEX "ActivoAmenazaVulnerabilidad_vulnerabilidadId_idx" ON "ActivoAmenazaVulnerabilidad"("vulnerabilidadId");

CREATE UNIQUE INDEX "Riesgo_aavId_key" ON "Riesgo"("aavId");
CREATE INDEX "Riesgo_estado_idx" ON "Riesgo"("estado");
CREATE INDEX "Riesgo_nivelRiesgoInherente_idx" ON "Riesgo"("nivelRiesgoInherente");

CREATE INDEX "Evaluacion_riesgoId_fechaEvaluacion_idx" ON "Evaluacion"("riesgoId", "fechaEvaluacion");

CREATE UNIQUE INDEX "Tratamiento_evaluacionId_key" ON "Tratamiento"("evaluacionId");
CREATE INDEX "Tratamiento_controlPrincipalId_idx" ON "Tratamiento"("controlPrincipalId");
CREATE INDEX "Tratamiento_estado_idx" ON "Tratamiento"("estado");
CREATE INDEX "Tratamiento_fechaLimite_idx" ON "Tratamiento"("fechaLimite");

CREATE INDEX "Control_codigoIso27001_idx" ON "Control"("codigoIso27001");
CREATE INDEX "Control_estadoImplementacion_idx" ON "Control"("estadoImplementacion");

CREATE INDEX "Reporte_organizacionId_idx" ON "Reporte"("organizacionId");
CREATE INDEX "Reporte_fecha_idx" ON "Reporte"("fecha");

-- ============================================================================
-- RESTRICCIONES CHECK DE DOMINIO (10 — todas documentadas en schema.prisma)
-- ============================================================================

ALTER TABLE "Vulnerabilidad" ADD CONSTRAINT "Vulnerabilidad_severidad_check" CHECK ("severidad" BETWEEN 1 AND 5);

ALTER TABLE "Riesgo" ADD CONSTRAINT "Riesgo_probabilidad_check" CHECK ("probabilidad" BETWEEN 1 AND 5);
ALTER TABLE "Riesgo" ADD CONSTRAINT "Riesgo_impacto_check" CHECK ("impacto" BETWEEN 1 AND 5);
ALTER TABLE "Riesgo" ADD CONSTRAINT "Riesgo_valorRiesgo_check" CHECK ("valorRiesgo" BETWEEN 1 AND 25);

ALTER TABLE "Tratamiento" ADD CONSTRAINT "Tratamiento_porcentajeAvance_check" CHECK ("porcentajeAvance" BETWEEN 0 AND 100);

ALTER TABLE "Activo" ADD CONSTRAINT "Activo_criticidad_check" CHECK ("criticidad" BETWEEN 1 AND 5);

ALTER TABLE "EscalaImpacto" ADD CONSTRAINT "EscalaImpacto_nivel_check" CHECK ("nivel" BETWEEN 1 AND 5);
ALTER TABLE "EscalaProbabilidad" ADD CONSTRAINT "EscalaProbabilidad_nivel_check" CHECK ("nivel" BETWEEN 1 AND 5);
ALTER TABLE "MatrizRiesgo" ADD CONSTRAINT "MatrizRiesgo_nivelProbabilidad_check" CHECK ("nivelProbabilidad" BETWEEN 1 AND 5);
ALTER TABLE "MatrizRiesgo" ADD CONSTRAINT "MatrizRiesgo_nivelImpacto_check" CHECK ("nivelImpacto" BETWEEN 1 AND 5);

-- ============================================================================
-- LLAVES FORÁNEAS (32)
-- ============================================================================

ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "Organizacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RolPermiso" ADD CONSTRAINT "RolPermiso_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RolPermiso" ADD CONSTRAINT "RolPermiso_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "Permiso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Sesion" ADD CONSTRAINT "Sesion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Auditoria" ADD CONSTRAINT "Auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Auditoria" ADD CONSTRAINT "Auditoria_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "Organizacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Contexto" ADD CONSTRAINT "Contexto_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "Organizacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "EscalaImpacto" ADD CONSTRAINT "EscalaImpacto_contextoId_fkey" FOREIGN KEY ("contextoId") REFERENCES "Contexto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EscalaProbabilidad" ADD CONSTRAINT "EscalaProbabilidad_contextoId_fkey" FOREIGN KEY ("contextoId") REFERENCES "Contexto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MatrizRiesgo" ADD CONSTRAINT "MatrizRiesgo_contextoId_fkey" FOREIGN KEY ("contextoId") REFERENCES "Contexto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Activo" ADD CONSTRAINT "Activo_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "Organizacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Activo" ADD CONSTRAINT "Activo_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaActivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Activo" ADD CONSTRAINT "Activo_usuarioResponsableId_fkey" FOREIGN KEY ("usuarioResponsableId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Amenaza" ADD CONSTRAINT "Amenaza_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "Organizacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Amenaza" ADD CONSTRAINT "Amenaza_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaAmenaza"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Vulnerabilidad" ADD CONSTRAINT "Vulnerabilidad_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaVulnerabilidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ActivoAmenazaVulnerabilidad" ADD CONSTRAINT "ActivoAmenazaVulnerabilidad_activoId_fkey" FOREIGN KEY ("activoId") REFERENCES "Activo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ActivoAmenazaVulnerabilidad" ADD CONSTRAINT "ActivoAmenazaVulnerabilidad_amenazaId_fkey" FOREIGN KEY ("amenazaId") REFERENCES "Amenaza"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ActivoAmenazaVulnerabilidad" ADD CONSTRAINT "ActivoAmenazaVulnerabilidad_vulnerabilidadId_fkey" FOREIGN KEY ("vulnerabilidadId") REFERENCES "Vulnerabilidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Riesgo" ADD CONSTRAINT "Riesgo_aavId_fkey" FOREIGN KEY ("aavId") REFERENCES "ActivoAmenazaVulnerabilidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Evaluacion" ADD CONSTRAINT "Evaluacion_riesgoId_fkey" FOREIGN KEY ("riesgoId") REFERENCES "Riesgo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Evaluacion" ADD CONSTRAINT "Evaluacion_contextoId_fkey" FOREIGN KEY ("contextoId") REFERENCES "Contexto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Evaluacion" ADD CONSTRAINT "Evaluacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Tratamiento" ADD CONSTRAINT "Tratamiento_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES "Evaluacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Tratamiento" ADD CONSTRAINT "Tratamiento_controlPrincipalId_fkey" FOREIGN KEY ("controlPrincipalId") REFERENCES "Control"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Tratamiento" ADD CONSTRAINT "Tratamiento_usuarioResponsableId_fkey" FOREIGN KEY ("usuarioResponsableId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Control" ADD CONSTRAINT "Control_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "Organizacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "Organizacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
