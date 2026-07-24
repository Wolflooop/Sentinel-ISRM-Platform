import { Navigate, Outlet } from "react-router-dom";
import { usePerfilActual } from "../features/auth/hooks/usePerfilActual";

/**
 * Restringe una subruta a usuarios que pertenecen a una organización.
 *
 * Es independiente de RequierePermiso/RequiereTipoRol: existen módulos
 * (Contexto, Activos, Amenazas, Vulnerabilidades, Riesgos, Matriz,
 * Controles, Reportes) que dependen de que el usuario tenga una
 * organización asignada, sin importar qué permisos de recurso/acción
 * tenga. El SUPER_ADMIN (Administrador Principal) tiene todos los
 * permisos del catálogo por diseño del RBAC, pero `organizacion` es
 * `null` porque es un usuario global — por eso este guard no depende de
 * `tipoRol`, sino directamente de la presencia de organización.
 *
 * El backend vuelve a validar esto de forma independiente (rechaza la
 * operación cuando `organizacionId` es `null`), así que este guard es
 * solo UX — nunca la única barrera.
 */
export function RequiereOrganizacion() {
  const { data: perfil, isLoading, isError } = usePerfilActual();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-muted">Verificando permisos...</p>
      </div>
    );
  }

  if (isError || !perfil?.usuario.organizacion) {
    return <Navigate to="/acceso-restringido" replace />;
  }

  return <Outlet />;
}
