
export interface RiesgoResponseDTO {
  id: string;
  probabilidad: number;
  impacto: number;
  valorRiesgo: number;
  nivelRiesgoInherente: string;
  nivelRiesgoResidual: string | null;
  estado: string;
  fechaUltimoCalculo: string;
  creadoEn: string;
  activo: { id: string; nombre: string };
  amenaza: { id: string; nombre: string };
  vulnerabilidad: { id: string; nombre: string };
}
