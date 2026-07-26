import { Info } from "lucide-react";
import { MatrizCelda, EscalaItem, NivelRiesgo } from "../../context/types/context.types";
import { Riesgo } from "../../risks/types/risks.types";
import {
  RiskMatrixVisual,
  COLOR_POR_NIVEL,
  ETIQUETA_NIVEL,
} from "../../../components/RiskMatrixVisual";

interface RiskMatrixGridProps {
  matriz: MatrizCelda[];
  escalasProbabilidad: EscalaItem[];
  escalasImpacto: EscalaItem[];
  riesgos: Riesgo[];
}

function etiquetaDe(escalas: EscalaItem[], nivel: number): string {
  return escalas.find((e) => e.nivel === nivel)?.etiqueta ?? `Nivel ${nivel}`;
}

export function RiskMatrixGrid({ matriz, escalasProbabilidad, escalasImpacto, riesgos }: RiskMatrixGridProps) {
  // Clave de la celda: siempre "probabilidad-impacto", igual que en el
  // backend (MatrizRiesgo.nivelProbabilidad / nivelImpacto) y en
  // MatrizEditor.tsx. La visualización no reordena ni reinterpreta estos
  // datos: solo los dibuja usando la presentación compartida
  // RiskMatrixVisual (misma que el editor de Contexto ISO).
  const nivelPorCelda = new Map<string, NivelRiesgo>(
    matriz.map((celda) => [`${celda.nivelProbabilidad}-${celda.nivelImpacto}`, celda.nivelResultante])
  );

  const conteoPorCelda = new Map<string, number>();
  for (const riesgo of riesgos) {
    // V2: probabilidad/impacto ya no viven en Riesgo — vienen de la
    // Evaluacion vigente (evaluacionActual). Un riesgo sin evaluación aún
    // (por ejemplo, si la organización no tenía Contexto activo al
    // crearlo) simplemente no se ubica en la matriz.
    if (!riesgo.evaluacionActual) {
      continue;
    }
    const clave = `${riesgo.evaluacionActual.probabilidad}-${riesgo.evaluacionActual.impacto}`;
    conteoPorCelda.set(clave, (conteoPorCelda.get(clave) ?? 0) + 1);
  }

  return (
    <div>
      <RiskMatrixVisual
        obtenerNivel={(probabilidad, impacto) => nivelPorCelda.get(`${probabilidad}-${impacto}`) ?? null}
        tituloProbabilidad={(nivel) => etiquetaDe(escalasProbabilidad, nivel)}
        tituloImpacto={(nivel) => etiquetaDe(escalasImpacto, nivel)}
        renderContenido={(probabilidad, impacto, nivel) => {
          const conteo = conteoPorCelda.get(`${probabilidad}-${impacto}`) ?? 0;
          return (
            <>
              <span className="text-xs font-bold uppercase tracking-wide">
                {nivel ? ETIQUETA_NIVEL[nivel] : ""}
              </span>
              {conteo > 0 && <span className="text-lg font-bold leading-none">{conteo}</span>}
            </>
          );
        }}
      />

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted">
        {(Object.keys(COLOR_POR_NIVEL) as NivelRiesgo[]).map((nivel) => (
          <span key={nivel} className="flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded-sm border ${COLOR_POR_NIVEL[nivel]}`} />
            {ETIQUETA_NIVEL[nivel]}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-md border border-border bg-surface px-3 py-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-muted">
          La matriz determina el nivel de riesgo mediante la combinación:{" "}
          <span className="font-medium text-ink">Probabilidad × Impacto = Nivel de riesgo</span>.
          El número dentro de cada celda indica cuántos riesgos registrados caen en esa combinación.
        </p>
      </div>
    </div>
  );
}
