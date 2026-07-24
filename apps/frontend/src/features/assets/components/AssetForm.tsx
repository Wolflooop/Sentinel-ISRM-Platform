import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { activoFormSchema, ActivoFormValues } from "../schemas/assetsSchema";
import { Activo } from "../types/assets.types";
import { useCategoriasActivo } from "../hooks/useAssets";
import { useUsuarios } from "../../users/hooks/useUsers";

interface Props {
  activo?: Activo;
  onSubmit: (values: ActivoFormValues) => void;
  isSubmittingRequest: boolean;
  errorMessage?: string | null;
}

export function AssetForm({ activo, onSubmit, isSubmittingRequest, errorMessage }: Props) {
  const { data: categorias } = useCategoriasActivo();
  const { data: usuarios } = useUsuarios();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ActivoFormValues>({
    resolver: zodResolver(activoFormSchema),
  });

  useEffect(() => {
    if (activo) {
      reset({
        categoriaId: activo.categoria.id,
        nombre: activo.nombre,
        descripcion: activo.descripcion ?? "",
        usuarioResponsableId: activo.usuarioResponsable.id,
        ubicacion: activo.ubicacion ?? "",
        criticidad: activo.criticidad,
        valorEconomicoEstimado: activo.valorEconomicoEstimado
          ? Number(activo.valorEconomicoEstimado)
          : undefined,
      });
    }
  }, [activo, reset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-ink">
          Nombre
        </label>
        <input
          id="nombre"
          type="text"
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
          {...register("nombre")}
        />
        {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>}
      </div>

      <div>
        <label htmlFor="categoriaId" className="block text-sm font-medium text-ink">
          Tipo (categoría)
        </label>
        <select
          id="categoriaId"
          defaultValue=""
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
          {...register("categoriaId")}
        >
          <option value="" disabled>
            Selecciona una categoría...
          </option>
          {categorias?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        {errors.categoriaId && (
          <p className="mt-1 text-sm text-red-600">{errors.categoriaId.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="usuarioResponsableId" className="block text-sm font-medium text-ink">
          Propietario / Responsable
        </label>
        <select
          id="usuarioResponsableId"
          defaultValue=""
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
          {...register("usuarioResponsableId")}
        >
          <option value="" disabled>
            Selecciona un responsable...
          </option>
          {usuarios?.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre}
            </option>
          ))}
        </select>
        {errors.usuarioResponsableId && (
          <p className="mt-1 text-sm text-red-600">{errors.usuarioResponsableId.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="ubicacion" className="block text-sm font-medium text-ink">
          Ubicación
        </label>
        <input
          id="ubicacion"
          type="text"
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
          {...register("ubicacion")}
        />
      </div>

      <div>
        <label htmlFor="criticidad" className="block text-sm font-medium text-ink">
          Criticidad (1 a 5)
        </label>
        <input
          id="criticidad"
          type="number"
          min={1}
          max={5}
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
          {...register("criticidad", { valueAsNumber: true })}
        />
        {errors.criticidad && (
          <p className="mt-1 text-sm text-red-600">{errors.criticidad.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-ink">
          Descripción
        </label>
        <textarea
          id="descripcion"
          rows={2}
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
          {...register("descripcion")}
        />
      </div>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={isSubmitting || isSubmittingRequest}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary disabled:opacity-60"
      >
        {isSubmittingRequest ? "Guardando..." : "Guardar activo"}
      </button>
    </form>
  );
}
