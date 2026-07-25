import { useState } from "react";
import { isAxiosError } from "axios";
import { useOrganizaciones, useCrearOrganizacion } from "../hooks/useOrganization";
import { CreateOrganizationForm } from "../components/CreateOrganizationForm";
import { CrearOrganizacionFormValues } from "../schemas/organizationsSchema";
import { ConPermiso } from "../../../components/ConPermiso";

const ETIQUETA_ESTADO: Record<string, string> = {
  ACTIVA: "Activa",
  SUSPENDIDA: "Suspendida",
  INACTIVA: "Inactiva",
};

export function OrganizationsListPage() {
  const { data: organizaciones, isLoading, isError } = useOrganizaciones();
  const crearOrganizacion = useCrearOrganizacion();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const errorMensajeMutacion = isAxiosError(crearOrganizacion.error)
    ? (crearOrganizacion.error.response?.data as { error?: string } | undefined)?.error ??
      "No se pudo crear la organización"
    : crearOrganizacion.error
    ? "No se pudo crear la organización"
    : null;

  function handleSubmit(values: CrearOrganizacionFormValues) {
    setErrorMessage(null);
    crearOrganizacion.mutate(
      {
        ...values,
        correoContacto: values.correoContacto === "" ? undefined : values.correoContacto,
      },
      {
        onSuccess: () => setMostrarFormulario(false),
        onError: () => setErrorMessage(errorMensajeMutacion),
      }
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-ink">Organizaciones</h1>
          <p className="text-sm text-muted">
            Administración global de la plataforma — exclusiva del Administrador Principal.
          </p>
        </div>
        <ConPermiso recurso="organizaciones" accion="crear">
          <button
            type="button"
            onClick={() => setMostrarFormulario((valor) => !valor)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary-hover"
          >
            {mostrarFormulario ? "Cancelar" : "Nueva organización"}
          </button>
        </ConPermiso>
      </div>

      {mostrarFormulario && (
        <div className="mt-6 rounded-md border border-border p-4">
          <CreateOrganizationForm
            onSubmit={handleSubmit}
            isSubmittingRequest={crearOrganizacion.isPending}
            errorMessage={errorMessage}
          />
        </div>
      )}

      {isLoading && <p className="mt-4 text-sm text-muted">Cargando organizaciones...</p>}
      {isError && (
        <p className="mt-4 text-sm text-red-600">No se pudieron cargar las organizaciones.</p>
      )}

      {organizaciones && (
        <div className="mt-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="py-2 pr-4">Nombre</th>
                <th className="py-2 pr-4">Sector</th>
                <th className="py-2 pr-4">Tamaño</th>
                <th className="py-2 pr-4">País</th>
                <th className="py-2 pr-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              {organizaciones.map((organizacion) => (
                <tr key={organizacion.id} className="border-b border-border/60">
                  <td className="py-2 pr-4 font-medium text-ink">{organizacion.nombre}</td>
                  <td className="py-2 pr-4 text-muted">{organizacion.sector}</td>
                  <td className="py-2 pr-4 text-muted">{organizacion.tamano}</td>
                  <td className="py-2 pr-4 text-muted">{organizacion.paisIso}</td>
                  <td className="py-2 pr-4 text-muted">
                    {ETIQUETA_ESTADO[organizacion.estado] ?? organizacion.estado}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
