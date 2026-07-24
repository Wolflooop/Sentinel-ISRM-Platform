import { useParams, Link } from "react-router-dom";
import { useEvaluaciones } from "../hooks/useEvaluations";
import { EvaluationHistoryList } from "../components/EvaluationHistoryList";

export function EvaluationHistoryPage() {
  const { riesgoId } = useParams<{ riesgoId: string }>();
  const { data: evaluaciones, isLoading, isError } = useEvaluaciones({ riesgoId: riesgoId ?? "" });

  if (isLoading) {
    return <p className="p-8 text-sm text-muted">Cargando evaluaciones...</p>;
  }

  if (isError) {
    return <p className="p-8 text-sm text-red-600">No se pudieron cargar las evaluaciones.</p>;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link to={`/riesgos/${riesgoId}`} className="text-sm text-muted underline">
        ← Volver al riesgo
      </Link>
      <h1 className="mt-4 text-lg font-semibold text-ink">Historial de evaluaciones</h1>
      <div className="mt-4">
        <EvaluationHistoryList evaluaciones={evaluaciones ?? []} />
      </div>
    </main>
  );
}
