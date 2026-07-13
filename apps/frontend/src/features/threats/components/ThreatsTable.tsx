import { Link } from "react-router-dom";
import { Amenaza } from "../types/threats.types";
import { useEliminarAmenaza } from "../hooks/useThreats";

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
        <tr className="border-b border-slate-200 text-left text-slate-500">
          <th className="py-2 pr-4">Nombre</th>
          <th className="py-2 pr-4">Categoría</th>
          <th className="py-2 pr-4">Origen</th>
          <th className="py-2 pr-4">Catálogo</th>
          <th className="py-2 pr-4"></th>
        </tr>
      </thead>
      <tbody>
        {amenazas.map((amenaza) => (
          <tr key={amenaza.id} className="border-b border-slate-100">
            <td className="py-2 pr-4 font-medium text-slate-800">{amenaza.nombre}</td>
            <td className="py-2 pr-4 text-slate-600">{amenaza.categoria.nombre}</td>
            <td className="py-2 pr-4">
              <span className={`rounded-full px-2 py-0.5 text-xs ${ESTILO_ORIGEN[amenaza.origen]}`}>
                {amenaza.origen}
              </span>
            </td>
            <td className="py-2 pr-4 text-slate-500">
              {amenaza.esPropia ? "Propia" : "Predefinida"}
            </td>
            <td className="py-2 pr-4 space-x-3">
              {amenaza.esPropia ? (
                <>
                  <Link to={`/amenazas/${amenaza.id}/editar`} className="text-slate-700 underline">
                    Editar
                  </Link>
                  <button
                    type="button"
                    disabled={eliminarAmenaza.isPending}
                    onClick={() => handleEliminar(amenaza)}
                    className="text-red-600 underline disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </>
              ) : (
                <span className="text-slate-400">Solo lectura</span>
              )}
            </td>
          </tr>
        ))}
        {amenazas.length === 0 && (
          <tr>
            <td colSpan={5} className="py-4 text-sm text-slate-400">
              No se encontraron amenazas con los filtros aplicados.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
