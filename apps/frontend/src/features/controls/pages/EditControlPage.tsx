import { useParams, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { useControl, useActualizarControl } from "../hooks/useControls";
import { ControlForm } from "../components/ControlForm";
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

export function EditControlPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: control, isLoading, isError } = useControl(id);
  const actualizarControl = useActualizarControl(id ?? "");

  const errorMessage = isAxiosError(actualizarControl.error)
    ? (actualizarControl.error.response?.data as { error?: string } | undefined)?.error ??
      "No se pudieron guardar los cambios"
    : actualizarControl.error
    ? "No se pudieron guardar los cambios"
    : null;

  if (isLoading) {
    return <p className="p-8 text-sm text-slate-500">Cargando control...</p>;
  }

  if (isError || !control) {
    return <p className="p-8 text-sm text-red-600">No se pudo cargar el control.</p>;
  }


  if (!control.esPropia) {
    return (
      <main className="mx-auto max-w-lg px-4 py-8">
        <h1 className="text-lg font-semibold text-slate-800">Control del catálogo global</h1>
        <p className="mt-4 text-sm text-slate-500">
          "{control.nombre}" pertenece al catálogo global y es de solo lectura.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-lg font-semibold text-slate-800">Editar control</h1>
      <div className="mt-6">
        <ControlForm
          control={control}
          isSubmittingRequest={actualizarControl.isPending}
          errorMessage={errorMessage}
          onSubmit={(values) => {
            actualizarControl.mutate(normalizar(values), {
              onSuccess: () => navigate(`/controles/${id}`, { replace: true }),
            });
          }}
        />
      </div>
    </main>
  );
}
