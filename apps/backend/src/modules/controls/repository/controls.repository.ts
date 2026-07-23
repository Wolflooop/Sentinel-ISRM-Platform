import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import {
  ActualizarControlParams,
  CrearControlParams,
  ControlConRelaciones,
  FiltrosControles,
  EstadoImplementacionControl,
} from "../types/controls.types";
import { ControlHistorialEntrada } from "../../history/types/history.types";
import { registrarCreacionControl, transicionarEstadoControl } from "../../history/service/history.service";
import { findHistorialDeControl as findHistorialDeControlRepo } from "../../history/repository/history.repository";

const CONTROL_INCLUDE = {
  organizacion: {
    select: { id: true, nombre: true },
  },
  responsable: {
    select: { id: true, nombre: true, email: true },
  },
} as const;

export async function findControlesVisiblesParaOrganizacion(
  organizacionId: string,
  filtros: FiltrosControles
): Promise<ControlConRelaciones[]> {
  return prisma.control.findMany({
    where: {
      OR: [{ organizacionId: null }, { organizacionId }],
      ...(filtros.tipo ? { tipo: filtros.tipo } : {}),
      ...(filtros.estadoImplementacion ? { estadoImplementacion: filtros.estadoImplementacion } : {}),
      ...(filtros.responsableId ? { responsableId: filtros.responsableId } : {}),
    },
    include: CONTROL_INCLUDE,
    orderBy: { nombre: "asc" },
  });
}

export async function findControlVisiblePorId(
  id: string,
  organizacionId: string
): Promise<ControlConRelaciones | null> {
  return prisma.control.findFirst({
    where: { id, OR: [{ organizacionId: null }, { organizacionId }] },
    include: CONTROL_INCLUDE,
  });
}

export async function findResponsableDeOrganizacion(
  usuarioId: string,
  organizacionId: string
): Promise<{ id: string } | null> {
  return prisma.usuario.findFirst({
    where: { id: usuarioId, organizacionId },
    select: { id: true },
  });
}

type AuditoriaControlParams = {
  usuarioId: string;
  organizacionId: string;
  accion: "CREAR" | "EDITAR" | "ELIMINAR";
  direccionIp: string;
  datosAnteriores?: unknown;
  datosNuevos?: unknown;
};

export async function crearControlConAuditoria(
  params: CrearControlParams,
  auditoria: AuditoriaControlParams
): Promise<ControlConRelaciones> {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const control = await tx.control.create({
      data: {
        organizacionId: params.organizacionId,
        codigoIso27001: params.codigoIso27001,
        nombre: params.nombre,
        tipo: params.tipo,
        estadoImplementacion: params.estadoImplementacion,
        fechaImplementacion: params.fechaImplementacion,
        observaciones: params.observaciones,
        descripcionImplementacion: params.descripcionImplementacion,
        responsableId: params.responsableId,
      },
      include: CONTROL_INCLUDE,
    });

    await tx.auditoria.create({
      data: {
        usuarioId: auditoria.usuarioId,
        organizacionId: auditoria.organizacionId,
        entidad: "Control",
        entidadId: control.id,
        accion: auditoria.accion,
        datosAnteriores: auditoria.datosAnteriores as never,
        datosNuevos: auditoria.datosNuevos as never,
        direccionIp: auditoria.direccionIp,
      },
    });

    await registrarCreacionControl(tx, {
      controlId: control.id,
      usuarioId: auditoria.usuarioId,
      estadoInicial: control.estadoImplementacion,
    });

    return control;
  });
}

export async function actualizarControlConAuditoria(
  id: string,
  params: ActualizarControlParams,
  auditoria: AuditoriaControlParams,
  transicion: {
    usuarioId: string;
    estadoNuevo: EstadoImplementacionControl;
    comentario: string | null | undefined;
  }
): Promise<ControlConRelaciones> {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await transicionarEstadoControl(tx, {
      controlId: id,
      usuarioId: transicion.usuarioId,
      estadoNuevo: transicion.estadoNuevo,
      comentario: transicion.comentario,
      datosControl: params,
    });

    await tx.auditoria.create({
      data: {
        usuarioId: auditoria.usuarioId,
        organizacionId: auditoria.organizacionId,
        entidad: "Control",
        entidadId: id,
        accion: auditoria.accion,
        datosAnteriores: auditoria.datosAnteriores as never,
        datosNuevos: auditoria.datosNuevos as never,
        direccionIp: auditoria.direccionIp,
      },
    });

    return tx.control.findUniqueOrThrow({ where: { id }, include: CONTROL_INCLUDE });
  });
}

export async function eliminarControlConAuditoria(
  id: string,
  auditoria: AuditoriaControlParams
): Promise<void> {
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.control.delete({ where: { id } });

    await tx.auditoria.create({
      data: {
        usuarioId: auditoria.usuarioId,
        organizacionId: auditoria.organizacionId,
        entidad: "Control",
        entidadId: id,
        accion: auditoria.accion,
        datosAnteriores: auditoria.datosAnteriores as never,
        datosNuevos: auditoria.datosNuevos as never,
        direccionIp: auditoria.direccionIp,
      },
    });
  });
}

// V2: la referencia ya no es la FK única controlPrincipalId sino el
// puente N:M TratamientoControl (punto 6 del prompt).
export async function existeTratamientoParaControl(controlId: string): Promise<boolean> {
  const vinculo = await prisma.tratamientoControl.findFirst({
    where: { controlId },
    select: { tratamientoId: true },
  });
  return Boolean(vinculo);
}

export async function findHistorialDeControl(controlId: string): Promise<ControlHistorialEntrada[]> {
  return findHistorialDeControlRepo(controlId);
}
