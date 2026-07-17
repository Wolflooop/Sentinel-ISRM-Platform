import { Link } from "react-router-dom";
import { ShieldCheck, Users } from "lucide-react";
import { Rol } from "../types/roles.types";
import { useRolConPermisos } from "../hooks/useRoles";

interface RoleCardProps {
  rol: Rol;
  /** null cuando no se pudo calcular (p. ej. el usuario no tiene permiso "usuarios:leer"). */
  totalUsuarios: number | null;
}

/**
 * Tarjeta de un rol para la vista en grid de RolesListPage — reemplaza a la
 * antigua RolesTable. No existe (ni se crea) un endpoint de listado que
 * traiga permisos agrupados: cada tarjeta pide sus propios permisos vía
 * GET /roles/:id/permisos (el mismo endpoint que ya usa RolDetailPage).
 */
export function RoleCard({ rol, totalUsuarios }: RoleCardProps) {
  const { data: rolConPermisos } = useRolConPermisos(rol.id);

  const permisosPorRecurso = (rolConPermisos?.permisos ?? []).reduce<Record<string, number>>(
    (acumulado, permiso) => {
      acumulado[permiso.recurso] = (acumulado[permiso.recurso] ?? 0) + 1;
      return acumulado;
    },
    {}
  );
  const recursosConPermiso = Object.entries(permisosPorRecurso);

  return (
    <div className="flex flex-col rounded-lg border border-border bg-surface-elevated p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
          <ShieldCheck className="h-5 w-5 text-primary" strokeWidth={2} />
        </div>
        <span
          className={
            rol.esSistema
              ? "rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
              : "rounded-full bg-surface px-2 py-0.5 text-xs text-muted"
          }
        >
          {rol.esSistema ? "Sistema" : "Personalizado"}
        </span>
      </div>

      <h3 className="mt-3 text-base font-semibold text-ink">{rol.nombre}</h3>
      <p className="mt-1 min-h-[2.5rem] text-sm text-muted">
        {rol.descripcion ?? "Sin descripción"}
      </p>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted">
        <Users className="h-3.5 w-3.5" strokeWidth={2} />
        {totalUsuarios === null
          ? "Usuarios: —"
          : `${totalUsuarios} usuario${totalUsuarios === 1 ? "" : "s"} asignado${
              totalUsuarios === 1 ? "" : "s"
            }`}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {recursosConPermiso.length === 0 ? (
          <span className="text-xs text-muted">Sin permisos asignados</span>
        ) : (
          recursosConPermiso.map(([recurso, cantidad]) => (
            <span
              key={recurso}
              className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted"
            >
              ✓ {recurso} ({cantidad})
            </span>
          ))
        )}
      </div>

      <Link
        to={`/roles/${rol.id}`}
        className="mt-4 inline-block rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-on-primary hover:bg-primary-hover"
      >
        Gestionar rol
      </Link>
    </div>
  );
}
