import { Evaluacion } from "../types/evaluations.types";

interface Props {
  evaluaciones: Evaluacion[];
}

export function EvaluationHistoryList({ evaluaciones }: Props) {
  if (evaluaciones.length === 0) {
    return <p className="text-sm text-slate-500">Aún no hay evaluaciones registradas.</p>;
  }

  return (
    <ul className="space-y-3">
      {evaluaciones.map((evaluacion) => (
        <li key={evaluacion.id} className="rounded-md border border-slate-200 p-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-slate-800">{evaluacion.resultado}</p>
            <p className="text-xs text-slate-500">
              {new Date(evaluacion.fechaEvaluacion).toLocaleString()}
            </p>
          </div>
          <p className="mt-2 text-slate-600">{evaluacion.justificacion}</p>
          <p className="mt-2 text-xs text-slate-500">
            Evaluado por {evaluacion.usuario.nombre} ({evaluacion.usuario.email})
          </p>
        </li>
      ))}
    </ul>
  );
}
