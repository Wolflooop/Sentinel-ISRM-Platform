import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { escalaFormSchema, EscalaFormValues } from "../schemas/contextSchema";
import { EscalaItem } from "../types/context.types";

interface Props {
  titulo: string;
  escalasExistentes: EscalaItem[];
  onSubmit: (values: EscalaFormValues) => void;
  isSubmittingRequest: boolean;
  errorMessage?: string | null;
  disabled?: boolean;
}

function valoresIniciales(escalas: EscalaItem[]): EscalaFormValues {
  const porNivel = new Map(escalas.map((e) => [e.nivel, e]));
  return {
    niveles: [1, 2, 3, 4, 5].map((nivel) => ({
      nivel,
      etiqueta: porNivel.get(nivel)?.etiqueta ?? "",
      descripcion: porNivel.get(nivel)?.descripcion ?? "",
    })),
  };
}

export function EscalaEditor({
  titulo,
  escalasExistentes,
  onSubmit,
  isSubmittingRequest,
  errorMessage,
  disabled,
}: Props) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EscalaFormValues>({
    resolver: zodResolver(escalaFormSchema),
    defaultValues: valoresIniciales(escalasExistentes),
  });

  const { fields } = useFieldArray({ control, name: "niveles" });

  return (
    <div>
      <h3 className="text-sm font-semibold text-ink">{titulo}</h3>
      <form className="mt-3 space-y-3" onSubmit={handleSubmit(onSubmit)} noValidate>
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-3">
            <span className="mt-2 w-6 shrink-0 text-sm font-medium text-muted">
              {field.nivel}
            </span>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Etiqueta"
                disabled={disabled}
                className="w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted disabled:bg-surface disabled:text-muted"
                {...register(`niveles.${index}.etiqueta` as const)}
              />
              {errors.niveles?.[index]?.etiqueta && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.niveles[index]?.etiqueta?.message}
                </p>
              )}
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Descripción (opcional)"
                disabled={disabled}
                className="w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted disabled:bg-surface disabled:text-muted"
                {...register(`niveles.${index}.descripcion` as const)}
              />
            </div>
          </div>
        ))}

        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

        <button
          type="submit"
          disabled={disabled || isSubmitting || isSubmittingRequest}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary disabled:opacity-60"
        >
          {isSubmittingRequest ? "Guardando..." : `Guardar ${titulo.toLowerCase()}`}
        </button>
      </form>
    </div>
  );
}
