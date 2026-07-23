import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { useControl, useActualizarControl, useHistorialControl } from "../hooks/useControls";
import { Timeline } from "../../../components/Timeline";
import { CommentsPanel } from "../../comments/components/CommentsPanel";
import { FollowUpsPanel } from "../../follow-ups/components/FollowUpsPanel";
import { EvidencePanel } from "../../evidence/components/EvidencePanel";

const estados = ["NO_INICIADO", "EN_PROGRESO", "IMPLEMENTADO", "VERIFICADO"] as const;

const ETIQUETA_ESTADO_CONTROL: Record<string, string> = {
  NO_INICIADO: "No iniciado",
  EN_PROGRESO: "En progreso",
  IMPLEMENTADO: "Implementado",
  VERIFICADO: "Verificado",
};

export function ControlDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: control, isLoading, isError } = useControl(id);
  const { data: historial } = useHistorialControl(id);
  const actualizarControl = useActualizarControl(id ?? "");
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<string | null>(null);
  const [comentario, setComentario] = useState("");
  const [errorComentario, setErrorComentario] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!control) return;
    const form = event.currentTarget;
    const estado = (form.elements.namedItem("estado") as HTMLSelectElement).value;
    const cambiaEstado = estado !== control.estadoImplementacion;

    // Comentario obligatorio SOLO cuando el estado realmente cambia (ver
    // Objetivo 3). Ediciones sin cambiar el estado no lo requieren.
    if (cambiaEstado && !comentario.trim()) {
      setErrorComentario("No puede cambiar el estado sin ingresar un comentario.");
      return;
    }
    setErrorComentario(null);

    actualizarControl.mutate(
      {
        estadoImplementacion: estado as typeof estados[number],
        ...(cambiaEstado ? { comentario: comentario.trim() } : {}),
      },
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

  const errorServidor = isAxiosError(actualizarControl.error)
    ? (actualizarControl.error.response?.data as { error?: string } | undefined)?.error
    : null;

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
            <dt className="font-medium text-slate-700">Responsable</dt>
            <dd className="mt-1">{control.responsable?.nombre ?? "Sin asignar"}</dd>
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
              <form className="mt-3 flex flex-col gap-3" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <select
                    name="estado"
                    defaultValue={control.estadoImplementacion}
                    onChange={(e) => setEstadoSeleccionado(e.target.value)}
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
                </div>

                {/* Ver Objetivo 3: obligatorio solo cuando el estado cambia
                    respecto al valor actual; en modificaciones menores no
                    aplica (aquí no hay otros campos editables en esta
                    pantalla, así que el único caso relevante es el cambio
                    de estado). */}
                {(estadoSeleccionado ?? control.estadoImplementacion) !== control.estadoImplementacion && (
                  <div>
                    <label htmlFor="comentario" className="block text-sm font-medium text-slate-700">
                      Comentario (obligatorio al cambiar de estado)
                    </label>
                    <textarea
                      id="comentario"
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      rows={2}
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      placeholder="Ej: Control aplicado correctamente."
                    />
                  </div>
                )}
              </form>
              {errorComentario && <p className="mt-2 text-sm text-red-600">{errorComentario}</p>}
              {actualizarControl.isError && !errorComentario && (
                <p className="mt-2 text-sm text-red-600">
                  {errorServidor ?? "No se pudo actualizar el estado del control."}
                </p>
              )}
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              Este control pertenece al catálogo global y es de solo lectura para tu organización.
            </p>
          )}
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-ink">Historial del control</h2>
          <div className="mt-3">
            <Timeline
              entradas={historial ?? []}
              etiquetaEstado={(e) => ETIQUETA_ESTADO_CONTROL[e] ?? e}
            />
          </div>
        </div>
      </div>

      {id && (
        <div className="mt-8 grid gap-6">
          <CommentsPanel destino={{ controlId: id }} />
          <FollowUpsPanel destino={{ controlId: id }} />
          <EvidencePanel destino={{ controlId: id }} puedeValidar />
        </div>
      )}
    </main>
  );
}
