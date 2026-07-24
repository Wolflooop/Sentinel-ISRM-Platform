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
      <p className="mt-4 text-sm text-muted">
        Aún no se ha generado ningún reporte para esta organización.
      </p>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-sm">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-surface">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-muted">Tipo</th>
            <th className="px-4 py-2 text-left font-medium text-muted">Formato</th>
            <th className="px-4 py-2 text-left font-medium text-muted">Generado por</th>
            <th className="px-4 py-2 text-left font-medium text-muted">Fecha</th>
            <th className="px-4 py-2 text-right font-medium text-muted">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {reportes.map((reporte) => (
            <tr key={reporte.id}>
              <td className="px-4 py-2 text-ink">{ETIQUETA_TIPO[reporte.tipo] ?? reporte.tipo}</td>
              <td className="px-4 py-2 text-muted">{reporte.formato}</td>
              <td className="px-4 py-2 text-muted">{reporte.usuario.nombre}</td>
              <td className="px-4 py-2 text-muted">
                {new Date(reporte.fecha).toLocaleString("es-CO")}
              </td>
              <td className="px-4 py-2 text-right">
                <button
                  type="button"
                  onClick={() => descargarReporte.mutate(reporte)}
                  disabled={descargarReporte.isPending}
                  className="rounded-md border border-border px-3 py-1 text-xs font-medium text-ink hover:bg-surface disabled:opacity-60"
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
