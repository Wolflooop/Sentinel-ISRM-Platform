import { AppError } from "../../../shared/AppError";
import {
  actualizarControlConAuditoria,
  crearControlConAuditoria,
  eliminarControlConAuditoria,
  existeTratamientoParaControl,
  findControlVisiblePorId,
  findControlesVisiblesParaOrganizacion,
  findHistorialDeControl,
  findResponsableDeOrganizacion,
} from "../repository/controls.repository";
import { CrearControlInput, ActualizarControlInput } from "../schema/controls.schema";
import { ControlConRelaciones, FiltrosControles, EstadoImplementacionControl } from "../types/controls.types";
import { ControlHistorialEntrada } from "../../history/types/history.types";

interface ActorAuditoria {
  usuarioId: string;
  organizacionId: string;
  direccionIp: string;
}

function normalizarFechaImplementacion(
  estadoEfectivo: EstadoImplementacionControl,
  fechaImplementacionInput: Date | null | undefined,
  fechaImplementacionAnterior: Date | null
): Date | null {
  if (estadoEfectivo !== "IMPLEMENTADO" && estadoEfectivo !== "VERIFICADO") {
    if (fechaImplementacionInput) {
      throw new AppError(
        "La fecha de implementación solo puede registrarse cuando el estado es 'Implementado' o 'Verificado'",
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

function exigirControlPropio(control: ControlConRelaciones, organizacionId: string): void {
  if (control.organizacionId !== organizacionId) {
    throw new AppError("No se puede modificar un control del catálogo global", 403);
  }
}

async function validarResponsable(
  responsableId: string | null | undefined,
  organizacionId: string
): Promise<void> {
  if (!responsableId) return;
  const responsable = await findResponsableDeOrganizacion(responsableId, organizacionId);
  if (!responsable) {
    throw new AppError("El responsable indicado no pertenece a esta organización", 404);
  }
}

export async function crearNuevoControl(
  organizacionId: string,
  input: CrearControlInput,
  actor: ActorAuditoria
): Promise<ControlConRelaciones> {
  const estadoEfectivo = input.estadoImplementacion ?? "NO_INICIADO";
  const fechaEfectiva = normalizarFechaImplementacion(estadoEfectivo, input.fechaImplementacion, null);
  await validarResponsable(input.responsableId, organizacionId);

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
      responsableId: input.responsableId ?? null,
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
        responsableId: input.responsableId ?? null,
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

  if (input.responsableId !== undefined) {
    await validarResponsable(input.responsableId, organizacionId);
  }

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
      responsableId: input.responsableId,
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
    },
    {
      usuarioId: actor.usuarioId,
      estadoNuevo: estadoEfectivo,
      comentario: input.comentario,
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

export async function obtenerHistorialDeControl(
  id: string,
  organizacionId: string
): Promise<ControlHistorialEntrada[]> {
  await obtenerControl(id, organizacionId);
  return findHistorialDeControl(id);
}
