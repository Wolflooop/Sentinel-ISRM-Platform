import { Link } from "react-router-dom";
import { useUsuarios } from "../hooks/useUsers";
import { UsersTable } from "../components/UsersTable";

export function UsersListPage() {
  const { data: usuarios, isLoading, isError } = useUsuarios();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-800">Usuarios</h1>
        <Link
          to="/usuarios/nuevo"
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white"
        >
          Nuevo usuario
        </Link>
      </div>

      {isLoading && <p className="mt-4 text-sm text-slate-500">Cargando usuarios...</p>}
      {isError && (
        <p className="mt-4 text-sm text-red-600">No se pudieron cargar los usuarios.</p>
      )}
      {usuarios && (
        <div className="mt-4">
          <UsersTable usuarios={usuarios} />
        </div>
      )}
    </main>
  );
}
