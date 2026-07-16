import { useNavigate, useParams, Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { TreatmentForm } from "../components/TreatmentForm";
import { useActualizarTratamiento, useTratamiento } from "../hooks/useTreatments";
import { useControles } from "../../controls/hooks/useControls";
import { useUsuarios } from "../../users/hooks/useUsers";
import { TreatmentFormValues } from "../schemas/treatmentsSchema";

function normalizar(input: TreatmentFormValues) {
  return {
    controlPrincipalId: input.controlPrincipalId?.trim() || null,
    estrategia: input.estrategia,
    descripcionPlan: input.descripcionPlan.trim(),
    usuarioResponsableId: input.usuarioResponsableId,
    fechaLimite: input.fechaLimite,
    estado: input.estado,
    porcentajeAvance: input.porcentajeAvance,
  };
}

export function TreatmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: tratamiento, isLoading, isError } = useTratamiento(id);
  const actualizarTratamiento = useActualizarTratamiento(id ?? "");
  const { data: controles, isLoading: isLoadingControles } = useControles({});
  const { data: usuarios, isLoading: isLoadingUsuarios } = useUsuarios();

  const errorMessage = isAxiosError(actualizarTratamiento.error)
    ? (actualizarTratamiento.error.response?.data as { error?: string } | undefined)?.error ??
      "No se pudieron guardar los cambios"
    : actualizarTratamiento.error
    ? "No se pudieron guardar los cambios"
    : null;

  if (isLoading || isLoadingControles || isLoadingUsuarios) {
    return <p className="p-8 text-sm text-slate-500">Cargando tratamiento...</p>;
  }

  if (isError || !tratamiento) {
    return <p className="p-8 text-sm text-red-600">No se pudo cargar el tratamiento.</p>;
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <Link to={`/riesgos/${tratamiento.evaluacion.riesgo.id}`} className="text-sm text-slate-500 underline">
        ← Volver al riesgo
      </Link>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-800">Tratamiento del riesgo</h1>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-600">
          <div>
            <dt className="font-medium text-slate-700">Riesgo residual actual</dt>
            <dd className="mt-1">{tratamiento.evaluacion.riesgo.estado}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-700">Resultado de la evaluación</dt>
            <dd className="mt-1">{tratamiento.evaluacion.resultado}</dd>
          </div>
        </dl>

        <div className="mt-6">
          <TreatmentForm
            tratamiento={tratamiento}
            controles={(controles ?? []).map((c) => ({ id: c.id, nombre: c.nombre }))}
            usuarios={(usuarios ?? []).map((u) => ({ id: u.id, nombre: u.nombre }))}
            isSubmittingRequest={actualizarTratamiento.isPending}
            errorMessage={errorMessage}
            onSubmit={(values) => {
              actualizarTratamiento.mutate(normalizar(values), {
                onSuccess: () => navigate(`/riesgos/${tratamiento.evaluacion.riesgo.id}`, { replace: true }),
              });
            }}
          />
        </div>
      </div>
    </main>
  );
}
