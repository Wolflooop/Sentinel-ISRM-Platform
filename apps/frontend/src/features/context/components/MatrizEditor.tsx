import { useForm, useFieldArray } from "react-hook-form";
import {
  matrizFormSchema,
  MatrizFormValues,
  MatrizFormDraftValues,
} from "../schemas/contextSchema";
import { MatrizCelda, NivelRiesgo } from "../types/context.types";

interface Props {
  celdasExistentes: MatrizCelda[];
  onSubmit: (values: MatrizFormValues) => void;
  isSubmittingRequest: boolean;
  errorMessage?: string | null;
  disabled?: boolean;
}

const NIVELES: NivelRiesgo[] = ["BAJO", "MEDIO", "ALTO", "CRITICO"];
const TOTAL_CELDAS = 25;

// Fase B: ya no existe un valor por defecto. Una celda sin combinación
// guardada en `celdasExistentes` queda explícitamente como "" ("Sin
// definir"), en lugar de disfrazarse como si ya tuviera un nivel MEDIO real.
function valoresIniciales(celdas: MatrizCelda[]): MatrizFormDraftValues {
  const porCombo = new Map(
    celdas.map((c) => [`${c.nivelProbabilidad}-${c.nivelImpacto}`, c.nivelResultante])
  );
  const resultado: MatrizFormDraftValues["celdas"] = [];
  for (let p = 1; p <= 5; p++) {
    for (let i = 1; i <= 5; i++) {
      resultado.push({
        nivelProbabilidad: p,
        nivelImpacto: i,
        nivelResultante: porCombo.get(`${p}-${i}`) ?? "",
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

// Estilo para una celda que aún no tiene nivel asignado: debe distinguirse
// claramente de cualquier nivel real (incluido MEDIO).
const CLASE_SIN_DEFINIR = "bg-slate-100 text-slate-400 border-dashed";

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
  } = useForm<MatrizFormDraftValues>({
    defaultValues: valoresIniciales(celdasExistentes),
  });

  const { fields } = useFieldArray({ control, name: "celdas" });
  const valores = watch("celdas");

  const celdasConfiguradas = (valores ?? []).filter(
    (c) => c.nivelResultante !== ""
  ).length;
  const matrizCompleta = celdasConfiguradas === TOTAL_CELDAS;

  function manejarEnvio(values: MatrizFormDraftValues) {
    // Validación explícita contra el esquema estricto (mismo que exige el
    // backend) antes de enviar. Si hay celdas "Sin definir", el parseo
    // falla y no se llama a onSubmit — la matriz incompleta nunca se envía.
    const resultado = matrizFormSchema.safeParse(values);
    if (!resultado.success) {
      return;
    }
    onSubmit(resultado.data);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Matriz de riesgo</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            matrizCompleta
              ? "bg-green-100 text-green-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {celdasConfiguradas}/{TOTAL_CELDAS} celdas configuradas
        </span>
      </div>
      <p className="mt-1 text-xs text-muted">
        Filas: probabilidad (1-5). Columnas: impacto (1-5).
      </p>

      {!matrizCompleta && (
        <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          La matriz está incompleta. Debes asignar un nivel a las {TOTAL_CELDAS - celdasConfiguradas}{" "}
          celdas marcadas como "Sin definir" antes de poder guardarla.
        </p>
      )}

      <form className="mt-3 space-y-4" onSubmit={handleSubmit(manejarEnvio)} noValidate>
        <table className="border-collapse text-sm">
          <tbody>
            {[1, 2, 3, 4, 5].map((p) => (
              <tr key={p}>
                <td className="pr-2 text-xs font-medium text-muted">P{p}</td>
                {[1, 2, 3, 4, 5].map((i) => {
                  const index = fields.findIndex(
                    (f) => f.nivelProbabilidad === p && f.nivelImpacto === i
                  );
                  const nivelActual = valores?.[index]?.nivelResultante ?? "";
                  const sinDefinir = nivelActual === "";
                  return (
                    <td key={i} className="p-1">
                      <select
                        disabled={disabled}
                        aria-label={`Nivel resultante para probabilidad ${p}, impacto ${i}`}
                        className={`rounded-md border px-2 py-1.5 text-xs disabled:text-muted ${
                          sinDefinir
                            ? CLASE_SIN_DEFINIR
                            : `border-border ${COLOR_POR_NIVEL[nivelActual as NivelRiesgo]}`
                        }`}
                        {...register(`celdas.${index}.nivelResultante` as const)}
                      >
                        <option value="">Sin definir</option>
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
          disabled={disabled || isSubmitting || isSubmittingRequest || !matrizCompleta}
          title={!matrizCompleta ? "Completa las 25 celdas antes de guardar" : undefined}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary disabled:opacity-60"
        >
          {isSubmittingRequest ? "Guardando..." : "Guardar matriz"}
        </button>
      </form>
    </div>
  );
}