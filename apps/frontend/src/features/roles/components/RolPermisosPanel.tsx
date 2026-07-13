import { useState } from "react";
import { RolConPermisos, Permiso } from "../types/roles.types";
import { useAsignarPermiso, useQuitarPermiso } from "../hooks/useRoles";

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
        <h3 className="text-sm font-medium text-slate-700">Permisos asignados</h3>
        <ul className="mt-2 divide-y divide-slate-100 rounded-md border border-slate-200">
          {rol.permisos.map((permiso) => (
            <li
              key={permiso.id}
              className="flex items-center justify-between px-3 py-2 text-sm"
            >
              <span className="text-slate-700">
                {permiso.recurso}:{permiso.accion}
              </span>
              <button
                type="button"
                disabled={quitarPermiso.isPending || soloUnPermiso}
                title={
                  soloUnPermiso
                    ? "Un rol del sistema no puede quedar sin permisos"
                    : undefined
                }
                onClick={() => quitarPermiso.mutate(permiso.id)}
                className="text-xs text-red-600 underline disabled:cursor-not-allowed disabled:text-slate-300 disabled:no-underline"
              >
                Quitar
              </button>
            </li>
          ))}
          {rol.permisos.length === 0 && (
            <li className="px-3 py-2 text-sm text-slate-400">Sin permisos asignados</li>
          )}
        </ul>
        {soloUnPermiso && (
          <p className="mt-1 text-xs text-amber-700">
            Este es el último permiso de un rol del sistema — no puede quitarse.
          </p>
        )}
        {quitarPermiso.isError && (
          <p className="mt-1 text-xs text-red-600">No se pudo quitar el permiso.</p>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-700">Agregar permiso</h3>
        <div className="mt-2 flex gap-2">
          <select
            value={permisoSeleccionado}
            onChange={(e) => setPermisoSeleccionado(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
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
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Agregar
          </button>
        </div>
        {asignarPermiso.isError && (
          <p className="mt-1 text-xs text-red-600">No se pudo asignar el permiso.</p>
        )}
      </div>
    </div>
  );
}
