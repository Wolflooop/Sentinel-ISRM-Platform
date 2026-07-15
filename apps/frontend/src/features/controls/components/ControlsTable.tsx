import { Link } from "react-router-dom";
import { Control } from "../types/controls.types";

interface Props {
  controles: Control[];
}

function estadoBadge(estado: Control["estadoImplementacion"]) {
  const styles: Record<Control["estadoImplementacion"], string> = {
    NO_APLICADO: "bg-slate-100 text-slate-700",
    PLANIFICADO: "bg-amber-100 text-amber-700",
    EN_PROGRESO: "bg-sky-100 text-sky-700",
    IMPLEMENTADO: "bg-emerald-100 text-emerald-700",
  };

  return styles[estado];
}

export function ControlsTable({ controles }: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Control</th>
            <th className="px-4 py-3 font-medium">Tipo</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Organización</th>
            <th className="px-4 py-3 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {controles.map((control) => (
            <tr key={control.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <div className="font-medium text-slate-800">{control.nombre}</div>
                {control.codigoIso27001 && (
                  <div className="text-xs text-slate-500">{control.codigoIso27001}</div>
                )}
              </td>
              <td className="px-4 py-3 text-slate-600">{control.tipo}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${estadoBadge(control.estadoImplementacion)}`}>
                  {control.estadoImplementacion}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600">
                {control.organizacion?.nombre ?? "Sin organización"}
              </td>
              <td className="px-4 py-3">
                <Link to={`/controles/${control.id}`} className="text-sm font-medium text-slate-700 underline">
                  Ver detalle
                </Link>
                {control.organizacionId !== null && (
                  <Link
                    to={`/controles/${control.id}/editar`}
                    className="ml-3 text-sm font-medium text-slate-700 underline"
                  >
                    Editar
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {controles.length === 0 && (
        <div className="border-t border-slate-200 p-6 text-center text-sm text-slate-500">
          No se encontraron controles con los filtros aplicados.
        </div>
      )}
    </div>
  );
}
