import { NivelRiesgo, TipoRol } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import {
  ActividadRecienteGlobal,
  ConteoPorNivelRiesgo,
  ConteoPorTipoRol,
} from "../types/dashboard.types";

const NIVELES_RIESGO: NivelRiesgo[] = ["BAJO", "MEDIO", "ALTO", "CRITICO"];
const TIPOS_ROL: TipoRol[] = ["SUPER_ADMIN", "ADMIN_TIC", "USUARIO_COMUN"];
const LIMITE_ACTIVIDAD_RECIENTE = 10;

export async function contarOrganizaciones(): Promise<number> {
  return prisma.organizacion.count();
}

export async function contarAdministradoresTic(): Promise<number> {
  return prisma.usuario.count({ where: { rol: { tipo: "ADMIN_TIC" } } });
}

export async function contarUsuarios(): Promise<number> {
  return prisma.usuario.count();
}

export async function contarActivosGlobal(): Promise<number> {
  return prisma.activo.count();
}

export async function contarRiesgosGlobal(): Promise<number> {
  return prisma.riesgo.count();
}

// El nivel vigente de un riesgo vive en su evaluación actual (puede ser
// INHERENTE o RESIDUAL, la que se haya registrado más recientemente — ver
// Riesgo.evaluacionActualId en el schema). Un riesgo sin Contexto ISO
// activo puede no tener evaluación aún; esos casos se excluyen del conteo
// en vez de asumir un nivel, igual que en el dashboard organizacional.
export async function obtenerRiesgosPorNivelGlobal(): Promise<ConteoPorNivelRiesgo> {
  const riesgos = await prisma.riesgo.findMany({
    select: { evaluacionActual: { select: { nivelRiesgo: true } } },
  });

  const conteo = Object.fromEntries(NIVELES_RIESGO.map((nivel) => [nivel, 0])) as ConteoPorNivelRiesgo;
  for (const riesgo of riesgos) {
    const nivel = riesgo.evaluacionActual?.nivelRiesgo;
    if (nivel) {
      conteo[nivel] += 1;
    }
  }
  return conteo;
}

export async function contarUsuariosPorTipoRol(): Promise<ConteoPorTipoRol> {
  const usuarios = await prisma.usuario.findMany({ select: { rol: { select: { tipo: true } } } });

  const conteo = Object.fromEntries(TIPOS_ROL.map((tipo) => [tipo, 0])) as ConteoPorTipoRol;
  for (const usuario of usuarios) {
    conteo[usuario.rol.tipo] += 1;
  }
  return conteo;
}

// Actividad reciente MULTIEMPRESA: a diferencia de /auditoria (que exige
// organizacionId y solo devuelve el rastro de la organización del actor),
// aquí se lee across todas las organizaciones a propósito — es la única
// vista del sistema pensada para el Administrador Principal.
export async function obtenerActividadRecienteGlobal(): Promise<ActividadRecienteGlobal[]> {
  return prisma.auditoria.findMany({
    select: {
      id: true,
      entidad: true,
      entidadId: true,
      accion: true,
      fecha: true,
      usuario: { select: { id: true, nombre: true } },
      organizacion: { select: { id: true, nombre: true } },
    },
    orderBy: { fecha: "desc" },
    take: LIMITE_ACTIVIDAD_RECIENTE,
  });
}
