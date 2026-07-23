import { useParams, Link } from "react-router-dom";
import { useRiesgo, useHistorialRiesgo } from "../hooks/useRisks";
import { AssignResponsibleForm } from "../components/AssignResponsibleForm";
import { ResolutionPanel } from "../../risk-resolutions/components/ResolutionPanel";
import { CommentsPanel } from "../../comments/components/CommentsPanel";
import { FollowUpsPanel } from "../../follow-ups/components/FollowUpsPanel";
import { EvidencePanel } from "../../evidence/components/EvidencePanel";
import { Timeline } from "../../../components/Timeline";

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

  if (isLoading) {
    return <p className="p-8 text-sm text-slate-500">Cargando riesgo...</p>;
  }

  if (isError || !riesgo || !id) {
    return <p className="p-8 text-sm text-red-600">No se pudo cargar el riesgo.</p>;
  }

  const titulo = riesgo.origen === "AAV" && riesgo.activo ? riesgo.activo.nombre : riesgo.titulo ?? "Riesgo manual";

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/riesgos" className="text-sm text-slate-500 underline">
        ← Volver a Riesgos
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-800">{titulo}</h1>
        {riesgo.evaluacionActual && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${ESTILO_NIVEL[riesgo.evaluacionActual.nivelRiesgo]}`}
          >
            {riesgo.evaluacionActual.nivelRiesgo}
          </span>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          to={`/riesgos/${id}/evaluaciones/nueva`}
          className="rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white"
        >
          Nueva evaluación
        </Link>
        <Link
          to={`/riesgos/${id}/evaluaciones`}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
        >
          Ver evaluaciones
        </Link>
        <Link
          to={`/riesgos/${id}/tratamientos/nuevo`}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
        >
          Nuevo tratamiento
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-md border border-slate-200 p-4 text-sm">
        <div>
          <p className="text-xs text-slate-500">Origen</p>
          <p className="text-slate-800">{riesgo.origen === "AAV" ? "Activo + Amenaza + Vulnerabilidad" : "Manual"}</p>
        </div>
        {riesgo.origen === "AAV" ? (
          <>
            <div>
              <p className="text-xs text-slate-500">Amenaza</p>
              <p className="text-slate-800">{riesgo.amenaza?.nombre}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Vulnerabilidad</p>
              <p className="text-slate-800">{riesgo.vulnerabilidad?.nombre}</p>
            </div>
          </>
        ) : (
          <>
            <div className="col-span-2">
              <p className="text-xs text-slate-500">Descripción</p>
              <p className="text-slate-800">{riesgo.descripcion}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-slate-500">Justificación de origen</p>
              <p className="text-slate-800">{riesgo.justificacionOrigen}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Categoría de identificación</p>
              <p className="text-slate-800">{riesgo.categoriaIdentificacion?.nombre}</p>
            </div>
          </>
        )}
        <div>
          <p className="text-xs text-slate-500">Estado</p>
          <p className="text-slate-800">{ETIQUETA_ESTADO_RIESGO[riesgo.estado] ?? riesgo.estado}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Creador</p>
          <p className="text-slate-800">{riesgo.creador.nombre}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Responsable</p>
          <p className="text-slate-800">{riesgo.responsable.nombre}</p>
        </div>
        {riesgo.evaluacionActual && (
          <>
            <div>
              <p className="text-xs text-slate-500">Tipo de evaluación vigente</p>
              <p className="text-slate-800">{riesgo.evaluacionActual.tipoEvaluacion}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Probabilidad × Impacto</p>
              <p className="text-slate-800">
                {riesgo.evaluacionActual.probabilidad} × {riesgo.evaluacionActual.impacto} ={" "}
                {riesgo.evaluacionActual.valorCalculado}
              </p>
            </div>
          </>
        )}
        <div>
          <p className="text-xs text-slate-500">Creado</p>
          <p className="text-slate-800">{new Date(riesgo.creadoEn).toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-4">
        <AssignResponsibleForm riesgoId={id} responsableActualId={riesgo.responsable.id} />
      </div>

      <div className="mt-8">
        <ResolutionPanel riesgoId={id} estadoActual={riesgo.estado} />
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-ink">Historial del riesgo</h2>
        <div className="mt-3">
          <Timeline entradas={historial ?? []} etiquetaEstado={(e) => ETIQUETA_ESTADO_RIESGO[e] ?? e} />
        </div>
      </div>

      <div className="mt-8 grid gap-6">
        <CommentsPanel destino={{ riesgoId: id }} />
        <FollowUpsPanel destino={{ riesgoId: id }} />
        <EvidencePanel destino={{ riesgoId: id }} />
      </div>
    </main>
  );
}
