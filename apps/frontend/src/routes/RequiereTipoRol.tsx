import { Navigate, Outlet } from "react-router-dom";
import { usePerfilActual } from "../features/auth/hooks/usePerfilActual";

interface RequiereTipoRolProps {
  tipoRol: "SUPER_ADMIN" | "ADMIN_TIC" | "USUARIO_COMUN";
}

/**
 * Restringe una subruta a un TipoRol concreto de la jerarquía
 * (Administrador Principal / Administrador TIC / Usuario Común).
 *
 * Es independiente de RequierePermiso: existen pantallas (administración
 * global de organizaciones) que dependen del nivel jerárquico del rol y no
 * solo de un permiso de recurso/acción. El backend vuelve a validar esto de
 * forma independiente (`requireTipoRol`), así que este guard es solo UX —
 * nunca la única barrera.
 */
export function RequiereTipoRol({ tipoRol }: RequiereTipoRolProps) {
  const { data: perfil, isLoading, isError } = usePerfilActual();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-muted">Verificando permisos...</p>
      </div>
    );
  }

  if (isError || perfil?.usuario.tipoRol !== tipoRol) {
    return <Navigate to="/acceso-restringido" replace />;
  }

  return <Outlet />;
}
