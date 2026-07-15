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
import { ControlConRelaciones, FiltrosControles, EstadoImplementacionControl } from "../types/controls.types";

interface ActorAuditoria {
  usuarioId: string;
  organizacionId: string;
  direccionIp: string;
}

/**
 * Regla documentada en schema.prisma sobre Control.fechaImplementacion:
 * debe permanecer NULL mientras estadoImplementacion !== "IMPLEMENTADO".
 * Se resuelve aquí, a nivel de aplicación (Zod no puede verlo porque
 * actualizarControlExistente mezcla un input parcial con el registro
 * existente):
 *  - Si el usuario intenta FIJAR una fecha explícita en un estado que no
 *    es "Implementado" -> se rechaza (error de captura).
 *  - Si el usuario solo cambia el estado (p. ej. desde el selector rápido
 *    del detalle) y el control ya tenía una fecha -> se limpia
 *    automáticamente para no dejar datos inconsistentes, en vez de romper
 *    esa actualización.
 */
function normalizarFechaImplementacion(
  estadoEfectivo: EstadoImplementacionControl,
  fechaImplementacionInput: Date | null | undefined,
  fechaImplementacionAnterior: Date | null
): Date | null {
  if (estadoEfectivo !== "IMPLEMENTADO") {
    if (fechaImplementacionInput) {
      throw new AppError(
        "La fecha de implementación solo puede registrarse cuando el estado es 'Implementado'",
        400
      );
    }
    return null;
  }
  return fechaImplementacionInput !== undefined ? fechaImplementacionInput : fechaImplementacionAnterior;
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

  const estadoEfectivo = input.estadoImplementacion ?? "NO_APLICADO";
  const fechaEfectiva = normalizarFechaImplementacion(estadoEfectivo, input.fechaImplementacion, null);

  const control = await crearControl({
    organizacionId: input.organizacionId ?? null,
    codigoIso27001: input.codigoIso27001 ?? null,
    nombre: input.nombre,
    tipo: input.tipo,
    estadoImplementacion: estadoEfectivo,
    fechaImplementacion: fechaEfectiva,
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

  const estadoEfectivo = input.estadoImplementacion ?? anterior.estadoImplementacion;
  const fechaEfectiva = normalizarFechaImplementacion(
    estadoEfectivo,
    input.fechaImplementacion,
    anterior.fechaImplementacion
  );

  const actualizado = await actualizarControl(id, {
    organizacionId: input.organizacionId,
    codigoIso27001: input.codigoIso27001,
    nombre: input.nombre,
    tipo: input.tipo,
    estadoImplementacion: input.estadoImplementacion,
    fechaImplementacion: fechaEfectiva,
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
