import { AppError } from "../../../shared/AppError";
import {
  findAmenazasVisiblesParaOrganizacion,
  findAmenazaVisiblePorId,
  existeOtraAmenazaConNombreEnOrganizacion,
  existeCategoriaAmenaza,
  findCategoriasAmenaza,
  existeAavParaAmenaza,
  crearAmenaza,
  actualizarAmenaza,
  eliminarAmenaza,
  registrarAuditoria,
} from "../repository/threats.repository";
import {
  AmenazaConRelaciones,
  CategoriaAmenaza,
  FiltrosAmenazas,
} from "../types/threats.types";
import { CrearAmenazaInput, ActualizarAmenazaInput } from "../schema/threats.schema";

const ENTIDAD = "Amenaza";

interface ActorAuditoria {
  usuarioId: string;
  direccionIp: string;
}

export async function listarAmenazas(
  organizacionId: string,
  filtros: FiltrosAmenazas
): Promise<AmenazaConRelaciones[]> {
  return findAmenazasVisiblesParaOrganizacion(organizacionId, filtros);
}

export async function listarCategorias(): Promise<CategoriaAmenaza[]> {
  return findCategoriasAmenaza();
}

/**
 * Visible tanto para amenazas globales como propias — 404 (no revela
 * existencia) si la amenaza pertenece a otra organización, mismo criterio
 * de aislamiento ya usado en users/roles/context/assets.
 */
export async function obtenerAmenaza(
  id: string,
  organizacionId: string
): Promise<AmenazaConRelaciones> {
  const amenaza = await findAmenazaVisiblePorId(id, organizacionId);
  if (!amenaza) {
    throw new AppError("Amenaza no encontrada", 404);
  }
  return amenaza;
}

async function validarCategoria(categoriaId: string): Promise<void> {
  const existe = await existeCategoriaAmenaza(categoriaId);
  if (!existe) {
    throw new AppError("La categoría especificada no existe", 400);
  }
}

/**
 * Ninguna operación de escritura de este módulo actúa sobre el catálogo
 * global (`organizacionId = NULL`) — no se inventa un rol de plataforma
 * (mismo criterio ya resuelto en la Fase 4 para `Organizacion`; ver PASO 1
 * de esta fase).
 */
function exigirAmenazaPropia(amenaza: AmenazaConRelaciones, organizacionId: string): void {
  if (amenaza.organizacionId !== organizacionId) {
    throw new AppError("No se puede modificar una amenaza del catálogo global", 403);
  }
}

export async function crearNuevaAmenaza(
  organizacionId: string,
  input: CrearAmenazaInput,
  actor: ActorAuditoria
): Promise<AmenazaConRelaciones> {
  await validarCategoria(input.categoriaId);

  const nombreDuplicado = await existeOtraAmenazaConNombreEnOrganizacion(
    organizacionId,
    input.nombre
  );
  if (nombreDuplicado) {
    throw new AppError("Ya existe una amenaza con ese nombre en la organización", 409);
  }

  const amenaza = await crearAmenaza({ organizacionId, ...input });

  await registrarAuditoria({
    usuarioId: actor.usuarioId,
    organizacionId,
    entidad: ENTIDAD,
    entidadId: amenaza.id,
    accion: "CREAR",
    datosNuevos: {
      nombre: amenaza.nombre,
      categoriaId: amenaza.categoria.id,
      origen: amenaza.origen,
    },
    direccionIp: actor.direccionIp,
  });

  return amenaza;
}

export async function actualizarAmenazaExistente(
  id: string,
  organizacionId: string,
  input: ActualizarAmenazaInput,
  actor: ActorAuditoria
): Promise<AmenazaConRelaciones> {
  const anterior = await obtenerAmenaza(id, organizacionId);
  exigirAmenazaPropia(anterior, organizacionId);

  if (input.categoriaId) {
    await validarCategoria(input.categoriaId);
  }
  if (input.nombre && input.nombre !== anterior.nombre) {
    const nombreDuplicado = await existeOtraAmenazaConNombreEnOrganizacion(
      organizacionId,
      input.nombre,
      id
    );
    if (nombreDuplicado) {
      throw new AppError("Ya existe una amenaza con ese nombre en la organización", 409);
    }
  }

  const actualizada = await actualizarAmenaza(id, input);

  await registrarAuditoria({
    usuarioId: actor.usuarioId,
    organizacionId,
    entidad: ENTIDAD,
    entidadId: id,
    accion: "EDITAR",
    datosAnteriores: {
      nombre: anterior.nombre,
      categoriaId: anterior.categoria.id,
      origen: anterior.origen,
    },
    datosNuevos: input,
    direccionIp: actor.direccionIp,
  });

  return actualizada;
}

/**
 * Eliminación física (Amenaza no tiene campo `estado`) — bloqueada si
 * participa en cualquier combinación AAV (Fase 5 §5.4, criterio análogo al
 * ya aplicado a Activo en la Fase 6).
 */
export async function eliminarAmenazaExistente(
  id: string,
  organizacionId: string,
  actor: ActorAuditoria
): Promise<void> {
  const amenaza = await obtenerAmenaza(id, organizacionId);
  exigirAmenazaPropia(amenaza, organizacionId);

  const referenciada = await existeAavParaAmenaza(id);
  if (referenciada) {
    throw new AppError(
      "No se puede eliminar una amenaza que participa en combinaciones de análisis (AAV)",
      409
    );
  }

  await eliminarAmenaza(id);

  await registrarAuditoria({
    usuarioId: actor.usuarioId,
    organizacionId,
    entidad: ENTIDAD,
    entidadId: id,
    accion: "ELIMINAR",
    datosAnteriores: { nombre: amenaza.nombre, categoriaId: amenaza.categoria.id },
    direccionIp: actor.direccionIp,
  });
}
