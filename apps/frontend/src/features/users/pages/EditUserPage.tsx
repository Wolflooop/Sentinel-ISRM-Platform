import { useParams, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { useUsuario, useActualizarUsuario } from "../hooks/useUsers";
import { EditUserForm } from "../components/EditUserForm";

export function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: usuario, isLoading, isError } = useUsuario(id);
  const actualizarUsuario = useActualizarUsuario(id ?? "");

  const errorMessage = isAxiosError(actualizarUsuario.error)
    ? (actualizarUsuario.error.response?.data as { error?: string } | undefined)?.error ??
      "No se pudieron guardar los cambios"
    : actualizarUsuario.error
    ? "No se pudieron guardar los cambios"
    : null;

  if (isLoading) {
    return <p className="p-8 text-sm text-muted">Cargando usuario...</p>;
  }

  if (isError || !usuario) {
    return <p className="p-8 text-sm text-red-600">No se pudo cargar el usuario.</p>;
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-lg font-semibold text-ink">Editar usuario</h1>
      <div className="mt-6">
        <EditUserForm
          usuario={usuario}
          isSubmittingRequest={actualizarUsuario.isPending}
          errorMessage={errorMessage}
          onSubmit={(values) => {
            actualizarUsuario.mutate(values, {
              onSuccess: () => navigate("/usuarios", { replace: true }),
            });
          }}
        />
      </div>
    </main>
  );
}
