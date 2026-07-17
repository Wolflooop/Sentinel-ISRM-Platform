import { Navigate, Outlet } from "react-router-dom";
import { usePerfilActual } from "../features/auth/hooks/usePerfilActual";
import { tienePermiso } from "../lib/permissions";

interface RequierePermisoProps {
  recurso: string;
  accion: string;
}

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
