-- ============================================================================
-- MIGRACIÓN V2: Riesgo (origen dual), Evaluacion (promovida), Tratamiento
-- (desacoplado de Evaluacion), TratamientoControl (N:M), Vulnerabilidad
-- (catálogo global/org), Control.responsableId, ResolucionRiesgo,
-- Comentario, Seguimiento, Evidencia, remapeo de enums.
--
-- Escrita a mano (no generada por `prisma migrate dev`, ya que el entorno de
-- desarrollo no tiene acceso a los binarios de motor de Prisma). Ejecutar
-- contra una base con los datos de V1 ya cargados. Idempotente solo en el
-- sentido de que usa IF NOT EXISTS/IF EXISTS donde es seguro; no debe
-- ejecutarse dos veces sobre la misma base.
-- ============================================================================

-- pgcrypto: necesario para gen_random_uuid() en los INSERT de backfill de
-- esta migración. Prisma genera UUIDs en la capa de aplicación (@default
-- (uuid()), no en la base de datos), por lo que no existe una función nativa
-- disponible sin esta extensión.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- SECCIÓN 1 — NUEVOS ENUMS
-- ============================================================================

CREATE TYPE "OrigenRiesgo" AS ENUM ('AAV', 'MANUAL');
CREATE TYPE "TipoEvaluacion" AS ENUM ('INHERENTE', 'RESIDUAL');
CREATE TYPE "EstadoEvidencia" AS ENUM ('SUBIDA', 'VALIDADA', 'RECHAZADA');
CREATE TYPE "TipoResolucionRiesgo" AS ENUM ('RESOLUCION', 'REAPERTURA');

-- EstadoRiesgo: se agrega REABIERTO (Postgres permite ADD VALUE dentro de
-- transacción desde v12+; no se usa el valor en esta misma migración).
ALTER TYPE "EstadoRiesgo" ADD VALUE 'REABIERTO';

-- ============================================================================
-- SECCIÓN 2 — REMAPEO DE EstadoTratamiento
-- PLANIFICADO -> PROPUESTO, EN_PROGRESO -> EN_EJECUCION,
-- IMPLEMENTADO -> COMPLETADO, VENCIDO se mantiene.
-- ============================================================================

CREATE TYPE "EstadoTratamiento_new" AS ENUM ('PROPUESTO', 'EN_EJECUCION', 'COMPLETADO', 'VENCIDO');

ALTER TABLE "Tratamiento" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "Tratamiento" ALTER COLUMN "estado" TYPE "EstadoTratamiento_new" USING (
  CASE "estado"::text
    WHEN 'PLANIFICADO' THEN 'PROPUESTO'
    WHEN 'EN_PROGRESO'  THEN 'EN_EJECUCION'
    WHEN 'IMPLEMENTADO' THEN 'COMPLETADO'
    WHEN 'VENCIDO'      THEN 'VENCIDO'
  END
)::"EstadoTratamiento_new";

DROP TYPE "EstadoTratamiento";
ALTER TYPE "EstadoTratamiento_new" RENAME TO "EstadoTratamiento";
ALTER TABLE "Tratamiento" ALTER COLUMN "estado" SET DEFAULT 'PROPUESTO';

-- ============================================================================
-- SECCIÓN 3 — REMAPEO DE EstadoImplementacionControl
-- NO_APLICADO -> NO_INICIADO, PLANIFICADO -> NO_INICIADO (consolidados),
-- EN_PROGRESO sin cambio, IMPLEMENTADO sin cambio, + nuevo VERIFICADO.
-- ============================================================================

CREATE TYPE "EstadoImplementacionControl_new" AS ENUM ('NO_INICIADO', 'EN_PROGRESO', 'IMPLEMENTADO', 'VERIFICADO');

