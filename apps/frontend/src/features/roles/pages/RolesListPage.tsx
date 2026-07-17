import { useRoles } from "../hooks/useRoles";
import { useUsuarios } from "../../users/hooks/useUsers";
import { RoleCard } from "../components/RoleCard";

export function RolesListPage() {
  const { data: roles, isLoading, isError } = useRoles();

  // Conteo de usuarios por rol calculado en frontend a partir de GET
  // /usuarios (ya existente) — no se crea un endpoint nuevo solo para este
  // contador. Si el rol del usuario actual no tiene permiso "usuarios:leer"
  // esta consulta falla, y las tarjetas simplemente no muestran el conteo
  // (ver RoleCard, prop totalUsuarios = null) en vez de romper la página.
  const { data: usuarios, isError: isUsuariosError } = useUsuarios();

  const conteoPorRol = new Map<string, number>();
  if (usuarios) {
    for (const usuario of usuarios) {
      conteoPorRol.set(usuario.rol.id, (conteoPorRol.get(usuario.rol.id) ?? 0) + 1);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-lg font-semibold text-ink">Roles</h1>

      {isLoading && <p className="mt-4 text-sm text-muted">Cargando roles...</p>}
      {isError && <p className="mt-4 text-sm text-red-600">No se pudieron cargar los roles.</p>}

      {roles && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((rol) => (
            <RoleCard
              key={rol.id}
              rol={rol}
              totalUsuarios={isUsuariosError ? null : conteoPorRol.get(rol.id) ?? 0}
            />
          ))}
        </div>
      )}
    </main>
  );
}
