import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { escalaFormSchema, EscalaFormValues } from "../schemas/contextSchema";
import { EscalaItem } from "../types/context.types";

export type TipoEscala = "IMPACTO" | "PROBABILIDAD";

interface Props {
  titulo: string;
  tipo: TipoEscala;
  escalasExistentes: EscalaItem[];
  onSubmit: (values: EscalaFormValues) => void;
  isSubmittingRequest: boolean;
  errorMessage?: string | null;
  disabled?: boolean;
}

// Corrección: solo se sugiere la ETIQUETA por nivel (como formato de
// referencia, ej. "Muy Bajo".."Crítico"), nunca la descripción. La
// descripción es enteramente definida por cada organización según su
// propio contexto y por eso no lleva ningún texto sugerido/precargado —
// el placeholder es un texto neutro invitando a completarla.
const SUGERENCIAS_ETIQUETA: Record<TipoEscala, string[]> = {
  IMPACTO: ["Muy Bajo", "Bajo", "Medio", "Alto", "Crítico"],
  PROBABILIDAD: ["Muy Baja", "Baja", "Media", "Alta", "Muy Alta"],
};

const PLACEHOLDER_DESCRIPCION =
  "Describe el criterio de esta organización para este nivel...";

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
  tipo,
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
  const sugerenciasEtiqueta = SUGERENCIAS_ETIQUETA[tipo];

  return (
    <div>
      <h3 className="text-sm font-semibold text-ink">{titulo}</h3>
      <form className="mt-3" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col rounded-lg border border-border bg-surface-elevated p-3 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-on-primary">
                  {field.nivel}
                </span>
                <input
                  type="text"
                  placeholder={sugerenciasEtiqueta[index] ?? "Etiqueta"}
                  disabled={disabled}
                  className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-sm font-medium text-ink placeholder:text-muted disabled:text-muted"
                  {...register(`niveles.${index}.etiqueta` as const)}
                />
              </div>
              {errors.niveles?.[index]?.etiqueta && (
                <p className="mt-1 text-xs text-red-600">{errors.niveles[index]?.etiqueta?.message}</p>
              )}
              <label className="mt-2 block text-xs font-medium text-muted">Descripción</label>
              <textarea
                rows={6}
                placeholder={PLACEHOLDER_DESCRIPCION}
                disabled={disabled}
                className="mt-1 min-h-[140px] w-full flex-1 resize-y rounded-md border border-border bg-surface px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-muted disabled:text-muted"
                {...register(`niveles.${index}.descripcion` as const)}
              />
            </div>
          ))}
        </div>

        {errorMessage && <p className="mt-3 text-sm text-red-600">{errorMessage}</p>}

        <button
          type="submit"
          disabled={disabled || isSubmitting || isSubmittingRequest}
          className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary disabled:opacity-60"
        >
          {isSubmittingRequest ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
