import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { crearEvaluacionFormSchema, CrearEvaluacionFormValues } from "../schemas/evaluationsSchema";

interface Props {
  riesgoId: string;
  contextoId: string;
  onSubmit: (values: CrearEvaluacionFormValues) => void;
  isSubmittingRequest: boolean;
  errorMessage?: string | null;
}

const NIVELES = [1, 2, 3, 4, 5];

export function EvaluationForm({ riesgoId, contextoId, onSubmit, isSubmittingRequest, errorMessage }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CrearEvaluacionFormValues>({
    resolver: zodResolver(crearEvaluacionFormSchema),
    defaultValues: {
      riesgoId,
      contextoId,
      tipoEvaluacion: "RESIDUAL",
      resultado: "ACEPTABLE",
      justificacion: "",
      comentario: "",
    },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <input type="hidden" {...register("riesgoId")} />
      <input type="hidden" {...register("contextoId")} />

      <div>
        <label htmlFor="tipoEvaluacion" className="block text-sm font-medium text-ink">
          Tipo de evaluación
        </label>
        <select
          id="tipoEvaluacion"
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
          {...register("tipoEvaluacion")}
        >
          <option value="INHERENTE">Inherente</option>
          <option value="RESIDUAL">Residual</option>
        </select>
        {errors.tipoEvaluacion && (
          <p className="mt-1 text-sm text-red-600">{errors.tipoEvaluacion.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="probabilidad" className="block text-sm font-medium text-ink">
            Probabilidad (1–5)
          </label>
          <select
            id="probabilidad"
            defaultValue=""
            className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
            {...register("probabilidad")}
          >
            <option value="" disabled>
              Selecciona...
            </option>
            {NIVELES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {errors.probabilidad && (
            <p className="mt-1 text-sm text-red-600">{errors.probabilidad.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="impacto" className="block text-sm font-medium text-ink">
            Impacto (1–5)
          </label>
          <select
            id="impacto"
            defaultValue=""
            className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
            {...register("impacto")}
          >
            <option value="" disabled>
              Selecciona...
            </option>
            {NIVELES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {errors.impacto && <p className="mt-1 text-sm text-red-600">{errors.impacto.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="resultado" className="block text-sm font-medium text-ink">
          Resultado
        </label>
        <select
          id="resultado"
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
          {...register("resultado")}
        >
          <option value="ACEPTABLE">ACEPTABLE</option>
          <option value="NO_ACEPTABLE">NO ACEPTABLE</option>
        </select>
        {errors.resultado && <p className="mt-1 text-sm text-red-600">{errors.resultado.message}</p>}
      </div>

      <div>
        <label htmlFor="justificacion" className="block text-sm font-medium text-ink">
          Justificación
        </label>
        <textarea
          id="justificacion"
          rows={4}
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
          {...register("justificacion")}
        />
        {errors.justificacion && (
          <p className="mt-1 text-sm text-red-600">{errors.justificacion.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="comentario" className="block text-sm font-medium text-ink">
          Comentario del cambio de estado
        </label>
        <textarea
          id="comentario"
          rows={2}
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
          placeholder="Ej: Evaluación posterior al tratamiento aplicado."
          {...register("comentario")}
        />
        {errors.comentario && (
          <p className="mt-1 text-sm text-red-600">{errors.comentario.message}</p>
        )}
      </div>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={isSubmitting || isSubmittingRequest}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary disabled:opacity-60"
      >
        {isSubmittingRequest ? "Guardando..." : "Registrar evaluación"}
      </button>
    </form>
  );
}
