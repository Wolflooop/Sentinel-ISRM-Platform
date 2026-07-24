import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { AssetForm } from "../components/AssetForm";
import { useCrearActivo } from "../hooks/useAssets";

export function CreateAssetPage() {
  const navigate = useNavigate();
  const crearActivo = useCrearActivo();

  const errorMessage = isAxiosError(crearActivo.error)
    ? (crearActivo.error.response?.data as { error?: string } | undefined)?.error ??
      "No se pudo crear el activo"
    : crearActivo.error
    ? "No se pudo crear el activo"
    : null;

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-lg font-semibold text-ink">Nuevo activo</h1>
      <div className="mt-6">
        <AssetForm
          isSubmittingRequest={crearActivo.isPending}
          errorMessage={errorMessage}
          onSubmit={(values) => {
            crearActivo.mutate(values, {
              onSuccess: () => navigate("/activos", { replace: true }),
            });
          }}
        />
      </div>
    </main>
  );
}
