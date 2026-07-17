import { Boxes, ShieldAlert, ShieldCheck, TriangleAlert } from "lucide-react";
import { useIndicadoresDashboard } from "../hooks/useDashboard";
import { IndicatorCard } from "../components/IndicatorCard";
import { RiskLevelChart } from "../components/RiskLevelChart";
import { ControlsStatusChart } from "../components/ControlsStatusChart";

function SkeletonCard() {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-surface-elevated p-5 shadow-sm">
      <div className="h-11 w-11 shrink-0 animate-pulse rounded-md bg-surface" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-20 animate-pulse rounded bg-surface" />
        <div className="h-6 w-10 animate-pulse rounded bg-surface" />
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { data: indicadores, isLoading, isError } = useIndicadoresDashboard();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div>
        <h1 className="text-lg font-semibold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Resumen general del estado de riesgos de seguridad de la información de tu organización.
        </p>
      </div>

      {isError && (
        <p className="mt-6 text-sm text-red-600">
          No se pudieron cargar los indicadores. Intenta recargar la página.
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          indicadores && (
            <>
              <IndicatorCard label="Total de activos" value={indicadores.totalActivos} icon={Boxes} />
              <IndicatorCard label="Total de riesgos" value={indicadores.totalRiesgos} icon={TriangleAlert} />
              <IndicatorCard
                label="Riesgos críticos"
                value={indicadores.riesgosCriticos}
                icon={ShieldAlert}
                tone="critical"
              />
              <IndicatorCard label="Controles existentes" value={indicadores.totalControles} icon={ShieldCheck} />
            </>
          )
        )}
      </div>

      {isLoading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-lg border border-border bg-surface" />
          <div className="h-72 animate-pulse rounded-lg border border-border bg-surface" />
        </div>
      ) : (
        indicadores && (
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RiskLevelChart riesgosPorNivel={indicadores.riesgosPorNivel} />
            <ControlsStatusChart controlesPorEstado={indicadores.controlesPorEstado} />
          </div>
        )
      )}
    </main>
  );
}
