import { Link } from "react-router-dom";
import { Usuario } from "../types/users.types";
import { useCambiarEstadoUsuario } from "../hooks/useUsers";
import { ConPermiso } from "../../../components/ConPermiso";

interface Props {
  usuarios: Usuario[];
}

export function UsersTable({ usuarios }: Props) {
  const cambiarEstado = useCambiarEstadoUsuario();

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-border text-left text-muted">
          <th className="py-2 pr-4">Nombre</th>
          <th className="py-2 pr-4">Correo</th>
          <th className="py-2 pr-4">Rol</th>
          <th className="py-2 pr-4">Estado</th>
          <th className="py-2 pr-4"></th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map((usuario) => (
          <tr key={usuario.id} className="border-b border-border/60">
            <td className="py-2 pr-4 font-medium text-ink">{usuario.nombre}</td>
            <td className="py-2 pr-4 text-muted">{usuario.email}</td>
            <td className="py-2 pr-4 text-muted">{usuario.rol.nombre}</td>
            <td className="py-2 pr-4">
              <span
                className={
                  usuario.activo
                    ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "rounded-full bg-surface px-2 py-0.5 text-xs text-muted"
                }
              >
                {usuario.activo ? "Activo" : "Inactivo"}
              </span>
            </td>
            <td className="py-2 pr-4 space-x-3">
              <ConPermiso recurso="usuarios" accion="actualizar">
                <Link to={`/usuarios/${usuario.id}/editar`} className="text-ink underline">
                  Editar
                </Link>
              </ConPermiso>
              <ConPermiso recurso="usuarios" accion="cambiarEstado">
                <button
                  type="button"
                  disabled={cambiarEstado.isPending}
                  onClick={() =>
                    cambiarEstado.mutate({ id: usuario.id, activo: !usuario.activo })
                  }
                  className="text-ink underline disabled:opacity-50"
                >
                  {usuario.activo ? "Desactivar" : "Activar"}
                </button>
              </ConPermiso>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
