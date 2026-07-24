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
    return <p className="text-sm text-muted">Aún no hay evaluaciones registradas.</p>;
  }

  return (
    <ul className="space-y-3">
      {evaluaciones.map((evaluacion) => (
        <li key={evaluacion.id} className="rounded-md border border-border p-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-ink">
                {ETIQUETA_TIPO[evaluacion.tipoEvaluacion] ?? evaluacion.tipoEvaluacion}
              </span>
              <p className="font-medium text-ink">{evaluacion.resultado}</p>
            </div>
            <p className="text-xs text-muted">
              {new Date(evaluacion.fechaEvaluacion).toLocaleString()}
            </p>
          </div>
          <p className="mt-2 text-muted">
            {evaluacion.probabilidad} × {evaluacion.impacto} = {evaluacion.valorCalculado} (
            {evaluacion.nivelRiesgo})
          </p>
          <p className="mt-2 text-muted">{evaluacion.justificacion}</p>
          <p className="mt-2 text-xs text-muted">
            Evaluado por {evaluacion.usuario.nombre} ({evaluacion.usuario.email})
          </p>
          {evaluacion.resultado === "NO_ACEPTABLE" && (
            <Link
              to={`/riesgos/${evaluacion.riesgoId}/tratamientos/nuevo`}
              className="mt-2 inline-block text-xs font-medium text-ink underline"
            >
              Crear tratamiento
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
