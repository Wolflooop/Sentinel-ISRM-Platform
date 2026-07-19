import { TipoRol } from "../../roles/types/roles.types";

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  activo: boolean;
  ultimoLogin: string | null;
  creadoEn: string;
  // null solo para un SUPER_ADMIN.
  organizacionId: string | null;
  rol: {
    id: string;
    nombre: string;
    tipo: TipoRol;
  };
}
