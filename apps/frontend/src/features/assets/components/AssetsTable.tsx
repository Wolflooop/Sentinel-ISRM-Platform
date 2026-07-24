import { Link } from "react-router-dom";
import { Activo } from "../types/assets.types";
import { useCambiarEstadoActivo } from "../hooks/useAssets";

interface Props {
  activos: Activo[];
}

const ESTILO_ESTADO: Record<string, string> = {
  ACTIVO: "bg-green-100 text-green-800",
  INACTIVO: "bg-slate-100 text-slate-600",
  RETIRADO: "bg-red-100 text-red-700",
};

export function AssetsTable({ activos }: Props) {
  const cambiarEstado = useCambiarEstadoActivo();

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-border text-left text-muted">
          <th className="py-2 pr-4">Nombre</th>
          <th className="py-2 pr-4">Tipo</th>
          <th className="py-2 pr-4">Criticidad</th>
          <th className="py-2 pr-4">Responsable</th>
          <th className="py-2 pr-4">Estado</th>
          <th className="py-2 pr-4"></th>
        </tr>
      </thead>
      <tbody>
        {activos.map((activo) => (
          <tr key={activo.id} className="border-b border-border">
            <td className="py-2 pr-4 font-medium text-ink">{activo.nombre}</td>
            <td className="py-2 pr-4 text-muted">{activo.categoria.nombre}</td>
            <td className="py-2 pr-4 text-muted">{activo.criticidad}</td>
            <td className="py-2 pr-4 text-muted">{activo.usuarioResponsable.nombre}</td>
            <td className="py-2 pr-4">
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${ESTILO_ESTADO[activo.estado]}`}
              >
                {activo.estado}
              </span>
            </td>
            <td className="py-2 pr-4 space-x-3">
              <Link to={`/activos/${activo.id}/editar`} className="text-ink underline">
                Editar
              </Link>
              {activo.estado === "ACTIVO" && (
                <button
                  type="button"
                  disabled={cambiarEstado.isPending}
                  onClick={() => cambiarEstado.mutate({ id: activo.id, estado: "INACTIVO" })}
                  className="text-ink underline disabled:opacity-50"
                >
                  Desactivar
                </button>
              )}
              {activo.estado === "INACTIVO" && (
                <button
                  type="button"
                  disabled={cambiarEstado.isPending}
                  onClick={() => cambiarEstado.mutate({ id: activo.id, estado: "ACTIVO" })}
                  className="text-ink underline disabled:opacity-50"
                >
                  Activar
                </button>
              )}
              {activo.estado !== "RETIRADO" && (
                <button
                  type="button"
                  disabled={cambiarEstado.isPending}
                  onClick={() => cambiarEstado.mutate({ id: activo.id, estado: "RETIRADO" })}
                  className="text-red-600 underline disabled:opacity-50"
                >
                  Retirar
                </button>
              )}
            </td>
          </tr>
        ))}
        {activos.length === 0 && (
          <tr>
            <td colSpan={6} className="py-4 text-sm text-muted">
              No se encontraron activos con los filtros aplicados.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
