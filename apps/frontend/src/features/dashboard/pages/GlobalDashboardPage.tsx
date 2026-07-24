import { Boxes, Building2, ShieldCheck, TriangleAlert, Users } from "lucide-react";
import { useIndicadoresGlobales } from "../hooks/useDashboard";
import { IndicatorCard } from "../components/IndicatorCard";
import { RiskLevelChart } from "../components/RiskLevelChart";
import { UsersByRoleChart } from "../components/UsersByRoleChart";
import { RecentActivityList } from "../components/RecentActivityList";

// Vista de administración GLOBAL de la plataforma, exclusiva del
// Administrador Principal (SUPER_ADMIN). Independiente de
// OrganizationDashboardPage (ADMIN_TIC/USUARIO_COMUN), que sigue sin
// cambios: aquella resume UNA organización; esta resume TODA la
// plataforma multiempresa (GET /api/dashboard/global).
function SkeletonCard() {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-surface-elevated p-5 shadow-sm">
      <div className="h-11 w-11 shrink-0 animate-pulse rounded-md bg-surface" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-24 animate-pulse rounded bg-surface" />
        <div className="h-6 w-10 animate-pulse rounded bg-surface" />
      </div>
    </div>
  );
}

export function GlobalDashboardPage() {
  const { data: indicadores, isLoading, isError } = useIndicadoresGlobales();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div>
        <h1 className="text-lg font-semibold text-ink">Dashboard Global</h1>
        <p className="mt-1 text-sm text-muted">
          Administración general de Sentinel ISRM: organizaciones, usuarios y riesgos de toda la plataforma.
        </p>
      </div>

      {isError && (
        <p className="mt-6 text-sm text-red-600">
          No se pudieron cargar los indicadores globales. Intenta recargar la página.
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          indicadores && (
            <>
              <IndicatorCard label="Organizaciones" value={indicadores.totalOrganizaciones} icon={Building2} />
              <IndicatorCard
                label="Administradores TIC"
                value={indicadores.totalAdministradoresTic}
                icon={ShieldCheck}
              />
              <IndicatorCard label="Usuarios" value={indicadores.totalUsuarios} icon={Users} />
              <IndicatorCard label="Activos registrados" value={indicadores.totalActivos} icon={Boxes} />
              <IndicatorCard label="Riesgos registrados" value={indicadores.totalRiesgos} icon={TriangleAlert} />
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
            <UsersByRoleChart usuariosPorTipoRol={indicadores.usuariosPorTipoRol} />
          </div>
        )
      )}

      {!isLoading && indicadores && (
        <div className="mt-6">
          <RecentActivityList actividad={indicadores.actividadReciente} />
        </div>
      )}
    </main>
  );
}
