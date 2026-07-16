import { AppError } from "../../../shared/AppError";
import {
  actualizarControlConAuditoria,
  crearControlConAuditoria,
  eliminarControlConAuditoria,
  existeTratamientoParaControl,
  findControlVisiblePorId,
  findControlesVisiblesParaOrganizacion,
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
  organizacionId: string,
  filtros: FiltrosControles
): Promise<ControlConRelaciones[]> {
  return findControlesVisiblesParaOrganizacion(organizacionId, filtros);
}

/**
 * Visible tanto para controles globales como propios — 404 (no revela
 * existencia) si el control pertenece a otra organización, mismo criterio
 * de aislamiento ya usado en threats/users/roles/context/assets.
 */
export async function obtenerControl(
  id: string,
  organizacionId: string
): Promise<ControlConRelaciones> {
  const control = await findControlVisiblePorId(id, organizacionId);
  if (!control) {
    throw new AppError("Control no encontrado", 404);
  }
  return control;
}

/**
 * Ninguna operación de escritura de este módulo actúa sobre el catálogo
 * global (`organizacionId = NULL`) — mismo criterio ya resuelto en threats
 * para Amenaza (ver exigirAmenazaPropia).
 */
function exigirControlPropio(control: ControlConRelaciones, organizacionId: string): void {
  if (control.organizacionId !== organizacionId) {
    throw new AppError("No se puede modificar un control del catálogo global", 403);
  }
}

export async function crearNuevoControl(
  organizacionId: string,
  input: CrearControlInput,
  actor: ActorAuditoria
): Promise<ControlConRelaciones> {
  const estadoEfectivo = input.estadoImplementacion ?? "NO_APLICADO";
  const fechaEfectiva = normalizarFechaImplementacion(estadoEfectivo, input.fechaImplementacion, null);

  const control = await crearControlConAuditoria(
    {
      organizacionId,
      codigoIso27001: input.codigoIso27001 ?? null,
      nombre: input.nombre,
      tipo: input.tipo,
      estadoImplementacion: estadoEfectivo,
      fechaImplementacion: fechaEfectiva,
      observaciones: input.observaciones ?? null,
      descripcionImplementacion: input.descripcionImplementacion ?? null,
    },
    {
      usuarioId: actor.usuarioId,
      organizacionId: actor.organizacionId,
      accion: "CREAR",
      direccionIp: actor.direccionIp,
      datosNuevos: {
        nombre: input.nombre,
        tipo: input.tipo,
        estadoImplementacion: estadoEfectivo,
      },
    }
  );

  return control;
}

export async function actualizarControlExistente(
  id: string,
  organizacionId: string,
  input: ActualizarControlInput,
  actor: ActorAuditoria
): Promise<ControlConRelaciones> {
  const anterior = await obtenerControl(id, organizacionId);
  exigirControlPropio(anterior, organizacionId);

  const estadoEfectivo = input.estadoImplementacion ?? anterior.estadoImplementacion;
  const fechaEfectiva = normalizarFechaImplementacion(
    estadoEfectivo,
    input.fechaImplementacion,
    anterior.fechaImplementacion
  );

  const actualizado = await actualizarControlConAuditoria(
    id,
    {
      codigoIso27001: input.codigoIso27001,
      nombre: input.nombre,
      tipo: input.tipo,
      estadoImplementacion: input.estadoImplementacion,
      fechaImplementacion: fechaEfectiva,
      observaciones: input.observaciones,
      descripcionImplementacion: input.descripcionImplementacion,
    },
    {
      usuarioId: actor.usuarioId,
      organizacionId: actor.organizacionId,
      accion: "EDITAR",
      direccionIp: actor.direccionIp,
      datosAnteriores: {
        nombre: anterior.nombre,
        tipo: anterior.tipo,
        estadoImplementacion: anterior.estadoImplementacion,
      },
      datosNuevos: input,
    }
  );

  return actualizado;
}

export async function eliminarControlExistente(
  id: string,
  organizacionId: string,
  actor: ActorAuditoria
): Promise<void> {
  const anterior = await obtenerControl(id, organizacionId);
  exigirControlPropio(anterior, organizacionId);

  const referenciado = await existeTratamientoParaControl(id);
  if (referenciado) {
    throw new AppError("No se puede eliminar un control que está asociado a un tratamiento", 409);
  }

  await eliminarControlConAuditoria(id, {
    usuarioId: actor.usuarioId,
    organizacionId: actor.organizacionId,
    accion: "ELIMINAR",
    direccionIp: actor.direccionIp,
    datosAnteriores: {
      nombre: anterior.nombre,
      tipo: anterior.tipo,
      estadoImplementacion: anterior.estadoImplementacion,
    },
  });
}
