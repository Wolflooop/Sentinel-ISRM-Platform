import { AppError } from "../../../shared/AppError";
import {
  findOrganizacionPorId,
  existeOtraOrganizacionConNombre,
  actualizarOrganizacion,
  cambiarEstadoOrganizacion,
  revocarSesionesActivasDeOrganizacion,
} from "../repository/organizations.repository";
import {
  ActualizarOrganizacionInput,
  CambiarEstadoOrganizacionInput,
} from "../schema/organizations.schema";
import { OrganizacionCompleta } from "../types/organizations.types";

/**
 * Resuelve siempre la organización desde `organizacionId` (derivado de
 * `req.user.organizacionId` en el Controller) — nunca desde un parámetro de
 * ruta ni del body del cliente (Constitución, Sección 9: aislamiento
 * multi-tenant, "nunca permitir acceso entre organizaciones").
 */
export async function obtenerOrganizacionActual(
  organizacionId: string
): Promise<OrganizacionCompleta> {
  const organizacion = await findOrganizacionPorId(organizacionId);
  if (!organizacion) {
    // No debería ocurrir en operación normal (Usuario.organizacionId es
    // obligatorio y la relación es Restrict), pero se maneja explícitamente.
    throw new AppError("Organización no encontrada", 404);
  }
  return organizacion;
}

export async function actualizarOrganizacionActual(
  organizacionId: string,
  input: ActualizarOrganizacionInput
): Promise<OrganizacionCompleta> {
  await obtenerOrganizacionActual(organizacionId);

  if (input.nombre) {
    const duplicado = await existeOtraOrganizacionConNombre(input.nombre, organizacionId);
    if (duplicado) {
      throw new AppError("Ya existe una organización con ese nombre", 409);
    }
  }

  return actualizarOrganizacion(organizacionId, input);
}

export async function cambiarEstadoOrganizacionActual(
  organizacionId: string,
  input: CambiarEstadoOrganizacionInput
): Promise<OrganizacionCompleta> {
  await obtenerOrganizacionActual(organizacionId);

  const organizacionActualizada = await cambiarEstadoOrganizacion(
    organizacionId,
    input.estado
  );

  // Regla de negocio de la Fase 5 — no se implementa condicionalmente por
  // conveniencia, es una obligación ya documentada del modelo.
  if (input.estado === "SUSPENDIDA" || input.estado === "INACTIVA") {
    await revocarSesionesActivasDeOrganizacion(organizacionId);
  }

  return organizacionActualizada;
}
