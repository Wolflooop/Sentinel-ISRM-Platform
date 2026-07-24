import { useParams, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { useActivo, useActualizarActivo } from "../hooks/useAssets";
import { AssetForm } from "../components/AssetForm";

export function EditAssetPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: activo, isLoading, isError } = useActivo(id);
  const actualizarActivo = useActualizarActivo(id ?? "");

  const errorMessage = isAxiosError(actualizarActivo.error)
    ? (actualizarActivo.error.response?.data as { error?: string } | undefined)?.error ??
      "No se pudieron guardar los cambios"
    : actualizarActivo.error
    ? "No se pudieron guardar los cambios"
    : null;

  if (isLoading) {
    return <p className="p-8 text-sm text-muted">Cargando activo...</p>;
  }

  if (isError || !activo) {
    return <p className="p-8 text-sm text-red-600">No se pudo cargar el activo.</p>;
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-lg font-semibold text-ink">Editar activo</h1>
      <div className="mt-6">
        <AssetForm
          activo={activo}
          isSubmittingRequest={actualizarActivo.isPending}
          errorMessage={errorMessage}
          onSubmit={(values) => {
            actualizarActivo.mutate(values, {
              onSuccess: () => navigate("/activos", { replace: true }),
            });
          }}
        />
      </div>
    </main>
  );
}
