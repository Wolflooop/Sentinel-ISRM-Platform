import { findPermisos } from "../repository/permissions.repository";
import { Permiso } from "../types/permissions.types";

export async function listarPermisos(): Promise<Permiso[]> {
  return findPermisos();
}
