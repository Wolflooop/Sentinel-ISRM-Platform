import { useState } from "react";
import { useResolucionesRiesgo, useCrearResolucion } from "../hooks/useRiskResolutions";

interface Props {
  riesgoId: string;
  estadoActual: string;
}

// V2 (punto 9 del prompt): historial 1:N — un riesgo puede resolverse,
// reabrirse y volver a resolverse. El botón disponible depende únicamente
// del estado actual del riesgo.
export function ResolutionPanel({ riesgoId, estadoActual }: Props) {
  const [justificacion, setJustificacion] = useState("");
  const { data: resoluciones, isLoading } = useResolucionesRiesgo(riesgoId);
  const crear = useCrearResolucion(riesgoId);

  const puedeResolver = estadoActual !== "CERRADO";
  const puedeReabrir = estadoActual === "CERRADO";

  return (
    <div className="rounded-md border border-slate-200 p-4">
      <h3 className="text-sm font-semibold text-slate-800">Resolución del riesgo</h3>

      <textarea
        value={justificacion}
        onChange={(e) => setJustificacion(e.target.value)}
        placeholder="Justificación..."
        rows={2}
        className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
      />

      <div className="mt-2 flex gap-2">
        {puedeResolver && (
          <button
            type="button"
            disabled={crear.isPending || !justificacion.trim()}
            onClick={() =>
              crear.mutate(
                { tipo: "RESOLUCION", justificacion },
                { onSuccess: () => setJustificacion("") }
              )
            }
            className="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
          >
            Marcar como resuelto
          </button>
        )}
        {puedeReabrir && (
          <button
            type="button"
            disabled={crear.isPending || !justificacion.trim()}
            onClick={() =>
              crear.mutate(
                { tipo: "REAPERTURA", justificacion },
                { onSuccess: () => setJustificacion("") }
              )
            }
            className="rounded-md border border-amber-400 px-3 py-1.5 text-sm font-medium text-amber-700 disabled:opacity-60"
          >
            Reabrir riesgo
          </button>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {isLoading && <p className="text-sm text-slate-400">Cargando historial de resoluciones...</p>}
        {resoluciones?.map((r) => (
          <div key={r.id} className="border-b border-slate-100 pb-2 text-sm">
            <p className="font-medium text-slate-800">
              {r.tipo === "RESOLUCION" ? "Resuelto" : "Reabierto"}
            </p>
            <p className="text-slate-600">{r.justificacion}</p>
            <p className="mt-1 text-xs text-slate-400">
              {r.usuario.nombre} · {new Date(r.fecha).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
