import { useState } from "react";
import { TipoReporte } from "../types/reports.types";
import { useGenerarReporte } from "../hooks/useReports";

const TIPOS: Array<{ valor: TipoReporte; label: string; descripcion: string }> = [
  {
    valor: "EJECUTIVO",
    label: "Ejecutivo",
    descripcion: "Resumen de alto nivel: activos, niveles de riesgo y estado de controles.",
  },
  {
    valor: "TECNICO",
    label: "Técnico",
    descripcion: "Detalle completo: amenazas, vulnerabilidades, matriz de riesgos y controles.",
  },
  {
    valor: "GENERAL",
    label: "General",
    descripcion: "Vista combinada de todo el estado de seguridad de la organización.",
  },
];

interface ReportGeneratorPanelProps {
  onGenerado: () => void;
}

export function ReportGeneratorPanel({ onGenerado }: ReportGeneratorPanelProps) {
  const [tipo, setTipo] = useState<TipoReporte>("EJECUTIVO");
  const generarReporte = useGenerarReporte();

  const handleGenerar = () => {
    generarReporte.mutate(
      { tipo, formato: "PDF" },
      {
        onSuccess: onGenerado,
      }
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-800">Generar nuevo reporte</h2>
      <p className="mt-1 text-sm text-slate-500">
        Selecciona el tipo de reporte. Por ahora se genera en formato PDF; XLSX y CSV estarán
        disponibles próximamente.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {TIPOS.map((opcion) => (
          <button
            key={opcion.valor}
            type="button"
            onClick={() => setTipo(opcion.valor)}
            className={`rounded-lg border p-3 text-left text-sm transition ${
              tipo === opcion.valor
                ? "border-slate-800 bg-slate-800 text-white"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span className="block font-medium">{opcion.label}</span>
            <span className={`mt-1 block text-xs ${tipo === opcion.valor ? "text-slate-200" : "text-slate-500"}`}>
              {opcion.descripcion}
            </span>
          </button>
        ))}
      </div>

      {generarReporte.isError && (
        <p className="mt-3 text-sm text-red-600">
          No se pudo generar el reporte. Verifica que la organización tenga datos registrados.
        </p>
      )}

      <button
        type="button"
        onClick={handleGenerar}
        disabled={generarReporte.isPending}
        className="mt-4 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {generarReporte.isPending ? "Generando..." : "Generar reporte"}
      </button>
    </div>
  );
}
