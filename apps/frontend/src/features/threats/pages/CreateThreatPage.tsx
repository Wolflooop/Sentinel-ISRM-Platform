import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { ThreatForm } from "../components/ThreatForm";
import { useCrearAmenaza } from "../hooks/useThreats";

export function CreateThreatPage() {
  const navigate = useNavigate();
  const crearAmenaza = useCrearAmenaza();

  const errorMessage = isAxiosError(crearAmenaza.error)
    ? (crearAmenaza.error.response?.data as { error?: string } | undefined)?.error ??
      "No se pudo crear la amenaza"
    : crearAmenaza.error
    ? "No se pudo crear la amenaza"
    : null;

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-lg font-semibold text-ink">Nueva amenaza</h1>
      <div className="mt-6">
        <ThreatForm
          isSubmittingRequest={crearAmenaza.isPending}
          errorMessage={errorMessage}
          onSubmit={(values) => {
            crearAmenaza.mutate(values, {
              onSuccess: () => navigate("/amenazas", { replace: true }),
            });
          }}
        />
      </div>
    </main>
  );
}
