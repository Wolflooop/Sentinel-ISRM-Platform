import { AppError } from "../../../shared/AppError";
import {
  findAmenazasVisiblesParaOrganizacion,
  findAmenazaVisiblePorId,
  existeOtraAmenazaConNombreEnOrganizacion,
  existeCategoriaAmenaza,
  findCategoriasAmenaza,
  existeAavParaAmenaza,
  crearAmenazaConAuditoria,
  actualizarAmenazaConAuditoria,
  eliminarAmenazaConAuditoria,
} from "../repository/threats.repository";
import {
  AmenazaConRelaciones,
  CategoriaAmenaza,
  FiltrosAmenazas,
} from "../types/threats.types";
import { CrearAmenazaInput, ActualizarAmenazaInput } from "../schema/threats.schema";


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

  const amenaza = await crearAmenazaConAuditoria(
    { organizacionId, ...input },
    {
      usuarioId: actor.usuarioId,
      organizacionId,
      accion: "CREAR",
      datosNuevos: {
        nombre: input.nombre,
        categoriaId: input.categoriaId,
        origen: input.origen,
      },
      direccionIp: actor.direccionIp,
    }
  );

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

  const actualizada = await actualizarAmenazaConAuditoria(id, input, {
    usuarioId: actor.usuarioId,
    organizacionId,
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

  await eliminarAmenazaConAuditoria(id, {
    usuarioId: actor.usuarioId,
    organizacionId,
    accion: "ELIMINAR",
    datosAnteriores: { nombre: amenaza.nombre, categoriaId: amenaza.categoria.id },
    direccionIp: actor.direccionIp,
  });
}
