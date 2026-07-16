import { useNavigate, useParams, Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { TreatmentForm } from "../components/TreatmentForm";
import { useCrearTratamiento } from "../hooks/useTreatments";
import { useControles } from "../../controls/hooks/useControls";
import { useUsuarios } from "../../users/hooks/useUsers";
import { TreatmentFormValues } from "../schemas/treatmentsSchema";

function normalizar(evaluacionId: string, input: TreatmentFormValues) {
  return {
    evaluacionId,
    controlPrincipalId: input.controlPrincipalId?.trim() || null,
    estrategia: input.estrategia,
    descripcionPlan: input.descripcionPlan.trim(),
    usuarioResponsableId: input.usuarioResponsableId,
    fechaLimite: input.fechaLimite,
    estado: input.estado,
    porcentajeAvance: input.porcentajeAvance,
  };
}

export function TreatmentCreatePage() {
  const navigate = useNavigate();
  const { riesgoId, evaluacionId } = useParams<{ riesgoId: string; evaluacionId: string }>();
  const crearTratamiento = useCrearTratamiento();
  const { data: controles, isLoading: isLoadingControles } = useControles({});
  const { data: usuarios, isLoading: isLoadingUsuarios } = useUsuarios();

  const errorMessage = isAxiosError(crearTratamiento.error)
    ? (crearTratamiento.error.response?.data as { error?: string } | undefined)?.error ??
      "No se pudo registrar el tratamiento"
    : crearTratamiento.error
    ? "No se pudo registrar el tratamiento"
    : null;

  if (!riesgoId || !evaluacionId) {
    return <p className="p-8 text-sm text-red-600">Falta el identificador del riesgo o la evaluación.</p>;
  }

  if (isLoadingControles || isLoadingUsuarios) {
    return <p className="p-8 text-sm text-slate-500">Cargando datos del formulario...</p>;
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <Link to={`/riesgos/${riesgoId}`} className="text-sm text-slate-500 underline">
        ← Volver al riesgo
      </Link>
      <h1 className="mt-4 text-lg font-semibold text-slate-800">Nuevo tratamiento</h1>
      <p className="mt-2 text-sm text-slate-500">
        Define el plan de tratamiento para la evaluación de este riesgo.
      </p>
      <div className="mt-6">
        <TreatmentForm
          controles={(controles ?? []).map((c) => ({ id: c.id, nombre: c.nombre }))}
          usuarios={(usuarios ?? []).map((u) => ({ id: u.id, nombre: u.nombre }))}
          isSubmittingRequest={crearTratamiento.isPending}
          errorMessage={errorMessage}
          onSubmit={(values) => {
            crearTratamiento.mutate(normalizar(evaluacionId, values), {
              onSuccess: (tratamiento) => navigate(`/tratamientos/${tratamiento.id}`, { replace: true }),
            });
          }}
        />
      </div>
    </main>
  );
}
