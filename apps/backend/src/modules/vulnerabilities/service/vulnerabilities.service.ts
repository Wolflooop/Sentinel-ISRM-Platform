import { AppError } from "../../../shared/AppError";
import {
  findVulnerabilidadesVisiblesParaOrganizacion,
  findVulnerabilidadVisiblePorId,
  existeOtraVulnerabilidadConNombreEnOrganizacion,
  existeCategoriaVulnerabilidad,
  findCategoriasVulnerabilidad,
  existeAavParaVulnerabilidad,
  crearVulnerabilidadConAuditoria,
  actualizarVulnerabilidadConAuditoria,
  eliminarVulnerabilidadConAuditoria,
} from "../repository/vulnerabilities.repository";
import {
  VulnerabilidadConRelaciones,
  CategoriaVulnerabilidad,
  FiltrosVulnerabilidades,
} from "../types/vulnerabilities.types";
import {
  CrearVulnerabilidadInput,
  ActualizarVulnerabilidadInput,
} from "../schema/vulnerabilities.schema";

interface ActorAuditoria {
  usuarioId: string;
  direccionIp: string;
}

export async function listarVulnerabilidades(
  organizacionId: string,
  filtros: FiltrosVulnerabilidades
): Promise<VulnerabilidadConRelaciones[]> {
  return findVulnerabilidadesVisiblesParaOrganizacion(organizacionId, filtros);
}

export async function listarCategorias(): Promise<CategoriaVulnerabilidad[]> {
  return findCategoriasVulnerabilidad();
}

export async function obtenerVulnerabilidad(
  id: string,
  organizacionId: string
): Promise<VulnerabilidadConRelaciones> {
  const vulnerabilidad = await findVulnerabilidadVisiblePorId(id, organizacionId);
  if (!vulnerabilidad) {
    throw new AppError("Vulnerabilidad no encontrada", 404);
  }
  return vulnerabilidad;
}

async function validarCategoria(categoriaId: string): Promise<void> {
  const existe = await existeCategoriaVulnerabilidad(categoriaId);
  if (!existe) {
    throw new AppError("La categoría especificada no existe", 400);
  }
}

// Mismo criterio que exigirAmenazaPropia en threats.service.ts: ninguna
// operación de escritura actúa sobre el catálogo global.
function exigirVulnerabilidadPropia(
  vulnerabilidad: VulnerabilidadConRelaciones,
  organizacionId: string
): void {
  if (vulnerabilidad.organizacionId !== organizacionId) {
    throw new AppError("No se puede modificar una vulnerabilidad del catálogo global", 403);
  }
}

export async function crearNuevaVulnerabilidad(
  organizacionId: string,
  input: CrearVulnerabilidadInput,
  actor: ActorAuditoria
): Promise<VulnerabilidadConRelaciones> {
  await validarCategoria(input.categoriaId);

  const nombreDuplicado = await existeOtraVulnerabilidadConNombreEnOrganizacion(
    organizacionId,
    input.nombre
  );
  if (nombreDuplicado) {
    throw new AppError("Ya existe una vulnerabilidad con ese nombre en la organización", 409);
  }

  return crearVulnerabilidadConAuditoria(
    { organizacionId, ...input },
    {
      usuarioId: actor.usuarioId,
      organizacionId,
      accion: "CREAR",
      datosNuevos: {
        nombre: input.nombre,
        categoriaId: input.categoriaId,
        severidad: input.severidad,
      },
      direccionIp: actor.direccionIp,
    }
  );
}

export async function actualizarVulnerabilidadExistente(
  id: string,
  organizacionId: string,
  input: ActualizarVulnerabilidadInput,
  actor: ActorAuditoria
): Promise<VulnerabilidadConRelaciones> {
  const anterior = await obtenerVulnerabilidad(id, organizacionId);
  exigirVulnerabilidadPropia(anterior, organizacionId);

  if (input.categoriaId) {
    await validarCategoria(input.categoriaId);
  }
  if (input.nombre && input.nombre !== anterior.nombre) {
    const nombreDuplicado = await existeOtraVulnerabilidadConNombreEnOrganizacion(
      organizacionId,
      input.nombre,
      id
    );
    if (nombreDuplicado) {
      throw new AppError("Ya existe una vulnerabilidad con ese nombre en la organización", 409);
    }
  }

  return actualizarVulnerabilidadConAuditoria(id, input, {
    usuarioId: actor.usuarioId,
    organizacionId,
    accion: "EDITAR",
    datosAnteriores: {
      nombre: anterior.nombre,
      categoriaId: anterior.categoria.id,
      severidad: anterior.severidad,
    },
    datosNuevos: input,
    direccionIp: actor.direccionIp,
  });
}

export async function eliminarVulnerabilidadExistente(
  id: string,
  organizacionId: string,
  actor: ActorAuditoria
): Promise<void> {
  const vulnerabilidad = await obtenerVulnerabilidad(id, organizacionId);
  exigirVulnerabilidadPropia(vulnerabilidad, organizacionId);

  const referenciada = await existeAavParaVulnerabilidad(id);
  if (referenciada) {
    throw new AppError(
      "No se puede eliminar una vulnerabilidad que participa en combinaciones de análisis (AAV)",
      409
    );
  }

  await eliminarVulnerabilidadConAuditoria(id, {
    usuarioId: actor.usuarioId,
    organizacionId,
    accion: "ELIMINAR",
    datosAnteriores: { nombre: vulnerabilidad.nombre, categoriaId: vulnerabilidad.categoria.id },
    direccionIp: actor.direccionIp,
  });
}
