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

export function RisksTable({ riesgos }: Props) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-left text-slate-500">
          <th className="py-2 pr-4">Activo</th>
          <th className="py-2 pr-4">Amenaza</th>
          <th className="py-2 pr-4">Vulnerabilidad</th>
          <th className="py-2 pr-4">Valor</th>
          <th className="py-2 pr-4">Prioridad</th>
          <th className="py-2 pr-4">Estado</th>
          <th className="py-2 pr-4"></th>
        </tr>
      </thead>
      <tbody>
        {riesgos.map((riesgo) => (
          <tr key={riesgo.id} className="border-b border-slate-100">
            <td className="py-2 pr-4 font-medium text-slate-800">{riesgo.activo.nombre}</td>
            <td className="py-2 pr-4 text-slate-600">{riesgo.amenaza.nombre}</td>
            <td className="py-2 pr-4 text-slate-600">{riesgo.vulnerabilidad.nombre}</td>
            <td className="py-2 pr-4 text-slate-600">
              {riesgo.probabilidad} × {riesgo.impacto} = {riesgo.valorRiesgo}
            </td>
            <td className="py-2 pr-4">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${ESTILO_NIVEL[riesgo.nivelRiesgoInherente]}`}
              >
                {riesgo.nivelRiesgoInherente}
              </span>
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
