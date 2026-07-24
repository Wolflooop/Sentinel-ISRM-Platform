import { useParams, Link } from "react-router-dom";
import { useRiesgo, useHistorialRiesgo } from "../hooks/useRisks";
import { AssignResponsibleForm } from "../components/AssignResponsibleForm";
import { ResolutionPanel } from "../../risk-resolutions/components/ResolutionPanel";
import { CommentsPanel } from "../../comments/components/CommentsPanel";
import { FollowUpsPanel } from "../../follow-ups/components/FollowUpsPanel";
import { EvidencePanel } from "../../evidence/components/EvidencePanel";
import { Timeline } from "../../../components/Timeline";
import { usePerfilActual } from "../../auth/hooks/usePerfilActual";
import { puedeGestionarRegistro, puedeReasignarRegistro } from "../../../lib/permissions";

const ESTILO_NIVEL: Record<string, string> = {
  BAJO: "bg-green-100 text-green-800",
  MEDIO: "bg-yellow-100 text-yellow-800",
  ALTO: "bg-orange-100 text-orange-800",
  CRITICO: "bg-red-100 text-red-800",
};

const ETIQUETA_ESTADO_RIESGO: Record<string, string> = {
  IDENTIFICADO: "Identificado",
  EN_ANALISIS: "En análisis",
  EVALUADO: "Evaluado",
  TRATADO: "En tratamiento",
  CERRADO: "Cerrado",
  MONITOREADO: "Monitoreado",
  ACEPTADO: "Aceptado",
  REABIERTO: "Reabierto",
};

export function RiskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: riesgo, isLoading, isError } = useRiesgo(id);
  const { data: historial } = useHistorialRiesgo(id);
  const { data: perfil } = usePerfilActual();

  if (isLoading) {
    return <p className="p-8 text-sm text-muted">Cargando riesgo...</p>;
  }

  if (isError || !riesgo || !id) {
    return <p className="p-8 text-sm text-red-600">No se pudo cargar el riesgo.</p>;
  }

  const titulo = riesgo.origen === "AAV" && riesgo.activo ? riesgo.activo.nombre : riesgo.titulo ?? "Riesgo manual";

  // Fase 3B: la gestión (mutación) de ESTE riesgo depende de si el actor
  // es Administrador TIC o el responsable actual — la lectura nunca se
  // bloquea por esta condición, solo las acciones de escritura que siguen.
  const puedeGestionar = puedeGestionarRegistro(perfil?.usuario, riesgo.responsable.id);
  const puedeReasignar = puedeReasignarRegistro(perfil?.usuario);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/riesgos" className="text-sm text-muted underline">
        ← Volver a Riesgos
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-ink">{titulo}</h1>
        {riesgo.evaluacionActual && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${ESTILO_NIVEL[riesgo.evaluacionActual.nivelRiesgo]}`}
          >
            {riesgo.evaluacionActual.nivelRiesgo}
          </span>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {puedeGestionar && (
          <Link
            to={`/riesgos/${id}/evaluaciones/nueva`}
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-on-primary"
          >
            Nueva evaluación
          </Link>
        )}
        <Link
          to={`/riesgos/${id}/evaluaciones`}
          className="rounded-md border border-border px-3 py-2 text-sm font-medium text-ink"
        >
          Ver evaluaciones
        </Link>
        {puedeGestionar && (
          <Link
            to={`/riesgos/${id}/tratamientos/nuevo`}
            className="rounded-md border border-border px-3 py-2 text-sm font-medium text-ink"
          >
            Nuevo tratamiento
          </Link>
        )}
      </div>

      {/* Fase 3a (Cambio 6): sección principal del riesgo — Activo, Amenaza,
          Vulnerabilidad y Descripción del riesgo. Se muestra antes del
          historial y como información principal, no como comentario. */}
      <section className="mt-6 rounded-md border border-border p-4">
        <h2 className="text-sm font-semibold text-ink">Información del riesgo</h2>
        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted">Activo</p>
            <p className="text-ink">{riesgo.activo?.nombre ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Amenaza</p>
            <p className="text-ink">{riesgo.amenaza?.nombre ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Vulnerabilidad</p>
            <p className="text-ink">{riesgo.vulnerabilidad?.nombre ?? "—"}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-muted">Descripción del riesgo</p>
            <p className="whitespace-pre-line text-ink">{riesgo.descripcion ?? "—"}</p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-md border border-border p-4 text-sm">
        <div>
          <p className="text-xs text-muted">Origen</p>
          <p className="text-ink">{riesgo.origen === "AAV" ? "Activo + Amenaza + Vulnerabilidad" : "Manual"}</p>
        </div>
        {riesgo.origen === "MANUAL" && (
          <>
            <div className="col-span-2">
              <p className="text-xs text-muted">Justificación de origen</p>
              <p className="text-ink">{riesgo.justificacionOrigen}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Categoría de identificación</p>
              <p className="text-ink">{riesgo.categoriaIdentificacion?.nombre}</p>
            </div>
          </>
        )}
        <div>
          <p className="text-xs text-muted">Estado</p>
          <p className="text-ink">{ETIQUETA_ESTADO_RIESGO[riesgo.estado] ?? riesgo.estado}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Creador</p>
          <p className="text-ink">{riesgo.creador.nombre}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Responsable</p>
          <p className="text-ink">{riesgo.responsable.nombre}</p>
        </div>
        {riesgo.evaluacionActual && (
          <>
            <div>
              <p className="text-xs text-muted">Tipo de evaluación vigente</p>
              <p className="text-ink">{riesgo.evaluacionActual.tipoEvaluacion}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Probabilidad × Impacto</p>
              <p className="text-ink">
                {riesgo.evaluacionActual.probabilidad} × {riesgo.evaluacionActual.impacto} ={" "}
                {riesgo.evaluacionActual.valorCalculado}
              </p>
            </div>
          </>
        )}
        <div>
          <p className="text-xs text-muted">Creado</p>
          <p className="text-ink">{new Date(riesgo.creadoEn).toLocaleString()}</p>
        </div>
      </div>

      {/* Reasignar responsable es exclusivo de Administrador TIC (ver
          canReasignarRegistro en el backend): un usuario operativo nunca
          ve este formulario, ni siquiera siendo el responsable actual. */}
      {puedeReasignar && (
        <div className="mt-4">
          <AssignResponsibleForm riesgoId={id} responsableActualId={riesgo.responsable.id} />
        </div>
      )}

      {/* Cambiar el estado del riesgo (resolver/reabrir) es una acción de
          gestión: solo el responsable actual o Administrador TIC. */}
      {puedeGestionar && (
        <div className="mt-8">
          <ResolutionPanel riesgoId={id} estadoActual={riesgo.estado} />
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-ink">Historial del riesgo</h2>
        <div className="mt-3">
          <Timeline entradas={historial ?? []} etiquetaEstado={(e) => ETIQUETA_ESTADO_RIESGO[e] ?? e} />
        </div>
      </div>

      <div className="mt-8 grid gap-6">
        {/* Los comentarios se rigen únicamente por el permiso de recurso,
            nunca por ownership: cualquiera con el permiso puede comentar
            un riesgo aunque no sea su responsable. */}
        <CommentsPanel destino={{ riesgoId: id }} />
        <FollowUpsPanel destino={{ riesgoId: id }} puedeGestionar={puedeGestionar} />
        <EvidencePanel destino={{ riesgoId: id }} puedeGestionar={puedeGestionar} />
      </div>
    </main>
  );
}