ALTER TABLE "Control" ALTER COLUMN "estadoImplementacion" DROP DEFAULT;
ALTER TABLE "Control" ALTER COLUMN "estadoImplementacion" TYPE "EstadoImplementacionControl_new" USING (
  CASE "estadoImplementacion"::text
    WHEN 'NO_APLICADO'  THEN 'NO_INICIADO'
    WHEN 'PLANIFICADO'  THEN 'NO_INICIADO'
    WHEN 'EN_PROGRESO'  THEN 'EN_PROGRESO'
    WHEN 'IMPLEMENTADO' THEN 'IMPLEMENTADO'
  END
)::"EstadoImplementacionControl_new";

-- ControlHistorial.estadoAnterior/estadoNuevo también usan este enum (se
-- detectó al ejecutar esta migración contra una base de prueba real) y
-- deben convertirse antes de poder eliminar el tipo viejo.
ALTER TABLE "ControlHistorial" ALTER COLUMN "estadoAnterior" TYPE "EstadoImplementacionControl_new" USING (
  CASE "estadoAnterior"::text
    WHEN 'NO_APLICADO'  THEN 'NO_INICIADO'
    WHEN 'PLANIFICADO'  THEN 'NO_INICIADO'
    WHEN 'EN_PROGRESO'  THEN 'EN_PROGRESO'
    WHEN 'IMPLEMENTADO' THEN 'IMPLEMENTADO'
    ELSE NULL
  END
)::"EstadoImplementacionControl_new";
ALTER TABLE "ControlHistorial" ALTER COLUMN "estadoNuevo" TYPE "EstadoImplementacionControl_new" USING (
  CASE "estadoNuevo"::text
    WHEN 'NO_APLICADO'  THEN 'NO_INICIADO'
    WHEN 'PLANIFICADO'  THEN 'NO_INICIADO'
    WHEN 'EN_PROGRESO'  THEN 'EN_PROGRESO'
    WHEN 'IMPLEMENTADO' THEN 'IMPLEMENTADO'
  END
)::"EstadoImplementacionControl_new";

DROP TYPE "EstadoImplementacionControl";
ALTER TYPE "EstadoImplementacionControl_new" RENAME TO "EstadoImplementacionControl";
ALTER TABLE "Control" ALTER COLUMN "estadoImplementacion" SET DEFAULT 'NO_INICIADO';

-- ============================================================================
-- SECCIÓN 4 — CategoriaIdentificacionRiesgo (catálogo nuevo)
-- ============================================================================

