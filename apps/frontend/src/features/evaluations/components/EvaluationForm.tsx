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
      resultado: "ACEPTABLE",
      justificacion: "",
    },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <input type="hidden" {...register("riesgoId")} />
      <input type="hidden" {...register("contextoId")} />

      <div>
        <label htmlFor="resultado" className="block text-sm font-medium text-slate-700">
          Resultado
        </label>
        <select
          id="resultado"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          {...register("resultado")}
        >
          <option value="ACEPTABLE">ACEPTABLE</option>
          <option value="NO_ACEPTABLE">NO ACEPTABLE</option>
        </select>
        {errors.resultado && <p className="mt-1 text-sm text-red-600">{errors.resultado.message}</p>}
      </div>

      <div>
        <label htmlFor="justificacion" className="block text-sm font-medium text-slate-700">
          Justificación
        </label>
        <textarea
          id="justificacion"
          rows={4}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          {...register("justificacion")}
        />
        {errors.justificacion && (
          <p className="mt-1 text-sm text-red-600">{errors.justificacion.message}</p>
        )}
      </div>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={isSubmitting || isSubmittingRequest}
        className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSubmittingRequest ? "Guardando..." : "Registrar evaluación"}
      </button>
    </form>
  );
}
