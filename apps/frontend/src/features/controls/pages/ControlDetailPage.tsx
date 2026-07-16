import { useNavigate, useParams } from "react-router-dom";
import { useControl, useActualizarControl } from "../hooks/useControls";

const estados = ["NO_APLICADO", "PLANIFICADO", "EN_PROGRESO", "IMPLEMENTADO"] as const;

export function ControlDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: control, isLoading, isError } = useControl(id);
  const actualizarControl = useActualizarControl(id ?? "");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const estado = (form.elements.namedItem("estado") as HTMLSelectElement).value;

    actualizarControl.mutate(
      { estadoImplementacion: estado as typeof estados[number] },
      {
        onSuccess: () => navigate("/controles", { replace: true }),
      }
    );
  };

  if (isLoading) {
    return <p className="px-4 py-8 text-sm text-slate-500">Cargando control...</p>;
  }

  if (isError || !control) {
    return <p className="px-4 py-8 text-sm text-red-600">No se pudo cargar el control.</p>;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">{control.nombre}</h1>
            <p className="mt-1 text-sm text-slate-500">{control.codigoIso27001 ?? "Sin código ISO 27001"}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            {control.tipo}
          </span>
        </div>

        <dl className="mt-6 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-700">Estado</dt>
            <dd className="mt-1">{control.estadoImplementacion}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-700">Organización</dt>
            <dd className="mt-1">{control.organizacion?.nombre ?? "Sin organización"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-700">Fecha de implementación</dt>
            <dd className="mt-1">{control.fechaImplementacion ?? "No definida"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-700">Descripción</dt>
            <dd className="mt-1">{control.descripcionImplementacion ?? "Sin descripción"}</dd>
          </div>
        </dl>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold text-slate-800">Actualizar estado</h2>
          {control.esPropia ? (
            <>
              <form className="mt-3 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
                <select
                  name="estado"
                  defaultValue={control.estadoImplementacion}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  {estados.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={actualizarControl.isPending}
                  className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {actualizarControl.isPending ? "Guardando..." : "Guardar cambios"}
                </button>
              </form>
              {actualizarControl.isError && (
                <p className="mt-2 text-sm text-red-600">No se pudo actualizar el estado del control.</p>
              )}
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              Este control pertenece al catálogo global y es de solo lectura para tu organización.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
