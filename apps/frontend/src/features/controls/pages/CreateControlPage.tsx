import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { ControlForm } from "../components/ControlForm";
import { useCrearControl } from "../hooks/useControls";
import { ControlFormValues } from "../schemas/controlsSchema";

function normalizar(input: ControlFormValues) {
  return {
    codigoIso27001: input.codigoIso27001?.trim() || undefined,
    nombre: input.nombre.trim(),
    tipo: input.tipo,
    estadoImplementacion: input.estadoImplementacion,
    fechaImplementacion: input.fechaImplementacion?.trim() || null,
    descripcionImplementacion: input.descripcionImplementacion?.trim() || undefined,
    observaciones: input.observaciones?.trim() || undefined,
    responsableId: input.responsableId?.trim() || null,
  };
}

export function CreateControlPage() {
  const navigate = useNavigate();
  const crearControl = useCrearControl();

  const errorMessage = isAxiosError(crearControl.error)
    ? (crearControl.error.response?.data as { error?: string } | undefined)?.error ??
      "No se pudo crear el control"
    : crearControl.error
    ? "No se pudo crear el control"
    : null;

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-lg font-semibold text-ink">Nuevo control</h1>
      <div className="mt-6">
        <ControlForm
          isSubmittingRequest={crearControl.isPending}
          errorMessage={errorMessage}
          onSubmit={(values) => {
            crearControl.mutate(normalizar(values), {
              onSuccess: () => navigate("/controles", { replace: true }),
            });
          }}
        />
      </div>
    </main>
  );
}
