import { prisma } from "../../../config/prisma";
import { Permiso } from "../types/permissions.types";

export async function findPermisos(): Promise<Permiso[]> {
  return prisma.permiso.findMany({ orderBy: [{ recurso: "asc" }, { accion: "asc" }] });
}
