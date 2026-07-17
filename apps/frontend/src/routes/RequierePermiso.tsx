import { Navigate, Outlet } from "react-router-dom";
import { usePerfilActual } from "../features/auth/hooks/usePerfilActual";
import { tienePermiso } from "../lib/permissions";

interface RequierePermisoProps {
  recurso: string;
  accion: string;
}

/**
 * Guard de rutas por permiso real — segundo nivel de protección, después de
 * `ProtectedRoute` (que solo garantiza que exista una sesión válida). Se
 * monta como elemento padre de las rutas de un módulo en AppRouter, igual
 * que `ProtectedRoute` se monta como padre de todo el árbol autenticado.
 *
 * Mientras el perfil (GET /auth/me) todavía se está cargando, muestra un
 * estado neutro en vez de negar o conceder acceso de forma prematura. Si el
 * usuario autenticado no tiene el permiso requerido, redirige a
 * `/acceso-restringido` — nunca se muestra un error técnico ni una pantalla
 * parcial del módulo.
 */
export function RequierePermiso({ recurso, accion }: RequierePermisoProps) {
  const { data: perfil, isLoading, isError } = usePerfilActual();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-muted">Verificando permisos...</p>
      </div>
    );
  }

  if (isError || !tienePermiso(perfil?.permisos, recurso, accion)) {
    return <Navigate to="/acceso-restringido" replace />;
  }

  return <Outlet />;
}
