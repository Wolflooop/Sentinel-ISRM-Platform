
export interface LoginResponseDTO {
  token: string;
  expiraEn: string; // ISO 8601
  usuario: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
    tipoRol: string;
    // null para el Administrador Principal (SUPER_ADMIN).
    organizacion: {
      id: string;
      nombre: string;
    } | null;
  };
}


export interface PerfilActualResponseDTO {
  usuario: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
    tipoRol: string;
    organizacion: {
      id: string;
      nombre: string;
    } | null;
  };
  permisos: Array<{ recurso: string; accion: string }>;
}
