
export interface LoginResponseDTO {
  token: string;
  expiraEn: string; // ISO 8601
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


export interface PerfilActualResponseDTO {
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
  permisos: Array<{ recurso: string; accion: string }>;
}
