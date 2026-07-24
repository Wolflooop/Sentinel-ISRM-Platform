import { Link } from "react-router-dom";
import { Amenaza } from "../types/threats.types";
import { useEliminarAmenaza } from "../hooks/useThreats";
import { ConPermiso } from "../../../components/ConPermiso";

interface Props {
  amenazas: Amenaza[];
}

const ESTILO_ORIGEN: Record<string, string> = {
  INTERNO: "bg-blue-100 text-blue-800",
  EXTERNO: "bg-amber-100 text-amber-800",
};

export function ThreatsTable({ amenazas }: Props) {
  const eliminarAmenaza = useEliminarAmenaza();

  function handleEliminar(amenaza: Amenaza) {
    if (window.confirm(`¿Eliminar la amenaza "${amenaza.nombre}"? Esta acción no se puede deshacer.`)) {
      eliminarAmenaza.mutate(amenaza.id);
    }
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-border text-left text-muted">
          <th className="py-2 pr-4">Nombre</th>
          <th className="py-2 pr-4">Categoría</th>
          <th className="py-2 pr-4">Origen</th>
          <th className="py-2 pr-4">Catálogo</th>
          <th className="py-2 pr-4"></th>
        </tr>
      </thead>
      <tbody>
        {amenazas.map((amenaza) => (
          <tr key={amenaza.id} className="border-b border-border">
            <td className="py-2 pr-4 font-medium text-ink">{amenaza.nombre}</td>
            <td className="py-2 pr-4 text-muted">{amenaza.categoria.nombre}</td>
            <td className="py-2 pr-4">
              <span className={`rounded-full px-2 py-0.5 text-xs ${ESTILO_ORIGEN[amenaza.origen]}`}>
                {amenaza.origen}
              </span>
            </td>
            <td className="py-2 pr-4 text-muted">
              {amenaza.esPropia ? "Propia" : "Predefinida"}
            </td>
            <td className="py-2 pr-4 space-x-3">
              {amenaza.esPropia ? (
                <>
                  <ConPermiso recurso="amenazas" accion="actualizar">
                    <Link to={`/amenazas/${amenaza.id}/editar`} className="text-ink underline">
                      Editar
                    </Link>
                  </ConPermiso>
                  <ConPermiso recurso="amenazas" accion="eliminar">
                    <button
                      type="button"
                      disabled={eliminarAmenaza.isPending}
                      onClick={() => handleEliminar(amenaza)}
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
        {amenazas.length === 0 && (
          <tr>
            <td colSpan={5} className="py-4 text-sm text-muted">
              No se encontraron amenazas con los filtros aplicados.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
