import { LoginResult } from "../types/auth.types";
import { LoginResponseDTO } from "../dto/auth.dto";

export function toLoginResponseDTO(result: LoginResult): LoginResponseDTO {
  return {
    token: result.token,
    expiraEn: result.expiraEn.toISOString(),
    usuario: {
      id: result.usuario.id,
      nombre: result.usuario.nombre,
      email: result.usuario.email,
      rol: result.usuario.rol.nombre,
      organizacion: {
        id: result.usuario.organizacion.id,
        nombre: result.usuario.organizacion.nombre,
      },
    },
  };
}
