import { useReportes } from "../hooks/useReports";
import { ReportGeneratorPanel } from "../components/ReportGeneratorPanel";
import { ReportsHistoryTable } from "../components/ReportsHistoryTable";

export function ReportsPage() {
  const { data: reportes, isLoading, isError, refetch } = useReportes({});

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">Reportes</h1>
        <p className="mt-1 text-sm text-slate-500">
          Genera reportes en PDF con el estado de activos, riesgos, matriz de riesgos y controles,
          y descarga los reportes generados anteriormente.
        </p>
      </div>

      <div className="mt-5">
        <ReportGeneratorPanel onGenerado={() => refetch()} />
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-slate-800">Historial de reportes</h2>
        {isLoading && <p className="mt-4 text-sm text-slate-500">Cargando historial...</p>}
        {isError && <p className="mt-4 text-sm text-red-600">No se pudo cargar el historial de reportes.</p>}
        {reportes && <ReportsHistoryTable reportes={reportes} />}
      </div>
    </main>
  );
}
