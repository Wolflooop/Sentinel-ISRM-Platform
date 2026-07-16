import { Link } from "react-router-dom";
import { Evaluacion } from "../types/evaluations.types";
import { useTratamientoPorEvaluacion } from "../../treatments/hooks/useTreatments";

interface ItemProps {
  evaluacion: Evaluacion;
}

/**
 * Un tratamiento solo tiene sentido para una evaluación NO_ACEPTABLE (el
 * backend además impide más de un tratamiento por evaluación — 409). Este
 * subcomponente resuelve, por evaluación, si ya existe un tratamiento para
 * enlazar a su detalle, o si falta crear uno.
 */
function TratamientoDeEvaluacion({ evaluacion }: ItemProps) {
  const esNoAceptable = evaluacion.resultado === "NO_ACEPTABLE";
  const { data: tratamiento, isLoading } = useTratamientoPorEvaluacion(
    esNoAceptable ? evaluacion.id : undefined
  );

  if (!esNoAceptable) {
    return null;
  }

  if (isLoading) {
    return <p className="mt-2 text-xs text-slate-400">Consultando tratamiento...</p>;
  }

  if (tratamiento) {
    return (
      <Link
        to={`/tratamientos/${tratamiento.id}`}
        className="mt-2 inline-block text-xs font-medium text-slate-700 underline"
      >
        Ver tratamiento ({tratamiento.estado})
      </Link>
    );
  }

  return (
    <Link
      to={`/riesgos/${evaluacion.riesgoId}/evaluaciones/${evaluacion.id}/tratamiento/nuevo`}
      className="mt-2 inline-block text-xs font-medium text-slate-700 underline"
    >
      Crear tratamiento
    </Link>
  );
}

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
          <TratamientoDeEvaluacion evaluacion={evaluacion} />
        </li>
      ))}
    </ul>
  );
}
