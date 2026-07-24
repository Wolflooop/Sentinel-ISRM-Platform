import { Link } from "react-router-dom";
import { Vulnerabilidad } from "../types/vulnerabilities.types";
import { useEliminarVulnerabilidad } from "../hooks/useVulnerabilities";
import { ConPermiso } from "../../../components/ConPermiso";

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
        <tr className="border-b border-border text-left text-muted">
          <th className="py-2 pr-4">Nombre</th>
          <th className="py-2 pr-4">Categoría</th>
          <th className="py-2 pr-4">Severidad</th>
          <th className="py-2 pr-4">CVE</th>
          <th className="py-2 pr-4">Catálogo</th>
          <th className="py-2 pr-4"></th>
        </tr>
      </thead>
      <tbody>
        {vulnerabilidades.map((vulnerabilidad) => (
          <tr key={vulnerabilidad.id} className="border-b border-border">
            <td className="py-2 pr-4 font-medium text-ink">{vulnerabilidad.nombre}</td>
            <td className="py-2 pr-4 text-muted">{vulnerabilidad.categoria.nombre}</td>
            <td className="py-2 pr-4">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  ESTILO_SEVERIDAD[vulnerabilidad.severidad] ?? "bg-slate-100 text-slate-700"
                }`}
              >
                {vulnerabilidad.severidad}
              </span>
            </td>
            <td className="py-2 pr-4 text-muted">{vulnerabilidad.referenciaCVE ?? "—"}</td>
            <td className="py-2 pr-4 text-muted">
              {vulnerabilidad.esPropia ? "Propia" : "Predefinida"}
            </td>
            <td className="py-2 pr-4 space-x-3">
              {vulnerabilidad.esPropia ? (
                <>
                  <ConPermiso recurso="vulnerabilidades" accion="actualizar">
                    <Link
                      to={`/vulnerabilidades/${vulnerabilidad.id}/editar`}
                      className="text-ink underline"
                    >
                      Editar
                    </Link>
                  </ConPermiso>
                  <ConPermiso recurso="vulnerabilidades" accion="eliminar">
                    <button
                      type="button"
                      disabled={eliminarVulnerabilidad.isPending}
                      onClick={() => handleEliminar(vulnerabilidad)}
                      className="text-red-600 underline disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </ConPermiso>
                </>
              ) : (
                <span className="text-muted">Solo lectura</span>
              )}
            </td>
          </tr>
        ))}
        {vulnerabilidades.length === 0 && (
          <tr>
            <td colSpan={6} className="py-4 text-sm text-muted">
              No se encontraron vulnerabilidades con los filtros aplicados.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
