import { AppError } from "../../../shared/AppError";
import {
  findOrganizacionPorId,
  existeOtraOrganizacionConNombre,
  existeOrganizacionConNombre,
  actualizarOrganizacion,
  cambiarEstadoOrganizacion,
  revocarSesionesActivasDeOrganizacion,
  crearOrganizacion,
  findOrganizaciones,
  registrarAuditoria,
} from "../repository/organizations.repository";
import {
  ActualizarOrganizacionInput,
  CambiarEstadoOrganizacionInput,
  CrearOrganizacionInput,
} from "../schema/organizations.schema";
import { OrganizacionCompleta } from "../types/organizations.types";

interface ActorAuditoria {
  usuarioId: string;
  direccionIp: string;
}

// Solo el Administrador Principal (SUPER_ADMIN) llega aquí — se aplica en
// la ruta vía requireTipoRol("SUPER_ADMIN"), pero se deja documentado
// porque es la única razón por la que este servicio no recibe ni filtra
// por organizacionId.
export async function crearNuevaOrganizacion(
  input: CrearOrganizacionInput,
  actor: ActorAuditoria
): Promise<OrganizacionCompleta> {
  const duplicada = await existeOrganizacionConNombre(input.nombre);
  if (duplicada) {
    throw new AppError("Ya existe una organización con ese nombre", 409);
  }

  const organizacion = await crearOrganizacion(input);

  await registrarAuditoria({
    usuarioId: actor.usuarioId,
    organizacionId: organizacion.id,
    entidad: "Organizacion",
    entidadId: organizacion.id,
    accion: "CREAR",
    datosNuevos: { nombre: organizacion.nombre, sector: organizacion.sector },
    direccionIp: actor.direccionIp,
  });

  return organizacion;
}

export async function listarOrganizaciones(): Promise<OrganizacionCompleta[]> {
  return findOrganizaciones();
}

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
  input: ActualizarOrganizacionInput,
  actor: ActorAuditoria
): Promise<OrganizacionCompleta> {
  const organizacionExistente = await obtenerOrganizacionActual(organizacionId);

  if (input.nombre) {
    const duplicado = await existeOtraOrganizacionConNombre(input.nombre, organizacionId);
    if (duplicado) {
      throw new AppError("Ya existe una organización con ese nombre", 409);
    }
  }

  const organizacionActualizada = await actualizarOrganizacion(organizacionId, input);

  await registrarAuditoria({
    usuarioId: actor.usuarioId,
    organizacionId,
    entidad: "Organizacion",
    entidadId: organizacionId,
    accion: "EDITAR",
    datosAnteriores: { nombre: organizacionExistente.nombre, sector: organizacionExistente.sector },
    datosNuevos: input,
    direccionIp: actor.direccionIp,
  });

  return organizacionActualizada;
}

export async function cambiarEstadoOrganizacionActual(
  organizacionId: string,
  input: CambiarEstadoOrganizacionInput,
  actor: ActorAuditoria
): Promise<OrganizacionCompleta> {
  const organizacionExistente = await obtenerOrganizacionActual(organizacionId);

  const organizacionActualizada = await cambiarEstadoOrganizacion(
    organizacionId,
    input.estado
  );

  if (input.estado === "SUSPENDIDA" || input.estado === "INACTIVA") {
    await revocarSesionesActivasDeOrganizacion(organizacionId);
  }

  await registrarAuditoria({
    usuarioId: actor.usuarioId,
    organizacionId,
    entidad: "Organizacion",
    entidadId: organizacionId,
    accion: "EDITAR",
    datosAnteriores: { estado: organizacionExistente.estado },
    datosNuevos: { estado: organizacionActualizada.estado },
    direccionIp: actor.direccionIp,
  });

  return organizacionActualizada;
}
