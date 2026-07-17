import { AppError } from "../../../shared/AppError";
import {
  findVulnerabilidades,
  findVulnerabilidadPorId,
  existeCategoriaVulnerabilidad,
  findCategoriasVulnerabilidad,
  existeAavParaVulnerabilidad,
  crearVulnerabilidad,
  actualizarVulnerabilidad,
  eliminarVulnerabilidad,
  registrarAuditoria,
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

const ENTIDAD = "Vulnerabilidad";

interface ActorAuditoria {
  usuarioId: string;
  organizacionId: string;
  direccionIp: string;
}


export async function listarVulnerabilidades(
  filtros: FiltrosVulnerabilidades
): Promise<VulnerabilidadConRelaciones[]> {
  return findVulnerabilidades(filtros);
}

export async function listarCategorias(): Promise<CategoriaVulnerabilidad[]> {
  return findCategoriasVulnerabilidad();
}

export async function obtenerVulnerabilidad(id: string): Promise<VulnerabilidadConRelaciones> {
  const vulnerabilidad = await findVulnerabilidadPorId(id);
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


export async function crearNuevaVulnerabilidad(
  input: CrearVulnerabilidadInput,
  actor: ActorAuditoria
): Promise<VulnerabilidadConRelaciones> {
  await validarCategoria(input.categoriaId);

  const vulnerabilidad = await crearVulnerabilidad(input);

  await registrarAuditoria({
    usuarioId: actor.usuarioId,
    organizacionId: actor.organizacionId,
    entidad: ENTIDAD,
    entidadId: vulnerabilidad.id,
    accion: "CREAR",
    datosNuevos: {
      nombre: vulnerabilidad.nombre,
      categoriaId: vulnerabilidad.categoria.id,
      severidad: vulnerabilidad.severidad,
    },
    direccionIp: actor.direccionIp,
  });

  return vulnerabilidad;
}

export async function actualizarVulnerabilidadExistente(
  id: string,
  input: ActualizarVulnerabilidadInput,
  actor: ActorAuditoria
): Promise<VulnerabilidadConRelaciones> {
  const anterior = await obtenerVulnerabilidad(id);

  if (input.categoriaId) {
    await validarCategoria(input.categoriaId);
  }

  const actualizada = await actualizarVulnerabilidad(id, input);

  await registrarAuditoria({
    usuarioId: actor.usuarioId,
    organizacionId: actor.organizacionId,
    entidad: ENTIDAD,
    entidadId: id,
    accion: "EDITAR",
    datosAnteriores: {
      nombre: anterior.nombre,
      categoriaId: anterior.categoria.id,
      severidad: anterior.severidad,
    },
    datosNuevos: input,
    direccionIp: actor.direccionIp,
  });

  return actualizada;
}


export async function eliminarVulnerabilidadExistente(
  id: string,
  actor: ActorAuditoria
): Promise<void> {
  const vulnerabilidad = await obtenerVulnerabilidad(id);

  const referenciada = await existeAavParaVulnerabilidad(id);
  if (referenciada) {
    throw new AppError(
      "No se puede eliminar una vulnerabilidad que participa en combinaciones de análisis (AAV)",
      409
    );
  }

  await eliminarVulnerabilidad(id);

  await registrarAuditoria({
    usuarioId: actor.usuarioId,
    organizacionId: actor.organizacionId,
    entidad: ENTIDAD,
    entidadId: id,
    accion: "ELIMINAR",
    datosAnteriores: { nombre: vulnerabilidad.nombre, categoriaId: vulnerabilidad.categoria.id },
    direccionIp: actor.direccionIp,
  });
}
