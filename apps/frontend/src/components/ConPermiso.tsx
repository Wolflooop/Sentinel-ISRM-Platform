import type { ReactNode } from "react";
import { usePerfilActual } from "../features/auth/hooks/usePerfilActual";
import { tienePermiso } from "../lib/permissions";

interface ConPermisoProps {
  recurso: string;
  accion: string;
  children: ReactNode;
}

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
