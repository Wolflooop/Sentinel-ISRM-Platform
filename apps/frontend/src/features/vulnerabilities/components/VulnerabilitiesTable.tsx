import { Link } from "react-router-dom";
import { Vulnerabilidad } from "../types/vulnerabilities.types";
import { useEliminarVulnerabilidad } from "../hooks/useVulnerabilities";

interface Props {
  vulnerabilidades: Vulnerabilidad[];
}

const ESTILO_SEVERIDAD: Record<number, string> = {
  1: "bg-green-100 text-green-800",
  2: "bg-lime-100 text-lime-800",
  3: "bg-amber-100 text-amber-800",
  4: "bg-orange-100 text-orange-800",
  5: "bg-red-100 text-red-800",
};

/**
 * Sin distinción "Propia"/"Predefinida" (a diferencia de ThreatsTable): el
 * catálogo de Vulnerabilidad es 100% global y editable por igual por
 * cualquier organización con el permiso correspondiente (ver PASO 1 de esta
 * fase — schema.prisma no define `organizacionId` ni `esPredefinida` para
 * este modelo).
 */
export function VulnerabilitiesTable({ vulnerabilidades }: Props) {
  const eliminarVulnerabilidad = useEliminarVulnerabilidad();

  function handleEliminar(vulnerabilidad: Vulnerabilidad) {
    if (
      window.confirm(
        `¿Eliminar la vulnerabilidad "${vulnerabilidad.nombre}"? Esta acción no se puede deshacer.`
      )
    ) {
      eliminarVulnerabilidad.mutate(vulnerabilidad.id);
    }
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-left text-slate-500">
          <th className="py-2 pr-4">Nombre</th>
          <th className="py-2 pr-4">Categoría</th>
          <th className="py-2 pr-4">Severidad</th>
          <th className="py-2 pr-4">CVE</th>
          <th className="py-2 pr-4"></th>
        </tr>
      </thead>
      <tbody>
        {vulnerabilidades.map((vulnerabilidad) => (
          <tr key={vulnerabilidad.id} className="border-b border-slate-100">
            <td className="py-2 pr-4 font-medium text-slate-800">{vulnerabilidad.nombre}</td>
            <td className="py-2 pr-4 text-slate-600">{vulnerabilidad.categoria.nombre}</td>
            <td className="py-2 pr-4">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  ESTILO_SEVERIDAD[vulnerabilidad.severidad] ?? "bg-slate-100 text-slate-700"
                }`}
              >
                {vulnerabilidad.severidad}
              </span>
            </td>
            <td className="py-2 pr-4 text-slate-500">{vulnerabilidad.referenciaCVE ?? "—"}</td>
            <td className="py-2 pr-4 space-x-3">
              <Link
                to={`/vulnerabilidades/${vulnerabilidad.id}/editar`}
                className="text-slate-700 underline"
              >
                Editar
              </Link>
              <button
                type="button"
                disabled={eliminarVulnerabilidad.isPending}
                onClick={() => handleEliminar(vulnerabilidad)}
                className="text-red-600 underline disabled:opacity-50"
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))}
        {vulnerabilidades.length === 0 && (
          <tr>
            <td colSpan={5} className="py-4 text-sm text-slate-400">
              No se encontraron vulnerabilidades con los filtros aplicados.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
