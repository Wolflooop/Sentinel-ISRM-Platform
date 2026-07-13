import { Link } from "react-router-dom";
import { Rol } from "../types/roles.types";

interface Props {
  roles: Rol[];
}

export function RolesTable({ roles }: Props) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-left text-slate-500">
          <th className="py-2 pr-4">Nombre</th>
          <th className="py-2 pr-4">Descripción</th>
          <th className="py-2 pr-4">Tipo</th>
          <th className="py-2 pr-4"></th>
        </tr>
      </thead>
      <tbody>
        {roles.map((rol) => (
          <tr key={rol.id} className="border-b border-slate-100">
            <td className="py-2 pr-4 font-medium text-slate-800">{rol.nombre}</td>
            <td className="py-2 pr-4 text-slate-600">{rol.descripcion ?? "—"}</td>
            <td className="py-2 pr-4">
              {rol.esSistema ? (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                  Sistema
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  Personalizado
                </span>
              )}
            </td>
            <td className="py-2 pr-4">
              <Link to={`/roles/${rol.id}`} className="text-slate-700 underline">
                Ver detalle
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
