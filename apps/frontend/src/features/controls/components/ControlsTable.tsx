import { Link } from "react-router-dom";
import { Control } from "../types/controls.types";
import { ConPermiso } from "../../../components/ConPermiso";

interface Props {
  controles: Control[];
}

function estadoBadge(estado: Control["estadoImplementacion"]) {
  const styles: Record<Control["estadoImplementacion"], string> = {
    NO_INICIADO: "bg-slate-100 text-slate-700",
    EN_PROGRESO: "bg-sky-100 text-sky-700",
    IMPLEMENTADO: "bg-emerald-100 text-emerald-700",
    VERIFICADO: "bg-teal-100 text-teal-700",
  };

  return styles[estado];
}

export function ControlsTable({ controles }: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface-elevated shadow-sm">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-surface text-left text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Control</th>
            <th className="px-4 py-3 font-medium">Tipo</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Organización</th>
            <th className="px-4 py-3 font-medium">Responsable</th>
            <th className="px-4 py-3 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {controles.map((control) => (
            <tr key={control.id} className="hover:bg-surface">
              <td className="px-4 py-3">
                <div className="font-medium text-ink">{control.nombre}</div>
                {control.codigoIso27001 && (
                  <div className="text-xs text-muted">{control.codigoIso27001}</div>
                )}
              </td>
              <td className="px-4 py-3 text-muted">{control.tipo}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${estadoBadge(control.estadoImplementacion)}`}>
                  {control.estadoImplementacion}
                </span>
              </td>
              <td className="px-4 py-3 text-muted">
                {control.organizacion?.nombre ?? "Sin organización"}
              </td>
              <td className="px-4 py-3 text-muted">
                {control.responsable?.nombre ?? "Sin asignar"}
              </td>
              <td className="px-4 py-3">
                <Link to={`/controles/${control.id}`} className="text-sm font-medium text-ink underline">
                  Ver detalle
                </Link>
                {control.esPropia && (
                  <ConPermiso recurso="controles" accion="actualizar">
                    <Link
                      to={`/controles/${control.id}/editar`}
                      className="ml-3 text-sm font-medium text-ink underline"
                    >
                      Editar
                    </Link>
                  </ConPermiso>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {controles.length === 0 && (
        <div className="border-t border-border p-6 text-center text-sm text-muted">
          No se encontraron controles con los filtros aplicados.
        </div>
      )}
    </div>
  );
}
