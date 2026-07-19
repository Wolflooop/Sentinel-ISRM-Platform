import { Prisma } from "@prisma/client";
import { AppError } from "../../../shared/AppError";
import {
  crearEntradaHistorialRiesgo,
  findEstadoActualRiesgo,
  actualizarEstadoRiesgo,
  crearEntradaHistorialControl,
  findEstadoActualControl,
} from "../repository/history.repository";
import { EstadoRiesgo, EstadoImplementacionControl } from "../types/history.types";

const MENSAJE_COMENTARIO_OBLIGATORIO = "No puede cambiar el estado sin ingresar un comentario";

/**
 * ÚNICO punto responsable de registrar la creación inicial de un Riesgo en
 * su historial (sin estado anterior, sin comentario obligatorio — no hay
 * transición, solo un punto de partida).
 */
export async function registrarCreacionRiesgo(
  tx: Prisma.TransactionClient,
  params: { riesgoId: string; usuarioId: string; estadoInicial: EstadoRiesgo }
): Promise<void> {
  await crearEntradaHistorialRiesgo(tx, {
    riesgoId: params.riesgoId,
    usuarioId: params.usuarioId,
    estadoAnterior: null,
    estadoNuevo: params.estadoInicial,
    comentario: null,
  });
}

/**
 * ÚNICO punto responsable de cambiar Riesgo.estado. Cualquier módulo que
 * necesite transicionar el estado de un riesgo (evaluations, treatments, o
 * cualquier otro en el futuro) DEBE llamar a esta función — nunca debe
 * existir un `tx.riesgo.update({ data: { estado } })` fuera de aquí.
 *
 * Reglas (ver Prioridad 3 y 5):
 * - Si el estado nuevo es igual al actual, no hay transición real: no se
 *   escribe nada (ni el estado ni el historial) y el comentario no se exige.
 * - Si hay una transición real, el comentario es obligatorio.
 */
export async function transicionarEstadoRiesgo(
  tx: Prisma.TransactionClient,
  params: {
    riesgoId: string;
    usuarioId: string;
    estadoNuevo: EstadoRiesgo;
    comentario: string | null | undefined;
    datosAdicionales?: Record<string, unknown>;
  }
): Promise<void> {
  const actual = await findEstadoActualRiesgo(tx, params.riesgoId);

  if (actual.estado === params.estadoNuevo) {
    return;
  }

  if (!params.comentario?.trim()) {
    throw new AppError(MENSAJE_COMENTARIO_OBLIGATORIO, 422);
  }

  await actualizarEstadoRiesgo(tx, params.riesgoId, params.estadoNuevo, params.datosAdicionales);

  await crearEntradaHistorialRiesgo(tx, {
    riesgoId: params.riesgoId,
    usuarioId: params.usuarioId,
    estadoAnterior: actual.estado,
    estadoNuevo: params.estadoNuevo,
    comentario: params.comentario.trim(),
  });
}

/**
 * ÚNICO punto responsable de registrar la creación inicial de un Control.
 */
export async function registrarCreacionControl(
  tx: Prisma.TransactionClient,
  params: { controlId: string; usuarioId: string; estadoInicial: EstadoImplementacionControl }
): Promise<void> {
  await crearEntradaHistorialControl(tx, {
    controlId: params.controlId,
    usuarioId: params.usuarioId,
    estadoAnterior: null,
    estadoNuevo: params.estadoInicial,
    comentario: null,
  });
}

/**
 * ÚNICO punto responsable de cambiar Control.estadoImplementacion, con las
 * mismas reglas que transicionarEstadoRiesgo. `datosControl` son el resto
 * de campos que se persisten en la MISMA escritura (nombre, tipo,
 * observaciones, etc.) para no duplicar la sentencia UPDATE.
 */
export async function transicionarEstadoControl<T extends object>(
  tx: Prisma.TransactionClient,
  params: {
    controlId: string;
    usuarioId: string;
    estadoNuevo: EstadoImplementacionControl;
    comentario: string | null | undefined;
    datosControl: T;
  }
): Promise<void> {
  const actual = await findEstadoActualControl(tx, params.controlId);
  const hayTransicion = actual.estadoImplementacion !== params.estadoNuevo;

  if (hayTransicion && !params.comentario?.trim()) {
    throw new AppError(MENSAJE_COMENTARIO_OBLIGATORIO, 422);
  }

  await tx.control.update({
    where: { id: params.controlId },
    data: { ...params.datosControl, estadoImplementacion: params.estadoNuevo },
  });

  if (hayTransicion) {
    await crearEntradaHistorialControl(tx, {
      controlId: params.controlId,
      usuarioId: params.usuarioId,
      estadoAnterior: actual.estadoImplementacion,
      estadoNuevo: params.estadoNuevo,
      comentario: (params.comentario as string).trim(),
    });
  }
}
