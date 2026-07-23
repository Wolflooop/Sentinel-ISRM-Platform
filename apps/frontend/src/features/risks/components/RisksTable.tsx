import { Link } from "react-router-dom";
import { Riesgo } from "../types/risks.types";

interface Props {
  riesgos: Riesgo[];
}

const ESTILO_NIVEL: Record<string, string> = {
  BAJO: "bg-green-100 text-green-800",
  MEDIO: "bg-yellow-100 text-yellow-800",
  ALTO: "bg-orange-100 text-orange-800",
  CRITICO: "bg-red-100 text-red-800",
};

// V2: el "título" de fila ahora depende del origen — AAV muestra el activo,
// MANUAL muestra el título capturado a mano.
function tituloDeFila(riesgo: Riesgo): string {
  if (riesgo.origen === "AAV" && riesgo.activo) {
    return riesgo.activo.nombre;
  }
  return riesgo.titulo ?? "Riesgo manual";
}

export function RisksTable({ riesgos }: Props) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-left text-slate-500">
          <th className="py-2 pr-4">Riesgo</th>
          <th className="py-2 pr-4">Origen</th>
          <th className="py-2 pr-4">Responsable</th>
          <th className="py-2 pr-4">Valor</th>
          <th className="py-2 pr-4">Nivel</th>
          <th className="py-2 pr-4">Estado</th>
          <th className="py-2 pr-4"></th>
        </tr>
      </thead>
      <tbody>
        {riesgos.map((riesgo) => (
          <tr key={riesgo.id} className="border-b border-slate-100">
            <td className="py-2 pr-4 font-medium text-slate-800">{tituloDeFila(riesgo)}</td>
            <td className="py-2 pr-4 text-slate-600">
              {riesgo.origen === "AAV" ? "AAV" : "Manual"}
            </td>
            <td className="py-2 pr-4 text-slate-600">{riesgo.responsable.nombre}</td>
            <td className="py-2 pr-4 text-slate-600">
              {riesgo.evaluacionActual
                ? `${riesgo.evaluacionActual.probabilidad} × ${riesgo.evaluacionActual.impacto} = ${riesgo.evaluacionActual.valorCalculado}`
                : "—"}
            </td>
            <td className="py-2 pr-4">
              {riesgo.evaluacionActual ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${ESTILO_NIVEL[riesgo.evaluacionActual.nivelRiesgo]}`}
                >
                  {riesgo.evaluacionActual.nivelRiesgo}
                </span>
              ) : (
                <span className="text-xs text-slate-400">Sin evaluar</span>
              )}
            </td>
            <td className="py-2 pr-4 text-slate-500">{riesgo.estado}</td>
            <td className="py-2 pr-4">
              <Link to={`/riesgos/${riesgo.id}`} className="text-slate-700 underline">
                Ver
              </Link>
            </td>
          </tr>
        ))}
        {riesgos.length === 0 && (
          <tr>
            <td colSpan={7} className="py-4 text-sm text-slate-400">
              No se encontraron riesgos con los filtros aplicados.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
