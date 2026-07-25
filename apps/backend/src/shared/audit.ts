import { AccionAuditoria, Prisma } from "@prisma/client";
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

/**
 * Parámetros para dejar un registro de Auditoria.
 *
 * Fuente única de verdad para este shape: reemplaza las definiciones
 * duplicadas que hoy existen en users.repository.ts,
 * organizations.repository.ts, context.types.ts, vulnerabilities.types.ts,
 * assets.types.ts y threats.types.ts (todas iguales o recortes de esta).
 *
 * organizacionId se recibe YA resuelto (nunca null) — quien arma este
 * objeto debe haber llamado antes a resolverOrganizacionIdParaAuditoria()
 * si el actor puede ser un SUPER_ADMIN (organizacionId null en el token).
 * Este archivo mantiene ambas responsabilidades separadas a propósito:
 * "resolver qué organizacionId corresponde" y "escribir el registro" son
 * pasos distintos, cada uno con una única función.
 *
 * accion usa el enum real AccionAuditoria de Prisma (@prisma/client), no
 * una unión de strings a mano: evita que el helper y el schema puedan
 * divergir si el enum cambia.
 */
export interface RegistrarAuditoriaParams {
  usuarioId: string;
  organizacionId: string;
  entidad: string;
  entidadId: string;
  accion: AccionAuditoria;
  datosAnteriores?: unknown;
  datosNuevos?: unknown;
  direccionIp: string;
}

/**
 * Escribe un registro de Auditoria.
 *
 * `tx` es OBLIGATORIO y debe ser el mismo Prisma.TransactionClient de la
 * transacción que ejecuta la operación auditada. A propósito este helper
 * NO acepta el cliente global `prisma` ni lo usa como valor por defecto:
 * eso es lo que garantiza que un registro de auditoría nunca pueda quedar
 * separado (ni antes ni después) del cambio que audita — si la
 * transacción hace rollback, el registro de auditoría también, y
 * viceversa. Ver la regla ya establecida: "la auditoría debe ser atómica,
 * nunca guardar el cambio y crear la auditoría por separado".
 *
 * Este helper NO decide organizacionId (eso es
 * resolverOrganizacionIdParaAuditoria) ni entidad/accion de negocio: solo
 * centraliza la escritura en Auditoria para que dejar de duplicar el
 * `tx.auditoria.create({ data: {...} })` que hoy está repetido en ~17
 * call sites de otros módulos.
 */
export async function registrarAuditoria(
  tx: Prisma.TransactionClient,
  params: RegistrarAuditoriaParams
): Promise<void> {
  await tx.auditoria.create({
    data: {
      usuarioId: params.usuarioId,
      organizacionId: params.organizacionId,
      entidad: params.entidad,
      entidadId: params.entidadId,
      accion: params.accion,
      datosAnteriores: params.datosAnteriores as never,
      datosNuevos: params.datosNuevos as never,
      direccionIp: params.direccionIp,
    },
  });
}
