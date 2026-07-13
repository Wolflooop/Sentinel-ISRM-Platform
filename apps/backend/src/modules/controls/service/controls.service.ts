import { AppError } from "../../../shared/AppError";
import {
  actualizarControl,
  crearControl,
  eliminarControl,
  existeTratamientoParaControl,
  findControlPorId,
  findControles,
  findOrganizacionPorId,
  registrarAuditoriaControl,
} from "../repository/controls.repository";
import { CrearControlInput, ActualizarControlInput } from "../schema/controls.schema";
import { ControlConRelaciones, FiltrosControles } from "../types/controls.types";

interface ActorAuditoria {
  usuarioId: string;
  organizacionId: string;
  direccionIp: string;
}

export async function listarControles(
  filtros: FiltrosControles
): Promise<ControlConRelaciones[]> {
  return findControles(filtros);
}

export async function obtenerControl(id: string): Promise<ControlConRelaciones> {
  const control = await findControlPorId(id);
  if (!control) {
    throw new AppError("Control no encontrado", 404);
  }
  return control;
}

export async function crearNuevoControl(
  input: CrearControlInput,
  actor: ActorAuditoria
): Promise<ControlConRelaciones> {
  if (input.organizacionId) {
    const organizacion = await findOrganizacionPorId(input.organizacionId);
    if (!organizacion) {
      throw new AppError("La organización especificada no existe", 404);
    }
  }

  const control = await crearControl({
    organizacionId: input.organizacionId ?? null,
    codigoIso27001: input.codigoIso27001 ?? null,
    nombre: input.nombre,
    tipo: input.tipo,
    estadoImplementacion: input.estadoImplementacion ?? "NO_APLICADO",
    fechaImplementacion: input.fechaImplementacion ?? null,
    observaciones: input.observaciones ?? null,
    descripcionImplementacion: input.descripcionImplementacion ?? null,
  });

  await registrarAuditoriaControl({
    usuarioId: actor.usuarioId,
    organizacionId: actor.organizacionId,
    entidadId: control.id,
    accion: "CREAR",
    direccionIp: actor.direccionIp,
    datosNuevos: {
      nombre: control.nombre,
      tipo: control.tipo,
      estadoImplementacion: control.estadoImplementacion,
    },
  });

  return control;
}

export async function actualizarControlExistente(
  id: string,
  input: ActualizarControlInput,
  actor: ActorAuditoria
): Promise<ControlConRelaciones> {
  const anterior = await obtenerControl(id);

  if (input.organizacionId !== undefined && input.organizacionId) {
    const organizacion = await findOrganizacionPorId(input.organizacionId);
    if (!organizacion) {
      throw new AppError("La organización especificada no existe", 404);
    }
  }

  const actualizado = await actualizarControl(id, {
    organizacionId: input.organizacionId,
    codigoIso27001: input.codigoIso27001,
    nombre: input.nombre,
    tipo: input.tipo,
    estadoImplementacion: input.estadoImplementacion,
    fechaImplementacion: input.fechaImplementacion,
    observaciones: input.observaciones,
    descripcionImplementacion: input.descripcionImplementacion,
  });

  await registrarAuditoriaControl({
    usuarioId: actor.usuarioId,
    organizacionId: actor.organizacionId,
    entidadId: id,
    accion: "EDITAR",
    direccionIp: actor.direccionIp,
    datosAnteriores: {
      nombre: anterior.nombre,
      tipo: anterior.tipo,
      estadoImplementacion: anterior.estadoImplementacion,
    },
    datosNuevos: input,
  });

  return actualizado;
}

export async function eliminarControlExistente(
  id: string,
  actor: ActorAuditoria
): Promise<void> {
  const anterior = await obtenerControl(id);

  const referenciado = await existeTratamientoParaControl(id);
  if (referenciado) {
    throw new AppError("No se puede eliminar un control que está asociado a un tratamiento", 409);
  }

  await eliminarControl(id);

  await registrarAuditoriaControl({
    usuarioId: actor.usuarioId,
    organizacionId: actor.organizacionId,
    entidadId: id,
    accion: "ELIMINAR",
    direccionIp: actor.direccionIp,
    datosAnteriores: {
      nombre: anterior.nombre,
      tipo: anterior.tipo,
      estadoImplementacion: anterior.estadoImplementacion,
    },
  });
}
