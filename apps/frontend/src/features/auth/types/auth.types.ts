export interface LoginResponse {
  token: string;
  expiraEn: string;
  usuario: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
    organizacion: {
      id: string;
      nombre: string;
    };
  };
}

export interface PermisoActual {
  recurso: string;
  accion: string;
}

export interface PerfilActual {
  usuario: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
    organizacion: {
      id: string;
      nombre: string;
    };
  };
  permisos: PermisoActual[];
}
