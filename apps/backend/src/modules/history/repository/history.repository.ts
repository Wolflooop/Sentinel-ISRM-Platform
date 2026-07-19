import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import {
  RiesgoHistorialEntrada,
  ControlHistorialEntrada,
  EstadoRiesgo,
  EstadoImplementacionControl,
} from "../types/history.types";

const INCLUDE_USUARIO = {
  usuario: {
    select: {
      id: true,
      nombre: true,
      rol: { select: { nombre: true } },
    },
  },
} as const;

// -----------------------------------------------------------------------
// Riesgo
// -----------------------------------------------------------------------

export async function crearEntradaHistorialRiesgo(
  tx: Prisma.TransactionClient,
  params: {
    riesgoId: string;
    usuarioId: string;
    estadoAnterior: EstadoRiesgo | null;
    estadoNuevo: EstadoRiesgo;
    comentario: string | null;
  }
): Promise<void> {
  await tx.riesgoHistorial.create({
    data: {
      riesgoId: params.riesgoId,
      usuarioId: params.usuarioId,
      estadoAnterior: params.estadoAnterior,
      estadoNuevo: params.estadoNuevo,
      comentario: params.comentario,
    },
  });
}

export async function findEstadoActualRiesgo(
  tx: Prisma.TransactionClient,
  riesgoId: string
): Promise<{ estado: EstadoRiesgo }> {
  return tx.riesgo.findUniqueOrThrow({
    where: { id: riesgoId },
    select: { estado: true },
  });
}

export async function actualizarEstadoRiesgo(
  tx: Prisma.TransactionClient,
  riesgoId: string,
  estadoNuevo: EstadoRiesgo,
  datosAdicionales?: Record<string, unknown>
): Promise<void> {
  await tx.riesgo.update({
    where: { id: riesgoId },
    data: { estado: estadoNuevo, ...datosAdicionales },
  });
}

export async function findHistorialDeRiesgo(riesgoId: string): Promise<RiesgoHistorialEntrada[]> {
  return prisma.riesgoHistorial.findMany({
    where: { riesgoId },
    include: INCLUDE_USUARIO,
    orderBy: { createdAt: "asc" },
  });
}

// -----------------------------------------------------------------------
// Control
// -----------------------------------------------------------------------

export async function crearEntradaHistorialControl(
  tx: Prisma.TransactionClient,
  params: {
    controlId: string;
    usuarioId: string;
    estadoAnterior: EstadoImplementacionControl | null;
    estadoNuevo: EstadoImplementacionControl;
    comentario: string | null;
  }
): Promise<void> {
  await tx.controlHistorial.create({
    data: {
      controlId: params.controlId,
      usuarioId: params.usuarioId,
      estadoAnterior: params.estadoAnterior,
      estadoNuevo: params.estadoNuevo,
      comentario: params.comentario,
    },
  });
}

export async function findEstadoActualControl(
  tx: Prisma.TransactionClient,
  controlId: string
): Promise<{ estadoImplementacion: EstadoImplementacionControl }> {
  return tx.control.findUniqueOrThrow({
    where: { id: controlId },
    select: { estadoImplementacion: true },
  });
}

export async function findHistorialDeControl(controlId: string): Promise<ControlHistorialEntrada[]> {
  return prisma.controlHistorial.findMany({
    where: { controlId },
    include: INCLUDE_USUARIO,
    orderBy: { createdAt: "asc" },
  });
}
