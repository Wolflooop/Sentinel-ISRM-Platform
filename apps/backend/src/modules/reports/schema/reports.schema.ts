import { z } from "zod";

export const generarReporteSchema = z.object({
  tipo: z.enum(["EJECUTIVO", "TECNICO", "GENERAL"]),
  formato: z.enum(["PDF", "XLSX", "CSV"]).default("PDF"),
});

export type GenerarReporteInput = z.infer<typeof generarReporteSchema>;

export const filtrosReportesSchema = z.object({
  tipo: z.enum(["EJECUTIVO", "TECNICO", "GENERAL"]).optional(),
});

export type FiltrosReportesInput = z.infer<typeof filtrosReportesSchema>;
