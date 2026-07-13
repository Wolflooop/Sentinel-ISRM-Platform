import { useRoles } from "../hooks/useRoles";
import { RolesTable } from "../components/RolesTable";

export function RolesListPage() {
  const { data: roles, isLoading, isError } = useRoles();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-lg font-semibold text-slate-800">Roles</h1>

      {isLoading && <p className="mt-4 text-sm text-slate-500">Cargando roles...</p>}
      {isError && <p className="mt-4 text-sm text-red-600">No se pudieron cargar los roles.</p>}
      {roles && (
        <div className="mt-4">
          <RolesTable roles={roles} />
        </div>
      )}
    </main>
  );
}
