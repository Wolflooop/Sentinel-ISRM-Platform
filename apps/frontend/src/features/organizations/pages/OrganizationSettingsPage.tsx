import { useState } from "react";
import { useOrganizacionActual, useActualizarOrganizacionActual, useCambiarEstadoOrganizacionActual } from "../hooks/useOrganization";
import { OrganizationForm } from "../components/OrganizationForm";
import { OrganizationStatusPanel } from "../components/OrganizationStatusPanel";
import { ActualizarOrganizacionFormValues } from "../schemas/organizationsSchema";
import { EstadoOrganizacion } from "../types/organizations.types";

export function OrganizationSettingsPage() {
  const { data: organizacion, isLoading, isError } = useOrganizacionActual();
  const actualizarMutation = useActualizarOrganizacionActual();
  const cambiarEstadoMutation = useCambiarEstadoOrganizacionActual();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSubmit(values: ActualizarOrganizacionFormValues) {
    setErrorMessage(null);
    actualizarMutation.mutate(values, {
      onError: () => setErrorMessage("No se pudo guardar la organización."),
    });
  }

  function handleCambiarEstado(estado: EstadoOrganizacion) {
    setErrorMessage(null);
    cambiarEstadoMutation.mutate(estado, {
      onError: () => setErrorMessage("No se pudo cambiar el estado de la organización."),
    });
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-lg font-semibold text-ink">Mi organización</h1>

      {isLoading && <p className="mt-4 text-sm text-muted">Cargando organización...</p>}
      {isError && (
        <p className="mt-4 text-sm text-red-600">No se pudo cargar la organización.</p>
      )}

      {organizacion && (
        <div className="mt-6 space-y-6">
          <OrganizationStatusPanel
            organizacion={organizacion}
            onCambiarEstado={handleCambiarEstado}
            isSubmittingRequest={cambiarEstadoMutation.isPending}
          />

          <div className="rounded-md border border-border p-4">
            <h2 className="mb-4 text-sm font-semibold text-ink">Datos generales</h2>
            <OrganizationForm
              organizacion={organizacion}
              onSubmit={handleSubmit}
              isSubmittingRequest={actualizarMutation.isPending}
              errorMessage={errorMessage}
            />
          </div>
        </div>
      )}
    </main>
  );
}
