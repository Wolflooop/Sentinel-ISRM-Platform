export interface Comentario {
  id: string;
  riesgoId: string | null;
  evaluacionId: string | null;
  tratamientoId: string | null;
  controlId: string | null;
  contenido: string;
  creadoEn: string;
  usuario: { id: string; nombre: string; email: string };
}

export type DestinoComentario =
  | { riesgoId: string }
  | { evaluacionId: string }
  | { tratamientoId: string }
  | { controlId: string };
