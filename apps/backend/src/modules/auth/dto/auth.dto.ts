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
