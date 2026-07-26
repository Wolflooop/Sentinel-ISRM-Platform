import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Info } from "lucide-react";
import {
  matrizFormSchema,
  MatrizFormValues,
  MatrizFormDraftValues,
} from "../schemas/contextSchema";
import { MatrizCelda, NivelRiesgo } from "../types/context.types";
import {
  RiskMatrixVisual,
  COLOR_POR_NIVEL,
  ETIQUETA_NIVEL,
} from "../../../components/RiskMatrixVisual";

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

interface CeldaSeleccionada {
  probabilidad: number;
  impacto: number;
}

export function MatrizEditor({
  celdasExistentes,
  onSubmit,
  isSubmittingRequest,
  errorMessage,
  disabled,
}: Props) {
  const {
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<MatrizFormDraftValues>({
    defaultValues: valoresIniciales(celdasExistentes),
  });

  const { fields } = useFieldArray({ control, name: "celdas" });
  const valores = watch("celdas");

  // Corrección UX: en lugar de 25 <select> visibles simultáneamente, solo
  // una celda a la vez entra en modo edición (click para abrir un panel
  // pequeño con el selector de nivel + Guardar/Cancelar).
  const [celdaEnEdicion, setCeldaEnEdicion] = useState<CeldaSeleccionada | null>(null);
  const [nivelBorrador, setNivelBorrador] = useState<NivelRiesgo | "">("");

  const celdasConfiguradas = (valores ?? []).filter((c) => c.nivelResultante !== "").length;
  const matrizCompleta = celdasConfiguradas === TOTAL_CELDAS;

  function indiceDe(probabilidad: number, impacto: number): number {
    return fields.findIndex(
      (f) => f.nivelProbabilidad === probabilidad && f.nivelImpacto === impacto
    );
  }

  function obtenerNivel(probabilidad: number, impacto: number): NivelRiesgo | null {
    const indice = indiceDe(probabilidad, impacto);
    const nivel = valores?.[indice]?.nivelResultante;
    return nivel ? (nivel as NivelRiesgo) : null;
  }

  function abrirEdicion(probabilidad: number, impacto: number) {
    if (disabled) {
      return;
    }
    setCeldaEnEdicion({ probabilidad, impacto });
    setNivelBorrador(obtenerNivel(probabilidad, impacto) ?? "");
  }

  function guardarEdicion() {
    if (!celdaEnEdicion) {
      return;
    }
    const indice = indiceDe(celdaEnEdicion.probabilidad, celdaEnEdicion.impacto);
    setValue(`celdas.${indice}.nivelResultante`, nivelBorrador, {
      shouldDirty: true,
      shouldValidate: false,
    });
    setCeldaEnEdicion(null);
  }

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
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
          }`}
        >
          {celdasConfiguradas}/{TOTAL_CELDAS} celdas configuradas
        </span>
      </div>

      <div className="mt-2 flex items-start gap-2 rounded-md border border-border bg-surface px-3 py-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-muted">
          La matriz determina el nivel de riesgo mediante la combinación:{" "}
          <span className="font-medium text-ink">Probabilidad × Impacto = Nivel de riesgo</span>.
          Haz click en una celda para asignarle un nivel.
        </p>
      </div>

      {!matrizCompleta && (
        <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400">
          La matriz está incompleta. Debes asignar un nivel a las {TOTAL_CELDAS - celdasConfiguradas}{" "}
          celdas marcadas como "Sin definir" antes de poder guardarla.
        </p>
      )}

      <form className="mt-4 space-y-4" onSubmit={handleSubmit(manejarEnvio)} noValidate>
        <RiskMatrixVisual
          obtenerNivel={obtenerNivel}
          onCeldaClick={disabled ? undefined : abrirEdicion}
          celdaResaltada={celdaEnEdicion}
          tituloProbabilidad={(nivel) => `P${nivel}`}
          tituloImpacto={(nivel) => `I${nivel}`}
          renderContenido={(_probabilidad, _impacto, nivel) => (
            <span className="text-xs font-semibold uppercase tracking-wide">
              {nivel ? ETIQUETA_NIVEL[nivel] : "Sin definir"}
            </span>
          )}
        />

        {/* Panel de edición: solo se muestra para la celda seleccionada,
            nunca 25 selects a la vez. */}
        {celdaEnEdicion && (
          <div className="rounded-lg border border-primary/40 bg-surface-elevated p-3 shadow-sm">
            <p className="text-xs font-semibold text-ink">
              Editando: Probabilidad {celdaEnEdicion.probabilidad} × Impacto {celdaEnEdicion.impacto}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <select
                aria-label={`Nivel resultante para probabilidad ${celdaEnEdicion.probabilidad}, impacto ${celdaEnEdicion.impacto}`}
                value={nivelBorrador}
                onChange={(evento) => setNivelBorrador(evento.target.value as NivelRiesgo | "")}
                className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm text-ink"
              >
                <option value="">Sin definir</option>
                {NIVELES.map((nivel) => (
                  <option key={nivel} value={nivel}>
                    {ETIQUETA_NIVEL[nivel]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={guardarEdicion}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-on-primary"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setCeldaEnEdicion(null)}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-muted">
          {(Object.keys(COLOR_POR_NIVEL) as NivelRiesgo[]).map((nivel) => (
            <span key={nivel} className="flex items-center gap-1.5">
              <span className={`h-3 w-3 rounded-sm border ${COLOR_POR_NIVEL[nivel]}`} />
              {ETIQUETA_NIVEL[nivel]}
            </span>
          ))}
        </div>

        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

        <button
          type="submit"
          disabled={disabled || isSubmitting || isSubmittingRequest || !matrizCompleta}
          title={!matrizCompleta ? "Completa las 25 celdas antes de guardar" : undefined}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary disabled:opacity-60"
        >
          {isSubmittingRequest ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
