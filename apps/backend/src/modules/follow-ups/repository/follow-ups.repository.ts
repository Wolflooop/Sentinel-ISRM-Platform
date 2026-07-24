import { prisma } from "../../../config/prisma";
import { CrearSeguimientoParams, SeguimientoConRelaciones, FiltrosSeguimientos } from "../types/follow-ups.types";

const INCLUDE_USUARIO = {
  usuario: { select: { id: true, nombre: true, email: true } },
} as const;

export async function findSeguimientos(filtros: FiltrosSeguimientos): Promise<SeguimientoConRelaciones[]> {
  return prisma.seguimiento.findMany({
    where: {
      ...(filtros.riesgoId ? { riesgoId: filtros.riesgoId } : {}),
      ...(filtros.tratamientoId ? { tratamientoId: filtros.tratamientoId } : {}),
      ...(filtros.controlId ? { controlId: filtros.controlId } : {}),
    },
    include: INCLUDE_USUARIO,
    orderBy: { fecha: "asc" },
  });
}

export async function existeRiesgoDeOrganizacion(riesgoId: string, organizacionId: string): Promise<boolean> {
  const r = await prisma.riesgo.findFirst({
    where: {
      id: riesgoId,
      OR: [{ aav: { activo: { organizacionId } } }, { creador: { organizacionId } }],
    },
    select: { id: true },
  });
  return Boolean(r);
}

export async function existeTratamientoDeOrganizacion(
  tratamientoId: string,
  organizacionId: string
): Promise<boolean> {
  const t = await prisma.tratamiento.findFirst({
    where: {
      id: tratamientoId,
      riesgo: { OR: [{ aav: { activo: { organizacionId } } }, { creador: { organizacionId } }] },
    },
    select: { id: true },
  });
  return Boolean(t);
}

export async function existeControlVisible(controlId: string, organizacionId: string): Promise<boolean> {
  const c = await prisma.control.findFirst({
    where: { id: controlId, OR: [{ organizacionId: null }, { organizacionId }] },
    select: { id: true },
  });
  return Boolean(c);
}

// Fase 3B: resuelve el responsable actual del "registro padre" de un
// Seguimiento (riesgo, tratamiento o control — destino exclusivo, ya
// validado por validarDestino) para aplicar canManageRegistro. Devuelve
// undefined si el destino no existe (no debería pasar aquí porque
// validarDestino ya se ejecutó antes).
export async function findResponsableDelDestino(
  destino: { riesgoId?: string | null; tratamientoId?: string | null; controlId?: string | null },
  organizacionId: string
): Promise<string | null | undefined> {
  if (destino.riesgoId) {
    const r = await prisma.riesgo.findFirst({
      where: {
        id: destino.riesgoId,
        OR: [{ aav: { activo: { organizacionId } } }, { creador: { organizacionId } }],
      },
      select: { responsableId: true },
    });
    return r?.responsableId ?? undefined;
  }
  if (destino.tratamientoId) {
    const t = await prisma.tratamiento.findFirst({
      where: {
        id: destino.tratamientoId,
        riesgo: { OR: [{ aav: { activo: { organizacionId } } }, { creador: { organizacionId } }] },
      },
      select: { usuarioResponsableId: true },
    });
    return t?.usuarioResponsableId ?? undefined;
  }
  if (destino.controlId) {
    const c = await prisma.control.findFirst({
      where: { id: destino.controlId, OR: [{ organizacionId: null }, { organizacionId }] },
      select: { responsableId: true },
    });
    return c?.responsableId ?? undefined;
  }
  return undefined;
}

export async function crearSeguimiento(params: CrearSeguimientoParams): Promise<SeguimientoConRelaciones> {
  return prisma.$transaction(async (tx) => {
    const seguimiento = await tx.seguimiento.create({
      data: {
        riesgoId: params.riesgoId,
        tratamientoId: params.tratamientoId,
        controlId: params.controlId,
        usuarioId: params.usuarioId,
        descripcion: params.descripcion,
      },
      include: INCLUDE_USUARIO,
    });

    await tx.auditoria.create({
      data: {
        usuarioId: params.usuarioId,
        organizacionId: params.organizacionId,
        entidad: "Seguimiento",
        entidadId: seguimiento.id,
        accion: "CREAR",
        datosNuevos: {
          riesgoId: params.riesgoId,
          tratamientoId: params.tratamientoId,
          controlId: params.controlId,
        } as never,
        direccionIp: params.direccionIp,
      },
    });

    return seguimiento;
  });
}
