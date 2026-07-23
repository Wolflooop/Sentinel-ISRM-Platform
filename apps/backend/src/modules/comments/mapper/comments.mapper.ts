import { ComentarioConRelaciones } from "../types/comments.types";
import { ComentarioResponseDTO } from "../dto/comments.dto";

export function toComentarioResponseDTO(comentario: ComentarioConRelaciones): ComentarioResponseDTO {
  return {
    id: comentario.id,
    riesgoId: comentario.riesgoId,
    evaluacionId: comentario.evaluacionId,
    tratamientoId: comentario.tratamientoId,
    controlId: comentario.controlId,
    contenido: comentario.contenido,
    creadoEn: comentario.creadoEn.toISOString(),
    usuario: comentario.usuario,
  };
}

export function toComentarioResponseListDTO(comentarios: ComentarioConRelaciones[]): ComentarioResponseDTO[] {
  return comentarios.map(toComentarioResponseDTO);
}
