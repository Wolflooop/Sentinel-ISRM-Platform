import { AppError } from "../../../shared/AppError";
import {
  findCategoriasIdentificacion,
  findCategoriaIdentificacionPorId,
  existeOtraCategoriaConNombre,
  existeRiesgoConCategoria,
  crearCategoriaIdentificacionConAuditoria,
  actualizarCategoriaIdentificacionConAuditoria,
  eliminarCategoriaIdentificacionConAuditoria,
} from "../repository/risk-identification-categories.repository";
import {
  CrearCategoriaIdentificacionInput,
  ActualizarCategoriaIdentificacionInput,
} from "../schema/risk-identification-categories.schema";
import { CategoriaIdentificacionRiesgo } from "../types/risk-identification-categories.types";

interface ActorAuditoria {
  usuarioId: string;
  organizacionId: string;
  direccionIp: string;
}

export async function listarCategoriasIdentificacion(): Promise<CategoriaIdentificacionRiesgo[]> {
  return findCategoriasIdentificacion();
}

export async function obtenerCategoriaIdentificacion(id: string): Promise<CategoriaIdentificacionRiesgo> {
  const categoria = await findCategoriaIdentificacionPorId(id);
  if (!categoria) {
    throw new AppError("Categoría de identificación no encontrada", 404);
  }
  return categoria;
}

export async function crearNuevaCategoriaIdentificacion(
  input: CrearCategoriaIdentificacionInput,
  actor: ActorAuditoria
): Promise<CategoriaIdentificacionRiesgo> {
  const duplicada = await existeOtraCategoriaConNombre(input.nombre);
  if (duplicada) {
    throw new AppError("Ya existe una categoría de identificación con ese nombre", 409);
  }
  return crearCategoriaIdentificacionConAuditoria(input, actor);
}

export async function actualizarCategoriaIdentificacionExistente(
  id: string,
  input: ActualizarCategoriaIdentificacionInput,
  actor: ActorAuditoria
): Promise<CategoriaIdentificacionRiesgo> {
  const anterior = await obtenerCategoriaIdentificacion(id);

  if (input.nombre && input.nombre !== anterior.nombre) {
    const duplicada = await existeOtraCategoriaConNombre(input.nombre, id);
    if (duplicada) {
      throw new AppError("Ya existe una categoría de identificación con ese nombre", 409);
    }
  }

  return actualizarCategoriaIdentificacionConAuditoria(id, input, {
    ...actor,
    datosAnteriores: { nombre: anterior.nombre, descripcion: anterior.descripcion },
  });
}

export async function eliminarCategoriaIdentificacionExistente(
  id: string,
  actor: ActorAuditoria
): Promise<void> {
  const anterior = await obtenerCategoriaIdentificacion(id);

  const enUso = await existeRiesgoConCategoria(id);
  if (enUso) {
    throw new AppError(
      "No se puede eliminar una categoría de identificación que está asociada a algún riesgo",
      409
    );
  }

  await eliminarCategoriaIdentificacionConAuditoria(id, {
    ...actor,
    datosAnteriores: { nombre: anterior.nombre },
  });
}
