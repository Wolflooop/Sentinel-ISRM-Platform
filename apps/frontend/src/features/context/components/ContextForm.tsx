import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  editarContextoFormSchema,
  EditarContextoFormValues,
} from "../schemas/contextSchema";
import { Contexto } from "../types/context.types";

interface Props {
  contexto?: Contexto;
  onSubmit: (values: EditarContextoFormValues) => void;
  isSubmittingRequest: boolean;
  errorMessage?: string | null;
  disabled?: boolean;
}

export function ContextForm({
  contexto,
  onSubmit,
  isSubmittingRequest,
  errorMessage,
  disabled,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditarContextoFormValues>({
    resolver: zodResolver(editarContextoFormSchema),
  });

  useEffect(() => {
    if (contexto) {
      reset({ alcance: contexto.alcance, criteriosAceptacion: contexto.criteriosAceptacion });
    }
  }, [contexto, reset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="alcance" className="block text-sm font-medium text-ink">
          Alcance
        </label>
        <textarea
          id="alcance"
          rows={3}
          disabled={disabled}
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted disabled:bg-surface disabled:text-muted"
          {...register("alcance")}
        />
        {errors.alcance && <p className="mt-1 text-sm text-red-600">{errors.alcance.message}</p>}
      </div>

      <div>
        <label htmlFor="criteriosAceptacion" className="block text-sm font-medium text-ink">
          Criterios de aceptación
        </label>
        <textarea
          id="criteriosAceptacion"
          rows={3}
          disabled={disabled}
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted disabled:bg-surface disabled:text-muted"
          {...register("criteriosAceptacion")}
        />
        {errors.criteriosAceptacion && (
          <p className="mt-1 text-sm text-red-600">{errors.criteriosAceptacion.message}</p>
        )}
      </div>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={disabled || isSubmitting || isSubmittingRequest}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary disabled:opacity-60"
      >
        {isSubmittingRequest ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