CREATE TABLE "CategoriaIdentificacionRiesgo" (
  "id"          TEXT NOT NULL,
  "nombre"      TEXT NOT NULL,
  "descripcion" TEXT,
  CONSTRAINT "CategoriaIdentificacionRiesgo_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CategoriaIdentificacionRiesgo_nombre_key" ON "CategoriaIdentificacionRiesgo"("nombre");

-- ============================================================================
-- SECCIÓN 5 — Vulnerabilidad como catálogo global/organización (igual a Amenaza)
-- ============================================================================

ALTER TABLE "Vulnerabilidad" ADD COLUMN "organizacionId" TEXT;
ALTER TABLE "Vulnerabilidad" ADD COLUMN "esPredefinida" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Vulnerabilidad" ADD CONSTRAINT "Vulnerabilidad_organizacionId_fkey"
  FOREIGN KEY ("organizacionId") REFERENCES "Organizacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE UNIQUE INDEX "Vulnerabilidad_organizacionId_nombre_key" ON "Vulnerabilidad"("organizacionId", "nombre");
CREATE INDEX "Vulnerabilidad_esPredefinida_idx" ON "Vulnerabilidad"("esPredefinida");
-- Todas las vulnerabilidades de V1 quedan con organizacionId = NULL, es
-- decir, se convierten en catálogo global. Es la interpretación correcta
-- porque en V1 no existía el concepto de organización propietaria: todas las
-- vulnerabilidades eran, de hecho, compartidas por todas las organizaciones.

-- ============================================================================
-- SECCIÓN 6 — Control.responsableId
-- ============================================================================

ALTER TABLE "Control" ADD COLUMN "responsableId" TEXT;
ALTER TABLE "Control" ADD CONSTRAINT "Control_responsableId_fkey"
  FOREIGN KEY ("responsableId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "Control_responsableId_idx" ON "Control"("responsableId");
-- Se deja NULL para todos los controles existentes: V1 no registraba
-- responsable de control, no hay dato de origen del cual derivarlo sin
-- inventar información. Queda como tarea operativa asignarlo desde el
-- frontend (ver punto 17 del prompt: "Actualizar frontend").

-- ============================================================================
-- SECCIÓN 7 — Riesgo: origen dual, creador/responsable, evaluacionActualId
-- ============================================================================

ALTER TABLE "Riesgo" ADD COLUMN "origen"                    "OrigenRiesgo";
ALTER TABLE "Riesgo" ADD COLUMN "titulo"                     TEXT;
ALTER TABLE "Riesgo" ADD COLUMN "descripcion"                TEXT;
ALTER TABLE "Riesgo" ADD COLUMN "justificacionOrigen"        TEXT;
ALTER TABLE "Riesgo" ADD COLUMN "categoriaIdentificacionId"  TEXT;
ALTER TABLE "Riesgo" ADD COLUMN "evaluacionActualId"         TEXT;
ALTER TABLE "Riesgo" ADD COLUMN "creadorId"                  TEXT;
ALTER TABLE "Riesgo" ADD COLUMN "responsableId"              TEXT;

-- Backfill 7a: todo riesgo de V1 nació con aavId obligatorio -> origen = AAV.
UPDATE "Riesgo" SET "origen" = 'AAV';

-- Backfill 7b: V1 no registraba creador/responsable de Riesgo. La única
-- referencia de "propietario" disponible en la cadena de datos es el
-- responsable del Activo que originó el AAV -> Riesgo. Se usa ese mismo
-- usuario para ambos campos como valor inicial defendible; el endpoint
-- dedicado de reasignación de responsable (punto 13 del prompt) permite
-- corregirlo después sin tocar creadorId.
UPDATE "Riesgo" r
SET "responsableId" = a."usuarioResponsableId",
    "creadorId"     = a."usuarioResponsableId"
FROM "ActivoAmenazaVulnerabilidad" aav
JOIN "Activo" a ON a."id" = aav."activoId"
WHERE r."aavId" = aav."id";

ALTER TABLE "Riesgo" ALTER COLUMN "origen" SET NOT NULL;
ALTER TABLE "Riesgo" ALTER COLUMN "creadorId" SET NOT NULL;
ALTER TABLE "Riesgo" ALTER COLUMN "responsableId" SET NOT NULL;

-- aavId deja de ser obligatorio (el UNIQUE de V1 ya existente se conserva).
ALTER TABLE "Riesgo" ALTER COLUMN "aavId" DROP NOT NULL;

ALTER TABLE "Riesgo" ADD CONSTRAINT "Riesgo_categoriaIdentificacionId_fkey"
  FOREIGN KEY ("categoriaIdentificacionId") REFERENCES "CategoriaIdentificacionRiesgo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Riesgo" ADD CONSTRAINT "Riesgo_creadorId_fkey"
  FOREIGN KEY ("creadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Riesgo" ADD CONSTRAINT "Riesgo_responsableId_fkey"
  FOREIGN KEY ("responsableId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "Riesgo_origen_idx" ON "Riesgo"("origen");
CREATE INDEX "Riesgo_creadorId_idx" ON "Riesgo"("creadorId");
CREATE INDEX "Riesgo_responsableId_idx" ON "Riesgo"("responsableId");

-- ============================================================================
-- SECCIÓN 8 — Evaluacion: promoción de probabilidad/impacto/valorCalculado/
-- nivelRiesgo/tipoEvaluacion desde Riesgo, con backfill, ANTES de tocar
-- las columnas viejas de Riesgo (sección 9).
-- ============================================================================

ALTER TABLE "Evaluacion" ADD COLUMN "tipoEvaluacion"  "TipoEvaluacion";
ALTER TABLE "Evaluacion" ADD COLUMN "probabilidad"    INTEGER;
ALTER TABLE "Evaluacion" ADD COLUMN "impacto"         INTEGER;
ALTER TABLE "Evaluacion" ADD COLUMN "valorCalculado"  INTEGER;
ALTER TABLE "Evaluacion" ADD COLUMN "nivelRiesgo"     "NivelRiesgo";

-- Backfill 8a: en V1, Evaluacion NO almacenaba probabilidad/impacto propios
-- (ese dato vivía únicamente en Riesgo, como snapshot único, no versionado).
-- Toda Evaluacion ya existente en V1 representa, por diseño de V1, un
-- evento POSTERIOR al cálculo inherente (era el paso donde se decidía
-- resultado ACEPTABLE/NO_ACEPTABLE para disparar Tratamiento). Se clasifica
-- por tanto como RESIDUAL y hereda el snapshot vigente del Riesgo padre —
-- es la mejor aproximación posible sin inventar valores, y queda
-- documentado aquí porque V1 no permite reconstruir el valor histórico
-- exacto que tenía el riesgo en el momento de esa evaluación específica.
UPDATE "Evaluacion" e
SET "tipoEvaluacion" = 'RESIDUAL',
    "probabilidad"   = r."probabilidad",
    "impacto"        = r."impacto",
    "valorCalculado" = r."valorRiesgo",
    "nivelRiesgo"    = COALESCE(r."nivelRiesgoResidual", r."nivelRiesgoInherente")
FROM "Riesgo" r
WHERE e."riesgoId" = r."id";

-- Backfill 8b: se genera UNA evaluación INHERENTE nueva por cada Riesgo
-- existente (punto 4 del prompt), copiando el snapshot que hoy vive en
-- Riesgo. contextoId se resuelve al contexto activo de la organización del
-- activo asociado (misma cadena Riesgo -> AAV -> Activo -> Organizacion);
-- usuarioId usa el responsable ya backfillado en la sección 7 (no existe
-- otro usuario "autor del cálculo" registrado en V1); justificacion y
-- resultado son literales/derivados documentados explícitamente como
-- generados por la migración, no como dato original de negocio.
INSERT INTO "Evaluacion" (
  "id", "riesgoId", "contextoId", "tipoEvaluacion",
  "probabilidad", "impacto", "valorCalculado", "nivelRiesgo",
  "resultado", "justificacion", "usuarioId", "fechaEvaluacion"
)
SELECT
  gen_random_uuid()::text,
  r."id",
  ctx."id",
  'INHERENTE',
  r."probabilidad",
  r."impacto",
  r."valorRiesgo",
  r."nivelRiesgoInherente",
  CASE WHEN r."nivelRiesgoInherente" IN ('BAJO', 'MEDIO') THEN 'ACEPTABLE'::"ResultadoEvaluacion"
       ELSE 'NO_ACEPTABLE'::"ResultadoEvaluacion" END,
  'Evaluación inherente generada automáticamente durante la migración V1 -> V2 a partir de los valores previamente almacenados en Riesgo (probabilidad, impacto, nivelRiesgoInherente). El resultado se derivó de nivelRiesgoInherente y debe revisarse manualmente si el criterio de aceptación de la organización difiere del supuesto BAJO/MEDIO = ACEPTABLE.',
  r."responsableId",
  r."fechaUltimoCalculo"
FROM "Riesgo" r
JOIN "ActivoAmenazaVulnerabilidad" aav ON aav."id" = r."aavId"
JOIN "Activo" a ON a."id" = aav."activoId"
JOIN "Contexto" ctx ON ctx."organizacionId" = a."organizacionId" AND ctx."activo" = true;

-- Riesgos de origen AAV cuya organización NO tenga un Contexto activo no
-- reciben evaluación INHERENTE por el INSERT anterior (el JOIN los excluye
-- para no violar la FK obligatoria contextoId). Se reportan explícitamente:
-- no se inventa un contexto ni se deja el riesgo en un estado inconsistente
-- de forma silenciosa.
DO $$
DECLARE
  huerfanos INTEGER;
BEGIN
  SELECT COUNT(*) INTO huerfanos
  FROM "Riesgo" r
  JOIN "ActivoAmenazaVulnerabilidad" aav ON aav."id" = r."aavId"
  JOIN "Activo" a ON a."id" = aav."activoId"
  WHERE NOT EXISTS (
    SELECT 1 FROM "Contexto" ctx WHERE ctx."organizacionId" = a."organizacionId" AND ctx."activo" = true
  );
  IF huerfanos > 0 THEN
    RAISE NOTICE 'ATENCIÓN: % riesgo(s) pertenecen a organizaciones sin Contexto activo y NO recibieron evaluación INHERENTE de backfill. Deben resolverse manualmente antes de continuar (activar un Contexto para esa organización y correr el backfill puntual).', huerfanos;
  END IF;
END $$;

ALTER TABLE "Evaluacion" ALTER COLUMN "tipoEvaluacion" SET NOT NULL;
ALTER TABLE "Evaluacion" ALTER COLUMN "probabilidad"   SET NOT NULL;
ALTER TABLE "Evaluacion" ALTER COLUMN "impacto"         SET NOT NULL;
ALTER TABLE "Evaluacion" ALTER COLUMN "valorCalculado"  SET NOT NULL;
ALTER TABLE "Evaluacion" ALTER COLUMN "nivelRiesgo"     SET NOT NULL;

ALTER TABLE "Evaluacion" ADD CONSTRAINT "Evaluacion_probabilidad_check" CHECK ("probabilidad" BETWEEN 1 AND 5);
ALTER TABLE "Evaluacion" ADD CONSTRAINT "Evaluacion_impacto_check" CHECK ("impacto" BETWEEN 1 AND 5);
ALTER TABLE "Evaluacion" ADD CONSTRAINT "Evaluacion_valorCalculado_check" CHECK ("valorCalculado" BETWEEN 1 AND 25);
CREATE INDEX "Evaluacion_tipoEvaluacion_idx" ON "Evaluacion"("tipoEvaluacion");

-- Backfill 8c: Riesgo.evaluacionActualId apunta a la evaluación INHERENTE
-- recién creada (punto 4 del prompt: "Actualizar evaluacionActualId").
-- Para riesgos huérfanos de contexto (sección anterior) queda NULL —
-- consistente porque la columna es nullable y se reportó explícitamente.
UPDATE "Riesgo" r
SET "evaluacionActualId" = e."id"
FROM "Evaluacion" e
WHERE e."riesgoId" = r."id" AND e."tipoEvaluacion" = 'INHERENTE';

ALTER TABLE "Riesgo" ADD CONSTRAINT "Riesgo_evaluacionActualId_fkey"
  FOREIGN KEY ("evaluacionActualId") REFERENCES "Evaluacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE UNIQUE INDEX "Riesgo_evaluacionActualId_key" ON "Riesgo"("evaluacionActualId");

-- ============================================================================
-- SECCIÓN 9 — Ahora sí, retirar de Riesgo las columnas migradas a Evaluacion.
-- Los CHECK que las referenciaban (Riesgo_probabilidad_check, etc., de la
-- migración baseline) se eliminan automáticamente al eliminar la columna.
-- ============================================================================

ALTER TABLE "Riesgo" DROP COLUMN "probabilidad";
ALTER TABLE "Riesgo" DROP COLUMN "impacto";
ALTER TABLE "Riesgo" DROP COLUMN "valorRiesgo";
ALTER TABLE "Riesgo" DROP COLUMN "nivelRiesgoInherente";
ALTER TABLE "Riesgo" DROP COLUMN "nivelRiesgoResidual";
ALTER TABLE "Riesgo" DROP COLUMN "fechaUltimoCalculo";
DROP INDEX IF EXISTS "Riesgo_nivelRiesgoInherente_idx";

-- ============================================================================
-- SECCIÓN 10 — CHECK de origen condicional de Riesgo (punto 1 del prompt)
-- ============================================================================

ALTER TABLE "Riesgo" ADD CONSTRAINT "riesgo_origen_check" CHECK (
  ("origen" = 'AAV'    AND "aavId" IS NOT NULL AND "titulo" IS NULL) OR
  ("origen" = 'MANUAL' AND "aavId" IS NULL AND "titulo" IS NOT NULL AND "categoriaIdentificacionId" IS NOT NULL)
);

-- ============================================================================
-- SECCIÓN 11 — Tratamiento: riesgoId como FK principal,
-- evaluacionId -> evaluacionOrigenId (histórico, ya no 1:1),
-- nuevos campos de gobernanza.
-- ============================================================================

ALTER TABLE "Tratamiento" RENAME COLUMN "evaluacionId" TO "evaluacionOrigenId";
DROP INDEX IF EXISTS "Tratamiento_evaluacionId_key";
ALTER TABLE "Tratamiento" DROP CONSTRAINT IF EXISTS "Tratamiento_evaluacionId_fkey";
ALTER TABLE "Tratamiento" ALTER COLUMN "evaluacionOrigenId" DROP NOT NULL;
ALTER TABLE "Tratamiento" ADD CONSTRAINT "Tratamiento_evaluacionOrigenId_fkey"
  FOREIGN KEY ("evaluacionOrigenId") REFERENCES "Evaluacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Tratamiento_evaluacionOrigenId_idx" ON "Tratamiento"("evaluacionOrigenId");

ALTER TABLE "Tratamiento" ADD COLUMN "riesgoId" TEXT;
UPDATE "Tratamiento" t
SET "riesgoId" = e."riesgoId"
FROM "Evaluacion" e
WHERE t."evaluacionOrigenId" = e."id";
ALTER TABLE "Tratamiento" ALTER COLUMN "riesgoId" SET NOT NULL;
ALTER TABLE "Tratamiento" ADD CONSTRAINT "Tratamiento_riesgoId_fkey"
  FOREIGN KEY ("riesgoId") REFERENCES "Riesgo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "Tratamiento_riesgoId_idx" ON "Tratamiento"("riesgoId");

ALTER TABLE "Tratamiento" ADD COLUMN "fechaInicio"      DATE;
ALTER TABLE "Tratamiento" ADD COLUMN "justificacion"    TEXT;
ALTER TABLE "Tratamiento" ADD COLUMN "aprobadoPorId"    TEXT;
ALTER TABLE "Tratamiento" ADD COLUMN "fechaAprobacion"  TIMESTAMP(3);
ALTER TABLE "Tratamiento" ADD CONSTRAINT "Tratamiento_aprobadoPorId_fkey"
  FOREIGN KEY ("aprobadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- Se dejan NULL para tratamientos existentes: V1 no registraba fecha de
-- inicio, justificación separada, aprobador ni fecha de aprobación. No hay
-- dato de origen del cual derivarlos sin inventar información de negocio.

-- ============================================================================
-- SECCIÓN 12 — TratamientoControl (N:M), backfill desde controlPrincipalId,
-- eliminación de la FK 1:1 (punto 6 del prompt).
-- ============================================================================

CREATE TABLE "TratamientoControl" (
  "tratamientoId" TEXT NOT NULL,
  "controlId"     TEXT NOT NULL,
  "esPrincipal"   BOOLEAN NOT NULL DEFAULT false,
  "asociadoEn"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TratamientoControl_pkey" PRIMARY KEY ("tratamientoId", "controlId")
);
ALTER TABLE "TratamientoControl" ADD CONSTRAINT "TratamientoControl_tratamientoId_fkey"
  FOREIGN KEY ("tratamientoId") REFERENCES "Tratamiento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TratamientoControl" ADD CONSTRAINT "TratamientoControl_controlId_fkey"
  FOREIGN KEY ("controlId") REFERENCES "Control"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "TratamientoControl_controlId_idx" ON "TratamientoControl"("controlId");

-- Backfill: cada Tratamiento V1 con controlPrincipalId no nulo pasa a tener
-- una fila puente con esPrincipal = true, preservando la semántica de
-- "control principal" que existía como FK única.
INSERT INTO "TratamientoControl" ("tratamientoId", "controlId", "esPrincipal")
SELECT "id", "controlPrincipalId", true
FROM "Tratamiento"
WHERE "controlPrincipalId" IS NOT NULL;

ALTER TABLE "Tratamiento" DROP CONSTRAINT IF EXISTS "Tratamiento_controlPrincipalId_fkey";
DROP INDEX IF EXISTS "Tratamiento_controlPrincipalId_idx";
ALTER TABLE "Tratamiento" DROP COLUMN "controlPrincipalId";

-- ============================================================================
-- SECCIÓN 13 — ResolucionRiesgo (historial 1:N, punto 9 del prompt)
-- ============================================================================

CREATE TABLE "ResolucionRiesgo" (
  "id"            TEXT NOT NULL,
  "riesgoId"      TEXT NOT NULL,
  "tipo"          "TipoResolucionRiesgo" NOT NULL,
  "justificacion" TEXT NOT NULL,
  "usuarioId"     TEXT NOT NULL,
  "fecha"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ResolucionRiesgo_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "ResolucionRiesgo" ADD CONSTRAINT "ResolucionRiesgo_riesgoId_fkey"
  FOREIGN KEY ("riesgoId") REFERENCES "Riesgo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResolucionRiesgo" ADD CONSTRAINT "ResolucionRiesgo_usuarioId_fkey"
  FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "ResolucionRiesgo_riesgoId_fecha_idx" ON "ResolucionRiesgo"("riesgoId", "fecha");

-- Backfill: todo riesgo ya CERRADO en V1 recibe una fila RESOLUCION
-- retroactiva, para que el historial no arranque vacío para riesgos que de
-- hecho ya estaban resueltos.
INSERT INTO "ResolucionRiesgo" ("id", "riesgoId", "tipo", "justificacion", "usuarioId", "fecha")
SELECT
  gen_random_uuid()::text,
  r."id",
  'RESOLUCION',
  'Resolución registrada retroactivamente durante la migración V1 -> V2 (el riesgo ya se encontraba en estado CERRADO en V1, donde no existía historial de resoluciones).',
  r."responsableId",
  r."creadoEn"
FROM "Riesgo" r
WHERE r."estado" = 'CERRADO';

-- ============================================================================
-- SECCIÓN 14 — Comentario (polimórfico: Riesgo | Evaluacion | Tratamiento | Control)
-- ============================================================================

CREATE TABLE "Comentario" (
  "id"            TEXT NOT NULL,
  "riesgoId"      TEXT,
  "evaluacionId"  TEXT,
  "tratamientoId" TEXT,
  "controlId"     TEXT,
  "usuarioId"     TEXT NOT NULL,
  "contenido"     TEXT NOT NULL,
  "creadoEn"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Comentario_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_riesgoId_fkey" FOREIGN KEY ("riesgoId") REFERENCES "Riesgo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES "Evaluacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_tratamientoId_fkey" FOREIGN KEY ("tratamientoId") REFERENCES "Tratamiento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "Comentario_riesgoId_idx" ON "Comentario"("riesgoId");
CREATE INDEX "Comentario_evaluacionId_idx" ON "Comentario"("evaluacionId");
CREATE INDEX "Comentario_tratamientoId_idx" ON "Comentario"("tratamientoId");
CREATE INDEX "Comentario_controlId_idx" ON "Comentario"("controlId");

-- Exactamente un destino no nulo (punto 10 del prompt).
ALTER TABLE "Comentario" ADD CONSTRAINT "comentario_exactamente_un_destino_check" CHECK (
  (
    (CASE WHEN "riesgoId" IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN "evaluacionId" IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN "tratamientoId" IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN "controlId" IS NOT NULL THEN 1 ELSE 0 END)
  ) = 1
);

-- ============================================================================
-- SECCIÓN 15 — Seguimiento (polimórfico: Riesgo | Tratamiento | Control — sin Evaluacion)
-- ============================================================================

CREATE TABLE "Seguimiento" (
  "id"            TEXT NOT NULL,
  "riesgoId"      TEXT,
  "tratamientoId" TEXT,
  "controlId"     TEXT,
  "usuarioId"     TEXT NOT NULL,
  "descripcion"   TEXT NOT NULL,
  "fecha"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Seguimiento_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Seguimiento" ADD CONSTRAINT "Seguimiento_riesgoId_fkey" FOREIGN KEY ("riesgoId") REFERENCES "Riesgo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Seguimiento" ADD CONSTRAINT "Seguimiento_tratamientoId_fkey" FOREIGN KEY ("tratamientoId") REFERENCES "Tratamiento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Seguimiento" ADD CONSTRAINT "Seguimiento_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Seguimiento" ADD CONSTRAINT "Seguimiento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "Seguimiento_riesgoId_idx" ON "Seguimiento"("riesgoId");
CREATE INDEX "Seguimiento_tratamientoId_idx" ON "Seguimiento"("tratamientoId");
CREATE INDEX "Seguimiento_controlId_idx" ON "Seguimiento"("controlId");

ALTER TABLE "Seguimiento" ADD CONSTRAINT "seguimiento_exactamente_un_destino_check" CHECK (
  (
    (CASE WHEN "riesgoId" IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN "tratamientoId" IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN "controlId" IS NOT NULL THEN 1 ELSE 0 END)
  ) = 1
);

-- ============================================================================
-- SECCIÓN 16 — Evidencia (polimórfico: Riesgo | Tratamiento | Control)
-- ============================================================================

CREATE TABLE "Evidencia" (
  "id"                    TEXT NOT NULL,
  "riesgoId"              TEXT,
  "tratamientoId"         TEXT,
  "controlId"             TEXT,
  "nombreArchivo"         TEXT NOT NULL,
  "rutaArchivo"           TEXT NOT NULL,
  "estado"                "EstadoEvidencia" NOT NULL DEFAULT 'SUBIDA',
  "subidoPorId"           TEXT NOT NULL,
  "validadoPorId"         TEXT,
  "comentarioValidacion"  TEXT,
  "creadoEn"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Evidencia_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Evidencia" ADD CONSTRAINT "Evidencia_riesgoId_fkey" FOREIGN KEY ("riesgoId") REFERENCES "Riesgo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Evidencia" ADD CONSTRAINT "Evidencia_tratamientoId_fkey" FOREIGN KEY ("tratamientoId") REFERENCES "Tratamiento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Evidencia" ADD CONSTRAINT "Evidencia_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Evidencia" ADD CONSTRAINT "Evidencia_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Evidencia" ADD CONSTRAINT "Evidencia_validadoPorId_fkey" FOREIGN KEY ("validadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "Evidencia_riesgoId_idx" ON "Evidencia"("riesgoId");
CREATE INDEX "Evidencia_tratamientoId_idx" ON "Evidencia"("tratamientoId");
CREATE INDEX "Evidencia_controlId_idx" ON "Evidencia"("controlId");
CREATE INDEX "Evidencia_estado_idx" ON "Evidencia"("estado");

ALTER TABLE "Evidencia" ADD CONSTRAINT "evidencia_exactamente_un_destino_check" CHECK (
  (
    (CASE WHEN "riesgoId" IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN "tratamientoId" IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN "controlId" IS NOT NULL THEN 1 ELSE 0 END)
  ) = 1
);

-- ============================================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================================
