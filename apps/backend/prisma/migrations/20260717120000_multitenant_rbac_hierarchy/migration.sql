-- Fase 7: jerarquía de administración multiempresa
-- (Administrador Principal / Administrador TIC / Usuario Común)
--
-- Resumen:
--   1. Nuevo enum TipoRol + columna Rol.tipo (reemplaza cualquier lógica
--      basada en comparar Rol.nombre como texto).
--   2. Backfill de Rol.tipo a partir de los roles sembrados hoy.
--   3. Usuario.organizacionId pasa a ser NULLABLE (el Administrador
--      Principal no pertenece a ninguna organización).
--   4. El correo de Usuario pasa a ser único de forma GLOBAL (antes era
--      único solo dentro de la organización), porque el login ya no pide
--      organización.
--   5. Trigger a nivel de base de datos que garantiza, de forma
--      independiente a la capa de aplicación, que:
--        - un Usuario cuyo Rol.tipo = SUPER_ADMIN tenga organizacionId NULL
--        - un Usuario cuyo Rol.tipo IN (ADMIN_TIC, USUARIO_COMUN) tenga
--          organizacionId NOT NULL
--      Esto es defensa en profundidad: aunque un bug en el backend
--      permitiera guardar una combinación inválida, la base de datos la
--      rechaza.

-- CreateEnum
CREATE TYPE "TipoRol" AS ENUM ('SUPER_ADMIN', 'ADMIN_TIC', 'USUARIO_COMUN');

-- AlterTable: Rol.tipo
ALTER TABLE "Rol" ADD COLUMN "tipo" "TipoRol" NOT NULL DEFAULT 'USUARIO_COMUN';

-- Backfill: roles sembrados actualmente por prisma/seed.ts
UPDATE "Rol" SET "tipo" = 'SUPER_ADMIN' WHERE "nombre" = 'Administrador';
UPDATE "Rol" SET "tipo" = 'ADMIN_TIC'   WHERE "nombre" = 'Administrador TIC';
-- 'Usuario Operativo' y cualquier otro rol adicional quedan en el valor por
-- defecto USUARIO_COMUN.

-- AlterTable: Usuario.organizacionId ahora nullable
ALTER TABLE "Usuario" ALTER COLUMN "organizacionId" DROP NOT NULL;

-- DropIndex: unicidad previa por (organizacionId, email)
DROP INDEX "Usuario_organizacionId_email_key";

-- CreateIndex: email único a nivel global + índice de apoyo para el filtro
-- multiempresa por organizacionId
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
CREATE INDEX "Usuario_organizacionId_idx" ON "Usuario"("organizacionId");

-- Trigger de invariante: SUPER_ADMIN <-> organizacionId IS NULL
CREATE OR REPLACE FUNCTION fn_validar_organizacion_por_tipo_rol()
RETURNS TRIGGER AS $$
DECLARE
  v_tipo_rol "TipoRol";
BEGIN
  SELECT "tipo" INTO v_tipo_rol FROM "Rol" WHERE "id" = NEW."rolId";

  IF v_tipo_rol = 'SUPER_ADMIN' AND NEW."organizacionId" IS NOT NULL THEN
    RAISE EXCEPTION 'Un usuario con rol SUPER_ADMIN no puede tener organizacionId (debe ser NULL)';
  END IF;

  IF v_tipo_rol IN ('ADMIN_TIC', 'USUARIO_COMUN') AND NEW."organizacionId" IS NULL THEN
    RAISE EXCEPTION 'Un usuario con rol % requiere organizacionId', v_tipo_rol;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_organizacion_por_tipo_rol ON "Usuario";
CREATE TRIGGER trg_validar_organizacion_por_tipo_rol
  BEFORE INSERT OR UPDATE OF "organizacionId", "rolId" ON "Usuario"
  FOR EACH ROW
  EXECUTE FUNCTION fn_validar_organizacion_por_tipo_rol();
