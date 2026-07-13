import { useNavigate, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { EvaluationForm } from "../components/EvaluationForm";
import { useContextoActivo, useCrearEvaluacion } from "../hooks/useEvaluations";

export function EvaluationCreatePage() {
  const navigate = useNavigate();
  const { riesgoId } = useParams<{ riesgoId: string }>();
  const crearEvaluacion = useCrearEvaluacion();
  const { data: contextoActivo, isLoading: isLoadingContexto } = useContextoActivo();

  const errorMessage = isAxiosError(crearEvaluacion.error)
    ? (crearEvaluacion.error.response?.data as { error?: string } | undefined)?.error ??
      "No se pudo registrar la evaluación"
    : crearEvaluacion.error
    ? "No se pudo registrar la evaluación"
    : null;

  if (!riesgoId) {
    return <p className="p-8 text-sm text-red-600">Falta el identificador del riesgo.</p>;
  }

  if (isLoadingContexto) {
    return <p className="p-8 text-sm text-slate-500">Cargando contexto activo...</p>;
  }

  if (!contextoActivo?.id) {
    return <p className="p-8 text-sm text-red-600">No hay un contexto activo disponible.</p>;
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-lg font-semibold text-slate-800">Nueva evaluación</h1>
      <p className="mt-2 text-sm text-slate-500">Registra una evaluación para este riesgo.</p>
      <div className="mt-6">
        <EvaluationForm
          riesgoId={riesgoId}
          contextoId={contextoActivo.id}
          isSubmittingRequest={crearEvaluacion.isPending}
          errorMessage={errorMessage}
          onSubmit={(values) => {
            crearEvaluacion.mutate(values, {
              onSuccess: () => navigate(`/riesgos/${riesgoId}`, { replace: true }),
            });
          }}
        />
      </div>
    </main>
  );
}
