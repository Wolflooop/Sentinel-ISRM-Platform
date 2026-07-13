import { prisma } from "../../../config/prisma";
import {
  ActualizarControlParams,
  CrearControlParams,
  ControlConRelaciones,
  FiltrosControles,
} from "../types/controls.types";

const CONTROL_INCLUDE = {
  organizacion: {
    select: {
      id: true,
      nombre: true,
    },
  },
} as const;

export async function findControles(
  filtros: FiltrosControles
): Promise<ControlConRelaciones[]> {
  return prisma.control.findMany({
    where: {
      ...(filtros.organizacionId ? { organizacionId: filtros.organizacionId } : {}),
      ...(filtros.tipo ? { tipo: filtros.tipo } : {}),
      ...(filtros.estadoImplementacion ? { estadoImplementacion: filtros.estadoImplementacion } : {}),
    },
    include: CONTROL_INCLUDE,
    orderBy: { nombre: "asc" },
  });
}

export async function findControlPorId(id: string): Promise<ControlConRelaciones | null> {
  return prisma.control.findUnique({
    where: { id },
    include: CONTROL_INCLUDE,
  });
}

export async function findOrganizacionPorId(
  organizacionId: string
): Promise<{ id: string } | null> {
  return prisma.organizacion.findUnique({
    where: { id: organizacionId },
    select: { id: true },
  });
}

export async function crearControl(params: CrearControlParams): Promise<ControlConRelaciones> {
  return prisma.control.create({
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
}

export async function actualizarControl(
  id: string,
  params: ActualizarControlParams
): Promise<ControlConRelaciones> {
  return prisma.control.update({
    where: { id },
    data: params,
    include: CONTROL_INCLUDE,
  });
}

export async function eliminarControl(id: string): Promise<void> {
  await prisma.control.delete({ where: { id } });
}

export async function existeTratamientoParaControl(controlId: string): Promise<boolean> {
  const tratamiento = await prisma.tratamiento.findFirst({
    where: { controlPrincipalId: controlId },
    select: { id: true },
  });
  return Boolean(tratamiento);
}

export async function registrarAuditoriaControl(params: {
  usuarioId: string;
  organizacionId: string;
  entidadId: string;
  accion: "CREAR" | "EDITAR" | "ELIMINAR";
  direccionIp: string;
  datosAnteriores?: unknown;
  datosNuevos?: unknown;
}): Promise<void> {
  await prisma.auditoria.create({
    data: {
      usuarioId: params.usuarioId,
      organizacionId: params.organizacionId,
      entidad: "Control",
      entidadId: params.entidadId,
      accion: params.accion,
      datosAnteriores: params.datosAnteriores as never,
      datosNuevos: params.datosNuevos as never,
      direccionIp: params.direccionIp,
    },
  });
}
