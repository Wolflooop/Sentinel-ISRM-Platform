import { UsuarioConRol } from "../types/users.types";
import { UsuarioResponseDTO } from "../dto/users.dto";

export function toUsuarioResponseDTO(usuario: UsuarioConRol): UsuarioResponseDTO {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    activo: usuario.activo,
    ultimoLogin: usuario.ultimoLogin ? usuario.ultimoLogin.toISOString() : null,
    creadoEn: usuario.creadoEn.toISOString(),
    organizacionId: usuario.organizacionId,
    rol: {
      id: usuario.rol.id,
      nombre: usuario.rol.nombre,
      tipo: usuario.rol.tipo,
    },
  };
}

export function toUsuarioResponseListDTO(usuarios: UsuarioConRol[]): UsuarioResponseDTO[] {
  return usuarios.map(toUsuarioResponseDTO);
}
