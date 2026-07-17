/**
 * Tipos internos del módulo auth, compartidos entre repository y service.
 * No son DTO de respuesta (ver dto/auth.dto.ts) ni esquemas de validación de
 * entrada (ver schema/auth.schema.ts).
 */

export interface UsuarioConRol {
  id: string;
  organizacionId: string;
  rolId: string;
  nombre: string;
  email: string;
  passwordHash: string;
  intentosFallidos: number;
  bloqueadoHasta: Date | null;
  activo: boolean;
  rol: {
    id: string;
    nombre: string;
  };
  organizacion: {
    id: string;
    nombre: string;
    estado: "ACTIVA" | "SUSPENDIDA" | "INACTIVA";
  };
}

export interface LoginResult {
  usuario: UsuarioConRol;
  token: string;
  expiraEn: Date;
}

/**
 * Perfil mínimo para GET /auth/me — a diferencia de `UsuarioConRol` (usado
 * internamente para login), nunca incluye `passwordHash`,
 * `intentosFallidos` ni `bloqueadoHasta`: no son necesarios para que el
 * frontend sepa "quién soy y qué puedo hacer", y no tiene sentido
 * transportarlos ni un paso más de lo estrictamente necesario.
 */
export interface UsuarioPerfil {
  id: string;
  nombre: string;
  email: string;
  rol: {
    id: string;
    nombre: string;
  };
  organizacion: {
    id: string;
    nombre: string;
  };
}

export interface PerfilActualResult {
  usuario: UsuarioPerfil;
  permisos: Array<{ recurso: string; accion: string }>;
}
