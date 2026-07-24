import { useParams, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { useAmenaza, useActualizarAmenaza } from "../hooks/useThreats";
import { ThreatForm } from "../components/ThreatForm";

export function EditThreatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: amenaza, isLoading, isError } = useAmenaza(id);
  const actualizarAmenaza = useActualizarAmenaza(id ?? "");

  const errorMessage = isAxiosError(actualizarAmenaza.error)
    ? (actualizarAmenaza.error.response?.data as { error?: string } | undefined)?.error ??
      "No se pudieron guardar los cambios"
    : actualizarAmenaza.error
    ? "No se pudieron guardar los cambios"
    : null;

  if (isLoading) {
    return <p className="p-8 text-sm text-muted">Cargando amenaza...</p>;
  }

  if (isError || !amenaza) {
    return <p className="p-8 text-sm text-red-600">No se pudo cargar la amenaza.</p>;
  }

  if (!amenaza.esPropia) {
    return (
      <main className="mx-auto max-w-lg px-4 py-8">
        <h1 className="text-lg font-semibold text-ink">Amenaza del catálogo global</h1>
        <p className="mt-4 text-sm text-muted">
          "{amenaza.nombre}" pertenece al catálogo global y es de solo lectura para tu
          organización.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-lg font-semibold text-ink">Editar amenaza</h1>
      <div className="mt-6">
        <ThreatForm
          amenaza={amenaza}
          isSubmittingRequest={actualizarAmenaza.isPending}
          errorMessage={errorMessage}
          onSubmit={(values) => {
            actualizarAmenaza.mutate(values, {
              onSuccess: () => navigate("/amenazas", { replace: true }),
            });
          }}
        />
      </div>
    </main>
  );
}
