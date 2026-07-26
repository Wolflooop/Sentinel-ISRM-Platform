import { useNavigate, useParams, Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { TreatmentForm } from "../components/TreatmentForm";
import { useActualizarTratamiento, useTratamiento } from "../hooks/useTreatments";
import { useControles } from "../../controls/hooks/useControls";
import { useUsuarios } from "../../users/hooks/useUsers";
import { TreatmentFormValues } from "../schemas/treatmentsSchema";
import { CommentsPanel } from "../../comments/components/CommentsPanel";
import { FollowUpsPanel } from "../../follow-ups/components/FollowUpsPanel";
import { EvidencePanel } from "../../evidence/components/EvidencePanel";
import { usePerfilActual } from "../../auth/hooks/usePerfilActual";
import { puedeGestionarRegistro } from "../../../lib/permissions";

function normalizar(input: TreatmentFormValues) {
  // Relación tratamiento → control 1:1: el único control asociado (si hay
  // alguno seleccionado) es a la vez el contenido de controlIds y el
  // control principal, para el contrato existente con el backend.
  const controlAsociadoId = input.controlAsociadoId?.trim() || null;
  return {
    controlIds: controlAsociadoId ? [controlAsociadoId] : [],
    controlPrincipalId: controlAsociadoId,
    estrategia: input.estrategia,
    descripcionPlan: input.descripcionPlan.trim(),
    usuarioResponsableId: input.usuarioResponsableId,
    fechaInicio: input.fechaInicio?.trim() || null,
    justificacion: input.justificacion?.trim() || null,
    aprobadoPorId: input.aprobadoPorId?.trim() || null,
    fechaLimite: input.fechaLimite,
    estado: input.estado,
    porcentajeAvance: input.porcentajeAvance,
    ...(input.comentario?.trim() ? { comentario: input.comentario.trim() } : {}),
  };
}

export function TreatmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: tratamiento, isLoading, isError } = useTratamiento(id);
  const actualizarTratamiento = useActualizarTratamiento(id ?? "");
  const { data: controles, isLoading: isLoadingControles } = useControles({});
  const { data: usuarios, isLoading: isLoadingUsuarios } = useUsuarios();
  const { data: perfil } = usePerfilActual();

  const errorMessage = isAxiosError(actualizarTratamiento.error)
    ? (actualizarTratamiento.error.response?.data as { error?: string } | undefined)?.error ??
      "No se pudieron guardar los cambios"
    : actualizarTratamiento.error
    ? "No se pudieron guardar los cambios"
    : null;

  if (isLoading || isLoadingControles || isLoadingUsuarios) {
    return <p className="p-8 text-sm text-muted">Cargando tratamiento...</p>;
  }

  if (isError || !tratamiento || !id) {
    return <p className="p-8 text-sm text-red-600">No se pudo cargar el tratamiento.</p>;
  }

  // Fase 3B: mismo criterio de ownership que en el detalle de riesgo —
  // solo el responsable actual del tratamiento o Administrador TIC pueden
  // editarlo; cualquier otro usuario de la organización solo lo consulta.
  const puedeGestionar = puedeGestionarRegistro(perfil?.usuario, tratamiento.usuarioResponsableId);

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <Link to={`/riesgos/${tratamiento.riesgo.id}`} className="text-sm text-muted underline">
        ← Volver al riesgo
      </Link>

      <div className="mt-4 rounded-lg border border-border bg-surface-elevated p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-ink">Tratamiento del riesgo</h1>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm text-muted">
          <div>
            <dt className="font-medium text-ink">Estado actual del riesgo</dt>
            <dd className="mt-1">{tratamiento.riesgo.estado}</dd>
          </div>
          {tratamiento.evaluacionOrigen && (
            <div>
              <dt className="font-medium text-ink">Evaluación de origen</dt>
              <dd className="mt-1">{tratamiento.evaluacionOrigen.resultado}</dd>
            </div>
          )}
        </dl>

        {puedeGestionar ? (
          <div className="mt-6">
            <TreatmentForm
              tratamiento={tratamiento}
              controles={(controles ?? []).map((c) => ({ id: c.id, nombre: c.nombre }))}
              usuarios={(usuarios ?? []).map((u) => ({ id: u.id, nombre: u.nombre }))}
              isSubmittingRequest={actualizarTratamiento.isPending}
              errorMessage={errorMessage}
              onSubmit={(values) => {
                actualizarTratamiento.mutate(normalizar(values), {
                  onSuccess: () => navigate(`/riesgos/${tratamiento.riesgo.id}`, { replace: true }),
                });
              }}
            />
          </div>
        ) : (
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm text-muted">
            <div>
              <dt className="font-medium text-ink">Responsable</dt>
              <dd className="mt-1">{tratamiento.usuarioResponsable.nombre}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Estrategia</dt>
              <dd className="mt-1">{tratamiento.estrategia}</dd>
            </div>
            <div className="col-span-2">
              <dt className="font-medium text-ink">Plan</dt>
              <dd className="mt-1 whitespace-pre-line">{tratamiento.descripcionPlan}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Estado</dt>
              <dd className="mt-1">{tratamiento.estado}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Avance</dt>
              <dd className="mt-1">{tratamiento.porcentajeAvance}%</dd>
            </div>
          </dl>
        )}
      </div>

      <div className="mt-8 grid gap-6">
        <CommentsPanel destino={{ tratamientoId: id }} />
        <FollowUpsPanel destino={{ tratamientoId: id }} puedeGestionar={puedeGestionar} />
        <EvidencePanel destino={{ tratamientoId: id }} puedeGestionar={puedeGestionar} />
      </div>
    </main>
  );
}
