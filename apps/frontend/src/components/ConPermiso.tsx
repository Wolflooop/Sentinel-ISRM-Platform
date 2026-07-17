import type { ReactNode } from "react";
import { usePerfilActual } from "../features/auth/hooks/usePerfilActual";
import { tienePermiso } from "../lib/permissions";

interface ConPermisoProps {
  recurso: string;
  accion: string;
  children: ReactNode;
}

/**
 * Oculta `children` si el usuario autenticado no tiene el permiso
 * (recurso, accion) indicado, según el perfil real devuelto por
 * GET /auth/me (usePerfilActual).
 *
 * Mientras el perfil todavía se está cargando no renderiza nada — evita el
 * parpadeo de mostrar un botón y ocultarlo un instante después una vez que
 * se sabe que el usuario no tiene el permiso.
 *
 * Uso típico: envolver botones de crear/editar/cambiar estado que ya
 * existen en la UI, sin duplicar la lógica de permisos en cada pantalla.
 */
export function ConPermiso({ recurso, accion, children }: ConPermisoProps) {
  const { data: perfil, isLoading } = usePerfilActual();

  if (isLoading) {
    return null;
  }

  if (!tienePermiso(perfil?.permisos, recurso, accion)) {
    return null;
  }

  return <>{children}</>;
}
