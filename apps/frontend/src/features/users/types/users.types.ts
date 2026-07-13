export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  activo: boolean;
  ultimoLogin: string | null;
  creadoEn: string;
  rol: {
    id: string;
    nombre: string;
  };
}
