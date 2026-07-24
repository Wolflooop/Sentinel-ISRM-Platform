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
    <div className="rounded-md border border-border p-4">
      <h3 className="text-sm font-semibold text-ink">Resolución del riesgo</h3>

      <textarea
        value={justificacion}
        onChange={(e) => setJustificacion(e.target.value)}
        placeholder="Justificación..."
        rows={2}
        className="mt-3 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
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
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-on-primary disabled:opacity-60"
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
        {isLoading && <p className="text-sm text-muted">Cargando historial de resoluciones...</p>}
        {resoluciones?.map((r) => (
          <div key={r.id} className="border-b border-border pb-2 text-sm">
            <p className="font-medium text-ink">
              {r.tipo === "RESOLUCION" ? "Resuelto" : "Reabierto"}
            </p>
            <p className="text-muted">{r.justificacion}</p>
            <p className="mt-1 text-xs text-muted">
              {r.usuario.nombre} · {new Date(r.fecha).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
