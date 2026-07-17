import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editarRolFormSchema, EditarRolFormValues } from "../schemas/rolesSchema";
import {
  useRolConPermisos,
  usePermisosDisponibles,
  useActualizarRol,
} from "../hooks/useRoles";
import { RolPermisosPanel } from "../components/RolPermisosPanel";
import { ConPermiso } from "../../../components/ConPermiso";

export function RolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: rol, isLoading, isError } = useRolConPermisos(id);
  const { data: permisosDisponibles } = usePermisosDisponibles();
  const actualizarRol = useActualizarRol(id ?? "");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditarRolFormValues>({
    resolver: zodResolver(editarRolFormSchema),
  });

  useEffect(() => {
    if (rol) {
      reset({ nombre: rol.nombre, descripcion: rol.descripcion ?? "" });
    }
  }, [rol, reset]);

  if (isLoading) {
    return <p className="p-8 text-sm text-muted">Cargando rol...</p>;
  }

  if (isError || !rol) {
    return <p className="p-8 text-sm text-red-600">No se pudo cargar el rol.</p>;
  }

  const onSubmit = (values: EditarRolFormValues) => {
    actualizarRol.mutate(values);
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-lg font-semibold text-ink">{rol.nombre}</h1>
      {rol.esSistema && (
        <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
          Este es un rol protegido del sistema: no se puede eliminar ni renombrar.
        </p>
      )}

      <ConPermiso recurso="roles" accion="actualizar">
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-ink">
              Nombre
            </label>
            <input
              id="nombre"
              type="text"
              disabled={rol.esSistema}
              className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink disabled:bg-surface disabled:text-muted"
              {...register("nombre")}
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-ink">
              Descripción
            </label>
            <textarea
              id="descripcion"
              rows={2}
              className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink"
              {...register("descripcion")}
            />
          </div>

          {actualizarRol.isError && (
            <p className="text-sm text-red-600">No se pudieron guardar los cambios.</p>
          )}
          {actualizarRol.isSuccess && (
            <p className="text-sm text-green-700 dark:text-green-400">Cambios guardados.</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || actualizarRol.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary-hover disabled:opacity-60"
          >
            {actualizarRol.isPending ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </ConPermiso>

      <hr className="my-8 border-border" />

      <RolPermisosPanel rol={rol} permisosDisponibles={permisosDisponibles ?? []} />
    </main>
  );
}
