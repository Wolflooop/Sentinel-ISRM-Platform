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
    select: {
      id: true,
      nombre: true,
    },
  },
} as const;

/**
 * Catálogo híbrido (mismo criterio que threats.repository.ts): incluye los
 * controles globales (`organizacionId = NULL`, ISO/IEC 27001 Anexo A) junto
 * con los propios de la organización solicitante. `organizacionId` ya no es
 * un filtro opcional del query — es obligatorio y se resuelve del JWT en el
 * Service, nunca del cliente.
 */
export async function findControlesVisiblesParaOrganizacion(
  organizacionId: string,
  filtros: FiltrosControles
): Promise<ControlConRelaciones[]> {
  return prisma.control.findMany({
    where: {
      OR: [{ organizacionId: null }, { organizacionId }],
      ...(filtros.tipo ? { tipo: filtros.tipo } : {}),
      ...(filtros.estadoImplementacion ? { estadoImplementacion: filtros.estadoImplementacion } : {}),
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

type AuditoriaControlParams = {
  usuarioId: string;
  organizacionId: string;
  accion: "CREAR" | "EDITAR" | "ELIMINAR";
  direccionIp: string;
  datosAnteriores?: unknown;
  datosNuevos?: unknown;
};

/**
 * Corrección de auditoría (mismo patrón que risks.repository.ts): la
 * escritura de negocio y el registro de Auditoria quedan en la MISMA
 * transacción, para que un Control nunca pueda quedar persistido sin su
 * registro de auditoría correspondiente.
 */
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

    // Primera entrada del historial: único punto responsable, ver
    // modules/history/service/history.service.ts.
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
    // Único punto responsable de cambiar Control.estadoImplementacion y
    // registrar su historial (ver modules/history/service/history.service.ts).
    // También persiste el resto de campos (nombre, tipo, observaciones,
    // etc.) en la misma escritura, para no duplicar el UPDATE.
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

export async function existeTratamientoParaControl(controlId: string): Promise<boolean> {
  const tratamiento = await prisma.tratamiento.findFirst({
    where: { controlPrincipalId: controlId },
    select: { id: true },
  });
  return Boolean(tratamiento);
}



// ---------------------------------------------------------------------------
// Historial. findControlVisiblePorId ya resuelve la visibilidad híbrida
// (global vs. propio de la organización) antes de listar el historial. La
// lectura/escritura del historial en sí vive en modules/history/repository.
// ---------------------------------------------------------------------------
export async function findHistorialDeControl(controlId: string): Promise<ControlHistorialEntrada[]> {
  return findHistorialDeControlRepo(controlId);
}
