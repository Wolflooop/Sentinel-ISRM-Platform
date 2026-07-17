/**
 * DTO de respuesta HTTP. Regla de la Constitución: toda respuesta pasa por
 * Prisma Model → Mapper → DTO → Controller Response. Nunca se expone
 * passwordHash, tokenHash ni ningún otro dato sensible interno.
 */
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

/**
 * Respuesta de GET /auth/me: perfil del usuario autenticado + permisos
 * reales de su rol, expresados como pares (recurso, accion) — el mismo
 * formato que ya consume `authorize` en el backend, para que el frontend
 * pueda razonar sobre permisos sin traducir ningún formato intermedio.
 */
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
