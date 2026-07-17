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


export async function obtenerOrganizacionActual(
  organizacionId: string
): Promise<OrganizacionCompleta> {
  const organizacion = await findOrganizacionPorId(organizacionId);
  if (!organizacion) {
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

 if (input.estado === "SUSPENDIDA" || input.estado === "INACTIVA") {
    await revocarSesionesActivasDeOrganizacion(organizacionId);
  }

  return organizacionActualizada;
}
