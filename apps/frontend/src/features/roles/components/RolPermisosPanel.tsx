import { useState } from "react";
import { RolConPermisos, Permiso } from "../types/roles.types";
import { useAsignarPermiso, useQuitarPermiso } from "../hooks/useRoles";
import { ConPermiso } from "../../../components/ConPermiso";

interface Props {
  rol: RolConPermisos;
  permisosDisponibles: Permiso[];
}

export function RolPermisosPanel({ rol, permisosDisponibles }: Props) {
  const [permisoSeleccionado, setPermisoSeleccionado] = useState("");
  const asignarPermiso = useAsignarPermiso(rol.id);
  const quitarPermiso = useQuitarPermiso(rol.id);

  const idsAsignados = new Set(rol.permisos.map((p) => p.id));
  const permisosParaAsignar = permisosDisponibles.filter((p) => !idsAsignados.has(p.id));

  const soloUnPermiso = rol.esSistema && rol.permisos.length <= 1;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-ink">Permisos asignados</h3>
        <ul className="mt-2 divide-y divide-border rounded-md border border-border">
          {rol.permisos.map((permiso) => (
            <li
              key={permiso.id}
              className="flex items-center justify-between px-3 py-2 text-sm"
            >
              <span className="text-ink">
                {permiso.recurso}:{permiso.accion}
              </span>
              <ConPermiso recurso="roles" accion="gestionarPermisos">
                <button
                  type="button"
                  disabled={quitarPermiso.isPending || soloUnPermiso}
                  title={
                    soloUnPermiso
                      ? "Un rol del sistema no puede quedar sin permisos"
                      : undefined
                  }
                  onClick={() => quitarPermiso.mutate(permiso.id)}
                  className="text-xs text-red-600 underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
                >
                  Quitar
                </button>
              </ConPermiso>
            </li>
          ))}
          {rol.permisos.length === 0 && (
            <li className="px-3 py-2 text-sm text-muted">Sin permisos asignados</li>
          )}
        </ul>
        {soloUnPermiso && (
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
            Este es el último permiso de un rol del sistema — no puede quitarse.
          </p>
        )}
        {quitarPermiso.isError && (
          <p className="mt-1 text-xs text-red-600">No se pudo quitar el permiso.</p>
        )}
      </div>

      <ConPermiso recurso="roles" accion="gestionarPermisos">
        <div>
          <h3 className="text-sm font-medium text-ink">Agregar permiso</h3>
          <div className="mt-2 flex gap-2">
            <select
              value={permisoSeleccionado}
              onChange={(e) => setPermisoSeleccionado(e.target.value)}
              className="w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink"
            >
              <option value="">Selecciona un permiso...</option>
              {permisosParaAsignar.map((permiso) => (
                <option key={permiso.id} value={permiso.id}>
                  {permiso.recurso}:{permiso.accion}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!permisoSeleccionado || asignarPermiso.isPending}
              onClick={() => {
                asignarPermiso.mutate(permisoSeleccionado, {
                  onSuccess: () => setPermisoSeleccionado(""),
                });
              }}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary-hover disabled:opacity-60"
            >
              Agregar
            </button>
          </div>
          {asignarPermiso.isError && (
            <p className="mt-1 text-xs text-red-600">No se pudo asignar el permiso.</p>
          )}
        </div>
      </ConPermiso>
    </div>
  );
}
