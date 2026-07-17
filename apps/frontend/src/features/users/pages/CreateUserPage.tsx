import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { CreateUserForm } from "../components/CreateUserForm";
import { useCrearUsuario } from "../hooks/useUsers";

export function CreateUserPage() {
  const navigate = useNavigate();
  const crearUsuario = useCrearUsuario();

  const errorMessage = isAxiosError(crearUsuario.error)
    ? (crearUsuario.error.response?.data as { error?: string } | undefined)?.error ??
      "No se pudo crear el usuario"
    : crearUsuario.error
    ? "No se pudo crear el usuario"
    : null;

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-lg font-semibold text-ink">Nuevo usuario</h1>
      <div className="mt-6">
        <CreateUserForm
          isSubmittingRequest={crearUsuario.isPending}
          errorMessage={errorMessage}
          onSubmit={(values) => {
            crearUsuario.mutate(values, {
              onSuccess: () => navigate("/usuarios", { replace: true }),
            });
          }}
        />
      </div>
    </main>
  );
}
