import { Link } from "react-router-dom";
import { Usuario } from "../types/users.types";
import { useCambiarEstadoUsuario } from "../hooks/useUsers";

interface Props {
  usuarios: Usuario[];
}

export function UsersTable({ usuarios }: Props) {
  const cambiarEstado = useCambiarEstadoUsuario();

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-left text-slate-500">
          <th className="py-2 pr-4">Nombre</th>
          <th className="py-2 pr-4">Correo</th>
          <th className="py-2 pr-4">Rol</th>
          <th className="py-2 pr-4">Estado</th>
          <th className="py-2 pr-4"></th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map((usuario) => (
          <tr key={usuario.id} className="border-b border-slate-100">
            <td className="py-2 pr-4 font-medium text-slate-800">{usuario.nombre}</td>
            <td className="py-2 pr-4 text-slate-600">{usuario.email}</td>
            <td className="py-2 pr-4 text-slate-600">{usuario.rol.nombre}</td>
            <td className="py-2 pr-4">
              <span
                className={
                  usuario.activo
                    ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800"
                    : "rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                }
              >
                {usuario.activo ? "Activo" : "Inactivo"}
              </span>
            </td>
            <td className="py-2 pr-4 space-x-3">
              <Link to={`/usuarios/${usuario.id}/editar`} className="text-slate-700 underline">
                Editar
              </Link>
              <button
                type="button"
                disabled={cambiarEstado.isPending}
                onClick={() =>
                  cambiarEstado.mutate({ id: usuario.id, activo: !usuario.activo })
                }
                className="text-slate-700 underline disabled:opacity-50"
              >
                {usuario.activo ? "Desactivar" : "Activar"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
