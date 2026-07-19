import { useParams, Link } from "react-router-dom";
import { useRiesgo, useHistorialRiesgo } from "../hooks/useRisks";
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
};

export function RiskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: riesgo, isLoading, isError } = useRiesgo(id);
  const { data: historial } = useHistorialRiesgo(id);

  if (isLoading) {
    return <p className="p-8 text-sm text-slate-500">Cargando riesgo...</p>;
  }

  if (isError || !riesgo) {
    return <p className="p-8 text-sm text-red-600">No se pudo cargar el riesgo.</p>;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link to="/riesgos" className="text-sm text-slate-500 underline">
        ← Volver a Riesgos
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-800">Detalle del riesgo</h1>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${ESTILO_NIVEL[riesgo.nivelRiesgoInherente]}`}
        >
          {riesgo.nivelRiesgoInherente}
        </span>
      </div>

      <div className="mt-6 flex gap-2">
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
          Ver historial
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-md border border-slate-200 p-4 text-sm">
        <div>
          <p className="text-xs text-slate-500">Activo</p>
          <p className="text-slate-800">{riesgo.activo.nombre}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Amenaza</p>
          <p className="text-slate-800">{riesgo.amenaza.nombre}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Vulnerabilidad</p>
          <p className="text-slate-800">{riesgo.vulnerabilidad.nombre}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Estado</p>
          <p className="text-slate-800">{riesgo.estado}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Probabilidad</p>
          <p className="text-slate-800">{riesgo.probabilidad} / 5</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Impacto</p>
          <p className="text-slate-800">{riesgo.impacto} / 5</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Valor de riesgo</p>
          <p className="text-slate-800">{riesgo.valorRiesgo} / 25</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Nivel residual</p>
          <p className="text-slate-800">{riesgo.nivelRiesgoResidual ?? "— (sin tratamiento aún)"}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Último cálculo</p>
          <p className="text-slate-800">{new Date(riesgo.fechaUltimoCalculo).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Creado</p>
          <p className="text-slate-800">{new Date(riesgo.creadoEn).toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-ink">Historial del riesgo</h2>
        <div className="mt-3">
          <Timeline entradas={historial ?? []} etiquetaEstado={(e) => ETIQUETA_ESTADO_RIESGO[e] ?? e} />
        </div>
      </div>
    </main>
  );
}
