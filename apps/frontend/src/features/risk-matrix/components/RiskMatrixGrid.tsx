import { MatrizCelda, EscalaItem, NivelRiesgo } from "../../context/types/context.types";
import { Riesgo } from "../../risks/types/risks.types";

interface RiskMatrixGridProps {
  matriz: MatrizCelda[];
  escalasProbabilidad: EscalaItem[];
  escalasImpacto: EscalaItem[];
  riesgos: Riesgo[];
}

const NIVELES_EJE = [5, 4, 3, 2, 1];

const COLOR_POR_NIVEL: Record<NivelRiesgo, string> = {
  BAJO: "bg-green-100 text-green-800 border-green-200",
  MEDIO: "bg-amber-100 text-amber-800 border-amber-200",
  ALTO: "bg-orange-100 text-orange-800 border-orange-200",
  CRITICO: "bg-red-100 text-red-800 border-red-200",
};

function etiquetaDe(escalas: EscalaItem[], nivel: number): string {
  return escalas.find((e) => e.nivel === nivel)?.etiqueta ?? `Nivel ${nivel}`;
}

export function RiskMatrixGrid({ matriz, escalasProbabilidad, escalasImpacto, riesgos }: RiskMatrixGridProps) {
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
    <div className="overflow-x-auto">
      <div className="inline-flex">
        {/* Eje Y: impacto, de mayor a menor de arriba hacia abajo */}
        <div className="mr-2 flex flex-col justify-between py-6 text-right text-xs font-medium text-slate-500">
          {NIVELES_EJE.map((nivel) => (
            <div key={nivel} className="flex h-16 w-20 items-center justify-end">
              {etiquetaDe(escalasImpacto, nivel)}
            </div>
          ))}
        </div>

        <div>
          <table className="border-collapse">
            <tbody>
              {NIVELES_EJE.map((impacto) => (
                <tr key={impacto}>
                  {[1, 2, 3, 4, 5].map((probabilidad) => {
                    const clave = `${probabilidad}-${impacto}`;
                    const nivel = nivelPorCelda.get(clave);
                    const conteo = conteoPorCelda.get(clave) ?? 0;
                    return (
                      <td key={probabilidad} className="p-1">
                        <div
                          className={`flex h-16 w-16 flex-col items-center justify-center rounded-md border text-sm font-semibold ${
                            nivel ? COLOR_POR_NIVEL[nivel] : "border-slate-200 bg-slate-50 text-slate-400"
                          }`}
                          title={nivel ? `${etiquetaDe(escalasProbabilidad, probabilidad)} × ${etiquetaDe(escalasImpacto, impacto)} → ${nivel}` : "Sin clasificar"}
                        >
                          {conteo > 0 ? conteo : ""}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}

              <tr>
                <td className="p-1" />
                {[1, 2, 3, 4, 5].map((probabilidad) => (
                  <td key={probabilidad} className="pt-2 text-center text-xs font-medium text-slate-500">
                    {etiquetaDe(escalasProbabilidad, probabilidad)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <p className="mt-1 text-center text-xs text-slate-400">Probabilidad →</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
        {(Object.keys(COLOR_POR_NIVEL) as NivelRiesgo[]).map((nivel) => (
          <span key={nivel} className="flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded-sm border ${COLOR_POR_NIVEL[nivel]}`} />
            {nivel.charAt(0) + nivel.slice(1).toLowerCase()}
          </span>
        ))}
      </div>
    </div>
  );
}
