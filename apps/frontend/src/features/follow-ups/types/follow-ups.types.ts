export interface Seguimiento {
  id: string;
  riesgoId: string | null;
  tratamientoId: string | null;
  controlId: string | null;
  descripcion: string;
  fecha: string;
  usuario: { id: string; nombre: string; email: string };
}

export type DestinoSeguimiento =
  | { riesgoId: string }
  | { tratamientoId: string }
  | { controlId: string };
