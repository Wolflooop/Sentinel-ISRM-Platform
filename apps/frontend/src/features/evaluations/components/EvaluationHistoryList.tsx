import { Link } from "react-router-dom";
import { Evaluacion } from "../types/evaluations.types";

interface Props {
  evaluaciones: Evaluacion[];
}

const ETIQUETA_TIPO: Record<string, string> = {
  INHERENTE: "Inherente",
  RESIDUAL: "Residual",
};

export function EvaluationHistoryList({ evaluaciones }: Props) {
  if (evaluaciones.length === 0) {
    return <p className="text-sm text-slate-500">Aún no hay evaluaciones registradas.</p>;
  }

  return (
    <ul className="space-y-3">
      {evaluaciones.map((evaluacion) => (
        <li key={evaluacion.id} className="rounded-md border border-slate-200 p-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                {ETIQUETA_TIPO[evaluacion.tipoEvaluacion] ?? evaluacion.tipoEvaluacion}
              </span>
              <p className="font-medium text-slate-800">{evaluacion.resultado}</p>
            </div>
            <p className="text-xs text-slate-500">
              {new Date(evaluacion.fechaEvaluacion).toLocaleString()}
            </p>
          </div>
          <p className="mt-2 text-slate-600">
            {evaluacion.probabilidad} × {evaluacion.impacto} = {evaluacion.valorCalculado} (
            {evaluacion.nivelRiesgo})
          </p>
          <p className="mt-2 text-slate-600">{evaluacion.justificacion}</p>
          <p className="mt-2 text-xs text-slate-500">
            Evaluado por {evaluacion.usuario.nombre} ({evaluacion.usuario.email})
          </p>
          {evaluacion.resultado === "NO_ACEPTABLE" && (
            <Link
              to={`/riesgos/${evaluacion.riesgoId}/tratamientos/nuevo`}
              className="mt-2 inline-block text-xs font-medium text-slate-700 underline"
            >
              Crear tratamiento
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
