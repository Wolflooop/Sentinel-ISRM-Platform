import { prisma } from "../config/prisma";
import { AppError } from "./AppError";

/**
 * Resuelve el Auditoria.organizacionId que debe guardarse para una acción
 * ejecutada por un actor determinado.
 *
 * Auditoria.organizacionId es obligatorio (no nullable) en el schema, pero
 * el Administrador Principal (Rol.tipo = SUPER_ADMIN) es un usuario global
 * con Usuario.organizacionId = null (eso NO cambia: ver comentario en el
 * modelo Usuario). Este helper es el único punto del sistema que decide qué
 * organizacionId usar en ese caso:
 *
 *   - actor.organizacionId !== null  -> se usa tal cual (caso normal:
 *     ADMIN_TIC / USUARIO_COMUN, siempre pertenecen a una organización).
 *   - actor.organizacionId === null  -> se resuelve a la organización
 *     técnica de auditoría "__SISTEMA__" (ver prisma/seed.ts), creada
 *     únicamente para satisfacer esta FK cuando el actor es un SUPER_ADMIN.
 *
 * Este helper:
 *   - NO crea la organización técnica (eso es responsabilidad exclusiva del
 *     seed). Si no existe, lanza un AppError controlado.
 *   - NO modifica Usuario.organizacionId del SUPER_ADMIN: sigue null.
 *   - Cachea en memoria el id resuelto de "__SISTEMA__", porque es una fila
 *     fija que no cambia durante la vida del proceso, para no repetir la
 *     consulta en cada acción auditada de un SUPER_ADMIN.
 */

const NOMBRE_ORGANIZACION_SISTEMA = "__SISTEMA__";

let organizacionSistemaIdCache: string | null = null;

export async function resolverOrganizacionIdParaAuditoria(
  actorOrganizacionId: string | null
): Promise<string> {
  if (actorOrganizacionId !== null) {
    return actorOrganizacionId;
  }

  if (organizacionSistemaIdCache !== null) {
    return organizacionSistemaIdCache;
  }

  const organizacionSistema = await prisma.organizacion.findUnique({
    where: { nombre: NOMBRE_ORGANIZACION_SISTEMA },
    select: { id: true },
  });

  if (!organizacionSistema) {
    // No debería ocurrir en un entorno correctamente inicializado: indica
    // que `npx prisma db seed` no se ejecutó (o se ejecutó contra una base
    // distinta a la que está usando la API en este momento).
    throw new AppError(
      "No se encontró la organización técnica de auditoría (__SISTEMA__). " +
        "Verifique que el seed se haya ejecutado (`npx prisma db seed`).",
      500
    );
  }

  organizacionSistemaIdCache = organizacionSistema.id;
  return organizacionSistemaIdCache;
}
