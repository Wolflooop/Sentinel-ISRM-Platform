import { useParams } from "react-router-dom";
import { useEvaluaciones } from "../hooks/useEvaluations";
import { EvaluationHistoryList } from "../components/EvaluationHistoryList";

export function EvaluationHistoryPage() {
  const { riesgoId } = useParams<{ riesgoId: string }>();
  const { data: evaluaciones, isLoading, isError } = useEvaluaciones({ riesgoId: riesgoId ?? "" });

  if (isLoading) {
    return <p className="p-8 text-sm text-slate-500">Cargando evaluaciones...</p>;
  }

  if (isError) {
    return <p className="p-8 text-sm text-red-600">No se pudieron cargar las evaluaciones.</p>;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-lg font-semibold text-slate-800">Historial de evaluaciones</h1>
      <div className="mt-4">
        <EvaluationHistoryList evaluaciones={evaluaciones ?? []} />
      </div>
    </main>
  );
}
