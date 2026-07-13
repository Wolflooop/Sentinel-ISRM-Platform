import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { amenazaFormSchema, AmenazaFormValues } from "../schemas/threatsSchema";
import { Amenaza } from "../types/threats.types";
import { useCategoriasAmenaza } from "../hooks/useThreats";

interface Props {
  amenaza?: Amenaza;
  onSubmit: (values: AmenazaFormValues) => void;
  isSubmittingRequest: boolean;
  errorMessage?: string | null;
}

export function ThreatForm({ amenaza, onSubmit, isSubmittingRequest, errorMessage }: Props) {
  const { data: categorias } = useCategoriasAmenaza();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AmenazaFormValues>({
    resolver: zodResolver(amenazaFormSchema),
  });

  useEffect(() => {
    if (amenaza) {
      reset({
        categoriaId: amenaza.categoria.id,
        nombre: amenaza.nombre,
        descripcion: amenaza.descripcion ?? "",
        origen: amenaza.origen,
      });
    }
  }, [amenaza, reset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-slate-700">
          Nombre
        </label>
        <input
          id="nombre"
          type="text"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          {...register("nombre")}
        />
        {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>}
      </div>

      <div>
        <label htmlFor="categoriaId" className="block text-sm font-medium text-slate-700">
          Categoría
        </label>
        <select
          id="categoriaId"
          defaultValue=""
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
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
        <label htmlFor="origen" className="block text-sm font-medium text-slate-700">
          Origen
        </label>
        <select
          id="origen"
          defaultValue=""
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          {...register("origen")}
        >
          <option value="" disabled>
            Selecciona un origen...
          </option>
          <option value="INTERNO">Interno</option>
          <option value="EXTERNO">Externo</option>
        </select>
        {errors.origen && <p className="mt-1 text-sm text-red-600">{errors.origen.message}</p>}
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

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={isSubmitting || isSubmittingRequest}
        className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSubmittingRequest ? "Guardando..." : "Guardar amenaza"}
      </button>
    </form>
  );
}
