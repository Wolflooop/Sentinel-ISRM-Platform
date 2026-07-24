import { usePerfilActual } from "../../auth/hooks/usePerfilActual";
import { GlobalDashboardPage } from "./GlobalDashboardPage";
import { OrganizationDashboardPage } from "./OrganizationDashboardPage";

// Punto de entrada único de la ruta /dashboard. El contenido que se
// muestra depende de a quién pertenece la sesión:
//   - SUPER_ADMIN: Dashboard Global (vista mínima, sin indicadores por
//     ahora — ver GlobalDashboardPage).
//   - ADMIN_TIC / USUARIO_COMUN: Dashboard Organizacional existente
//     (activos, riesgos, controles), sin ningún cambio.
// Antes de esta fase, todos los roles recibían el dashboard operativo,
// lo que rompía la vista del SUPER_ADMIN (llamaba a /activos, /riesgos y
// /controles, endpoints que exigen una organización que el SUPER_ADMIN no
// tiene). Se resuelve aquí usando el perfil ya cargado por
// usePerfilActual (hook existente, no se agregó ninguno nuevo), sin
// tocar la ruta ni el backend.
export function DashboardPage() {
  const { data: perfil, isLoading } = usePerfilActual();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-muted">Cargando dashboard...</p>
      </div>
    );
  }

  if (perfil?.usuario.tipoRol === "SUPER_ADMIN") {
    return <GlobalDashboardPage />;
  }

  return <OrganizationDashboardPage />;
}
