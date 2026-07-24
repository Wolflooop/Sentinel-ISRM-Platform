// Vista independiente del SUPER_ADMIN para /dashboard.
//
// Alcance deliberadamente mínimo para esta fase: sin hooks, sin
// consultas al backend, sin indicadores ni KPIs. Solo separa la
// experiencia visual del Administrador Principal de la del Dashboard
// Organizacional (OrganizationDashboardPage), que sigue siendo
// exclusivo de ADMIN_TIC/USUARIO_COMUN y no se modificó.
//
// El espacio para indicadores globales (organizaciones, administradores
// TIC, etc.) queda reservado para una fase futura, cuando se definan y
// autoricen las consultas correspondientes.
export function GlobalDashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div>
        <h1 className="text-lg font-semibold text-ink">Dashboard Global</h1>
        <p className="mt-2 text-sm text-muted">Administración general de Sentinel ISRM.</p>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-surface-elevated p-6 shadow-sm">
        <p className="text-sm text-muted">
          Aquí se mostrarán los indicadores globales de la plataforma.
        </p>
      </div>
    </main>
  );
}
