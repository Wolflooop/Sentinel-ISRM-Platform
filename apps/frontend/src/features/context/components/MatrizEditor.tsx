import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { matrizFormSchema, MatrizFormValues } from "../schemas/contextSchema";
import { MatrizCelda, NivelRiesgo } from "../types/context.types";

interface Props {
  celdasExistentes: MatrizCelda[];
  onSubmit: (values: MatrizFormValues) => void;
  isSubmittingRequest: boolean;
  errorMessage?: string | null;
  disabled?: boolean;
}

const NIVELES: NivelRiesgo[] = ["BAJO", "MEDIO", "ALTO", "CRITICO"];

function valoresIniciales(celdas: MatrizCelda[]): MatrizFormValues {
  const porCombo = new Map(
    celdas.map((c) => [`${c.nivelProbabilidad}-${c.nivelImpacto}`, c.nivelResultante])
  );
  const resultado: MatrizFormValues["celdas"] = [];
  for (let p = 1; p <= 5; p++) {
    for (let i = 1; i <= 5; i++) {
      resultado.push({
        nivelProbabilidad: p,
        nivelImpacto: i,
        nivelResultante: porCombo.get(`${p}-${i}`) ?? "MEDIO",
      });
    }
  }
  return { celdas: resultado };
}

const COLOR_POR_NIVEL: Record<NivelRiesgo, string> = {
  BAJO: "bg-green-50",
  MEDIO: "bg-amber-50",
  ALTO: "bg-orange-50",
  CRITICO: "bg-red-50",
};

export function MatrizEditor({
  celdasExistentes,
  onSubmit,
  isSubmittingRequest,
  errorMessage,
  disabled,
}: Props) {
  const {
    control,
    register,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<MatrizFormValues>({
    resolver: zodResolver(matrizFormSchema),
    defaultValues: valoresIniciales(celdasExistentes),
  });

  const { fields } = useFieldArray({ control, name: "celdas" });
  const valores = watch("celdas");

  return (
    <div>
      <h3 className="text-sm font-semibold text-ink">Matriz de riesgo</h3>
      <p className="mt-1 text-xs text-muted">
        Filas: probabilidad (1-5). Columnas: impacto (1-5).
      </p>
      <form className="mt-3 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <table className="border-collapse text-sm">
          <tbody>
            {[1, 2, 3, 4, 5].map((p) => (
              <tr key={p}>
                <td className="pr-2 text-xs font-medium text-muted">P{p}</td>
                {[1, 2, 3, 4, 5].map((i) => {
                  const index = fields.findIndex(
                    (f) => f.nivelProbabilidad === p && f.nivelImpacto === i
                  );
                  const nivelActual = valores?.[index]?.nivelResultante ?? "MEDIO";
                  return (
                    <td key={i} className="p-1">
                      <select
                        disabled={disabled}
                        className={`rounded-md border border-border px-2 py-1.5 text-xs disabled:text-muted ${COLOR_POR_NIVEL[nivelActual]}`}
                        {...register(`celdas.${index}.nivelResultante` as const)}
                      >
                        {NIVELES.map((nivel) => (
                          <option key={nivel} value={nivel}>
                            {nivel}
                          </option>
                        ))}
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

        <button
          type="submit"
          disabled={disabled || isSubmitting || isSubmittingRequest}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary disabled:opacity-60"
        >
          {isSubmittingRequest ? "Guardando..." : "Guardar matriz"}
        </button>
      </form>
    </div>
  );
}
