import { useNavigate, useParams, Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { TreatmentForm } from "../components/TreatmentForm";
import { useCrearTratamiento } from "../hooks/useTreatments";
import { useControles } from "../../controls/hooks/useControls";
import { useUsuarios } from "../../users/hooks/useUsers";
import { TreatmentFormValues } from "../schemas/treatmentsSchema";

// V2: riesgoId es la FK principal; evaluacionOrigenId (opcional) se
// conserva solo como referencia histórica de qué evaluación motivó el
// tratamiento.
function normalizar(riesgoId: string, evaluacionOrigenId: string | undefined, input: TreatmentFormValues) {
  return {
    riesgoId,
    evaluacionOrigenId: evaluacionOrigenId ?? null,
    controlIds: input.controlIds,
    controlPrincipalId: input.controlPrincipalId?.trim() || null,
    estrategia: input.estrategia,
    descripcionPlan: input.descripcionPlan.trim(),
    usuarioResponsableId: input.usuarioResponsableId,
    fechaInicio: input.fechaInicio?.trim() || null,
    justificacion: input.justificacion?.trim() || null,
    aprobadoPorId: input.aprobadoPorId?.trim() || null,
    fechaLimite: input.fechaLimite,
    estado: input.estado,
    porcentajeAvance: input.porcentajeAvance,
    comentario: input.comentario?.trim() ?? "",
  };
}

export function TreatmentCreatePage() {
  const navigate = useNavigate();
  const { riesgoId, evaluacionId } = useParams<{ riesgoId: string; evaluacionId?: string }>();
  const crearTratamiento = useCrearTratamiento();
  const { data: controles, isLoading: isLoadingControles } = useControles({});
  const { data: usuarios, isLoading: isLoadingUsuarios } = useUsuarios();

  const errorMessage = isAxiosError(crearTratamiento.error)
    ? (crearTratamiento.error.response?.data as { error?: string } | undefined)?.error ??
      "No se pudo registrar el tratamiento"
    : crearTratamiento.error
    ? "No se pudo registrar el tratamiento"
    : null;

  if (!riesgoId) {
    return <p className="p-8 text-sm text-red-600">Falta el identificador del riesgo.</p>;
  }

  if (isLoadingControles || isLoadingUsuarios) {
    return <p className="p-8 text-sm text-muted">Cargando datos del formulario...</p>;
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <Link to={`/riesgos/${riesgoId}`} className="text-sm text-muted underline">
        ← Volver al riesgo
      </Link>
      <h1 className="mt-4 text-lg font-semibold text-ink">Nuevo tratamiento</h1>
      <p className="mt-2 text-sm text-muted">Define el plan de tratamiento para este riesgo.</p>
      <div className="mt-6">
        <TreatmentForm
          controles={(controles ?? []).map((c) => ({ id: c.id, nombre: c.nombre }))}
          usuarios={(usuarios ?? []).map((u) => ({ id: u.id, nombre: u.nombre }))}
          isSubmittingRequest={crearTratamiento.isPending}
          errorMessage={errorMessage}
          onSubmit={(values) => {
            crearTratamiento.mutate(normalizar(riesgoId, evaluacionId, values), {
              onSuccess: (tratamiento) => navigate(`/tratamientos/${tratamiento.id}`, { replace: true }),
            });
          }}
        />
      </div>
    </main>
  );
}
