import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { ContextForm } from "../components/ContextForm";
import { useCrearContexto } from "../hooks/useContext";

export function CreateContextPage() {
  const navigate = useNavigate();
  const crearContexto = useCrearContexto();

  const errorMessage = isAxiosError(crearContexto.error)
    ? (crearContexto.error.response?.data as { error?: string } | undefined)?.error ??
      "No se pudo crear el contexto"
    : crearContexto.error
    ? "No se pudo crear el contexto"
    : null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-lg font-semibold text-slate-800">Nuevo contexto ISO</h1>
      <div className="mt-6">
        <ContextForm
          isSubmittingRequest={crearContexto.isPending}
          errorMessage={errorMessage}
          onSubmit={(values) => {
            crearContexto.mutate(values, {
              onSuccess: (contexto) => navigate(`/contexto/${contexto.id}`, { replace: true }),
            });
          }}
        />
      </div>
    </main>
  );
}
