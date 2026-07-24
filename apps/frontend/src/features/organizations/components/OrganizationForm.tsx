import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  actualizarOrganizacionFormSchema,
  ActualizarOrganizacionFormValues,
} from "../schemas/organizationsSchema";
import { Organizacion } from "../types/organizations.types";

interface Props {
  organizacion: Organizacion;
  onSubmit: (values: ActualizarOrganizacionFormValues) => void;
  isSubmittingRequest: boolean;
  errorMessage?: string | null;
}

export function OrganizationForm({
  organizacion,
  onSubmit,
  isSubmittingRequest,
  errorMessage,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ActualizarOrganizacionFormValues>({
    resolver: zodResolver(actualizarOrganizacionFormSchema),
  });

  useEffect(() => {
    reset({
      nombre: organizacion.nombre,
      sector: organizacion.sector,
      tamano: organizacion.tamano,
      paisIso: organizacion.paisIso,
      correoContacto: organizacion.correoContacto ?? "",
      telefono: organizacion.telefono ?? "",
      direccion: organizacion.direccion ?? "",
    });
  }, [organizacion, reset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-ink">
          Nombre de la organización
        </label>
        <input
          id="nombre"
          type="text"
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
          {...register("nombre")}
        />
        {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="sector" className="block text-sm font-medium text-ink">
            Sector
          </label>
          <select
            id="sector"
            className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
            {...register("sector")}
          >
            <option value="PUBLICO">Público</option>
            <option value="PRIVADO">Privado</option>
          </select>
          {errors.sector && <p className="mt-1 text-sm text-red-600">{errors.sector.message}</p>}
        </div>

        <div>
          <label htmlFor="tamano" className="block text-sm font-medium text-ink">
            Tamaño
          </label>
          <select
            id="tamano"
            className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
            {...register("tamano")}
          >
            <option value="MICRO">Micro</option>
            <option value="PEQUENA">Pequeña</option>
            <option value="MEDIANA">Mediana</option>
            <option value="GRANDE">Grande</option>
          </select>
          {errors.tamano && <p className="mt-1 text-sm text-red-600">{errors.tamano.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="paisIso" className="block text-sm font-medium text-ink">
          País (código ISO de 2 letras)
        </label>
        <input
          id="paisIso"
          type="text"
          maxLength={2}
          className="mt-1 w-24 rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm uppercase text-ink placeholder:text-muted"
          {...register("paisIso")}
        />
        {errors.paisIso && <p className="mt-1 text-sm text-red-600">{errors.paisIso.message}</p>}
      </div>

      <div>
        <label htmlFor="correoContacto" className="block text-sm font-medium text-ink">
          Correo de contacto
        </label>
        <input
          id="correoContacto"
          type="email"
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
          {...register("correoContacto")}
        />
        {errors.correoContacto && (
          <p className="mt-1 text-sm text-red-600">{errors.correoContacto.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="telefono" className="block text-sm font-medium text-ink">
          Teléfono
        </label>
        <input
          id="telefono"
          type="text"
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
          {...register("telefono")}
        />
      </div>

      <div>
        <label htmlFor="direccion" className="block text-sm font-medium text-ink">
          Dirección
        </label>
        <input
          id="direccion"
          type="text"
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
          {...register("direccion")}
        />
      </div>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={isSubmitting || isSubmittingRequest}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary disabled:opacity-60"
      >
        {isSubmittingRequest ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
