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
    return <p className="p-8 text-sm text-slate-500">Cargando rol...</p>;
  }

  if (isError || !rol) {
    return <p className="p-8 text-sm text-red-600">No se pudo cargar el rol.</p>;
  }

  const onSubmit = (values: EditarRolFormValues) => {
    actualizarRol.mutate(values);
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-lg font-semibold text-slate-800">{rol.nombre}</h1>
      {rol.esSistema && (
        <p className="mt-1 text-xs text-amber-700">
          Este es un rol protegido del sistema: no se puede eliminar ni renombrar.
        </p>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-slate-700">
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            disabled={rol.esSistema}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-400"
            {...register("nombre")}
          />
          {errors.nombre && (
            <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-slate-700">
            Descripción
          </label>
          <textarea
            id="descripcion"
            rows={2}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            {...register("descripcion")}
          />
        </div>

        {actualizarRol.isError && (
          <p className="text-sm text-red-600">No se pudieron guardar los cambios.</p>
        )}
        {actualizarRol.isSuccess && (
          <p className="text-sm text-green-700">Cambios guardados.</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || actualizarRol.isPending}
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {actualizarRol.isPending ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>

      <hr className="my-8 border-slate-200" />

      <RolPermisosPanel rol={rol} permisosDisponibles={permisosDisponibles ?? []} />
    </main>
  );
}
