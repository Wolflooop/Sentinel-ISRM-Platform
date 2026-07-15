import { Reporte } from "../types/reports.types";
import { useDescargarReporte } from "../hooks/useReports";

const ETIQUETA_TIPO: Record<string, string> = {
  EJECUTIVO: "Ejecutivo",
  TECNICO: "Técnico",
  GENERAL: "General",
};

interface ReportsHistoryTableProps {
  reportes: Reporte[];
}

export function ReportsHistoryTable({ reportes }: ReportsHistoryTableProps) {
  const descargarReporte = useDescargarReporte();

  if (reportes.length === 0) {
    return (
      <p className="mt-4 text-sm text-slate-500">
        Aún no se ha generado ningún reporte para esta organización.
      </p>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-slate-500">Tipo</th>
            <th className="px-4 py-2 text-left font-medium text-slate-500">Formato</th>
            <th className="px-4 py-2 text-left font-medium text-slate-500">Generado por</th>
            <th className="px-4 py-2 text-left font-medium text-slate-500">Fecha</th>
            <th className="px-4 py-2 text-right font-medium text-slate-500">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {reportes.map((reporte) => (
            <tr key={reporte.id}>
              <td className="px-4 py-2 text-slate-800">{ETIQUETA_TIPO[reporte.tipo] ?? reporte.tipo}</td>
              <td className="px-4 py-2 text-slate-600">{reporte.formato}</td>
              <td className="px-4 py-2 text-slate-600">{reporte.usuario.nombre}</td>
              <td className="px-4 py-2 text-slate-600">
                {new Date(reporte.fecha).toLocaleString("es-CO")}
              </td>
              <td className="px-4 py-2 text-right">
                <button
                  type="button"
                  onClick={() => descargarReporte.mutate(reporte)}
                  disabled={descargarReporte.isPending}
                  className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                >
                  Descargar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
