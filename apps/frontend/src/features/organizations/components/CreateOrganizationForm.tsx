import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  crearOrganizacionFormSchema,
  CrearOrganizacionFormValues,
} from "../schemas/organizationsSchema";

interface Props {
  onSubmit: (values: CrearOrganizacionFormValues) => void;
  isSubmittingRequest: boolean;
  errorMessage?: string | null;
}

export function CreateOrganizationForm({ onSubmit, isSubmittingRequest, errorMessage }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CrearOrganizacionFormValues>({
    resolver: zodResolver(crearOrganizacionFormSchema),
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-ink">
          Nombre
        </label>
        <input
          id="nombre"
          type="text"
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink"
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
            className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink"
            defaultValue=""
            {...register("sector")}
          >
            <option value="" disabled>
              Selecciona...
            </option>
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
            className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink"
            defaultValue=""
            {...register("tamano")}
          >
            <option value="" disabled>
              Selecciona...
            </option>
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
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm uppercase text-ink"
          {...register("paisIso")}
        />
        {errors.paisIso && <p className="mt-1 text-sm text-red-600">{errors.paisIso.message}</p>}
      </div>

      <div>
        <label htmlFor="correoContacto" className="block text-sm font-medium text-ink">
          Correo de contacto (opcional)
        </label>
        <input
          id="correoContacto"
          type="email"
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink"
          {...register("correoContacto")}
        />
        {errors.correoContacto && (
          <p className="mt-1 text-sm text-red-600">{errors.correoContacto.message}</p>
        )}
      </div>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={isSubmitting || isSubmittingRequest}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary disabled:opacity-60"
      >
        {isSubmittingRequest ? "Creando..." : "Crear organización"}
      </button>
    </form>
  );
}
