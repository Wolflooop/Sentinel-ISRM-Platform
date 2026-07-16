import { AppError } from "../../../shared/AppError";
import {
  findActivosPorOrganizacion,
  findActivoPorIdYOrganizacion,
  existeOtroActivoConNombre,
  existeCategoriaActivo,
  findCategoriasActivo,
  existeUsuarioEnOrganizacion,
  existeRiesgoAbiertoParaActivo,
  crearActivoConAuditoria,
  actualizarActivoConAuditoria,
  cambiarEstadoActivoConAuditoria,
} from "../repository/assets.repository";
import {
  ActivoConRelaciones,
  CategoriaActivo,
  FiltrosActivos,
  EstadoActivo,
} from "../types/assets.types";
import { CrearActivoInput, ActualizarActivoInput } from "../schema/assets.schema";


interface ActorAuditoria {
  usuarioId: string;
  direccionIp: string;
}

export async function listarActivos(
  organizacionId: string,
  filtros: FiltrosActivos
): Promise<ActivoConRelaciones[]> {
  return findActivosPorOrganizacion(organizacionId, filtros);
}

export async function listarCategorias(): Promise<CategoriaActivo[]> {
  return findCategoriasActivo();
}

/**
 * Aislamiento multi-tenant: 404 (no 403) si el activo existe pero pertenece
 * a otra organización — mismo criterio ya usado en users/roles/context.
 */
export async function obtenerActivo(
  id: string,
  organizacionId: string
): Promise<ActivoConRelaciones> {
  const activo = await findActivoPorIdYOrganizacion(id, organizacionId);
  if (!activo) {
    throw new AppError("Activo no encontrado", 404);
  }
  return activo;
}

async function validarCategoria(categoriaId: string): Promise<void> {
  const existe = await existeCategoriaActivo(categoriaId);
  if (!existe) {
    throw new AppError("La categoría especificada no existe", 400);
  }
}

/**
 * Fase 5 §5.3: el usuario responsable debe pertenecer a la misma
 * organización que el activo.
 */
async function validarResponsable(usuarioId: string, organizacionId: string): Promise<void> {
  const existe = await existeUsuarioEnOrganizacion(usuarioId, organizacionId);
  if (!existe) {
    throw new AppError(
      "El usuario responsable debe existir y pertenecer a la misma organización",
      400
    );
  }
}

export async function crearNuevoActivo(
  organizacionId: string,
  input: CrearActivoInput,
  actor: ActorAuditoria
): Promise<ActivoConRelaciones> {
  await validarCategoria(input.categoriaId);
  await validarResponsable(input.usuarioResponsableId, organizacionId);

  const nombreDuplicado = await existeOtroActivoConNombre(organizacionId, input.nombre);
  if (nombreDuplicado) {
    throw new AppError("Ya existe un activo con ese nombre en la organización", 409);
  }

  const activo = await crearActivoConAuditoria(
    { organizacionId, ...input },
    {
      usuarioId: actor.usuarioId,
      organizacionId,
      accion: "CREAR",
      datosNuevos: { nombre: input.nombre, categoriaId: input.categoriaId },
      direccionIp: actor.direccionIp,
    }
  );

  return activo;
}

export async function actualizarActivoExistente(
  id: string,
  organizacionId: string,
  input: ActualizarActivoInput,
  actor: ActorAuditoria
): Promise<ActivoConRelaciones> {
  const anterior = await obtenerActivo(id, organizacionId);

  if (input.categoriaId) {
    await validarCategoria(input.categoriaId);
  }
  if (input.usuarioResponsableId) {
    await validarResponsable(input.usuarioResponsableId, organizacionId);
  }
  if (input.nombre && input.nombre !== anterior.nombre) {
    const nombreDuplicado = await existeOtroActivoConNombre(organizacionId, input.nombre, id);
    if (nombreDuplicado) {
      throw new AppError("Ya existe un activo con ese nombre en la organización", 409);
    }
  }

  const actualizado = await actualizarActivoConAuditoria(id, input, {
    usuarioId: actor.usuarioId,
    organizacionId,
    accion: "EDITAR",
    datosAnteriores: {
      nombre: anterior.nombre,
      categoriaId: anterior.categoria.id,
      usuarioResponsableId: anterior.usuarioResponsable.id,
      criticidad: anterior.criticidad,
    },
    datosNuevos: input,
    direccionIp: actor.direccionIp,
  });

  return actualizado;
}

/**
 * Fase 5 §5.4: un activo no puede pasar a RETIRADO si participa en
 * combinaciones AAV con un Riesgo en estado distinto de CERRADO.
 */
export async function cambiarEstadoActivoExistente(
  id: string,
  organizacionId: string,
  estado: EstadoActivo,
  actor: ActorAuditoria
): Promise<ActivoConRelaciones> {
  const anterior = await obtenerActivo(id, organizacionId);

  if (estado === "RETIRADO") {
    const tieneRiesgoAbierto = await existeRiesgoAbiertoParaActivo(id);
    if (tieneRiesgoAbierto) {
      throw new AppError(
        "No se puede retirar un activo que participa en riesgos aún no cerrados",
        409
      );
    }
  }

  const actualizado = await cambiarEstadoActivoConAuditoria(id, estado, {
    usuarioId: actor.usuarioId,
    organizacionId,
    accion: "EDITAR",
    datosAnteriores: { estado: anterior.estado },
    datosNuevos: { estado },
    direccionIp: actor.direccionIp,
  });

  return actualizado;
}
