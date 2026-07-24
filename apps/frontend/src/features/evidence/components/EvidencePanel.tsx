import { useRef } from "react";
import { useEvidencias, useSubirEvidencia, useValidarEvidencia } from "../hooks/useEvidence";
import { DestinoEvidencia } from "../types/evidence.types";
import { urlDescargaEvidencia } from "../services/evidenceService";
import { apiClient } from "../../../lib/apiClient";

interface Props {
  destino: DestinoEvidencia;
  puedeValidar?: boolean;
  /** Si el usuario actual puede subir evidencia (responsable actual del
   * registro, o Administrador TIC). Por defecto true para no romper usos
   * existentes fuera del detalle de riesgo. */
  puedeGestionar?: boolean;
}

const ESTILO_ESTADO: Record<string, string> = {
  SUBIDA: "bg-slate-100 text-slate-700",
  VALIDADA: "bg-green-100 text-green-800",
  RECHAZADA: "bg-red-100 text-red-800",
};

export function EvidencePanel({ destino, puedeValidar = false, puedeGestionar = true }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: evidencias, isLoading } = useEvidencias(destino);
  const subir = useSubirEvidencia(destino);
  const validar = useValidarEvidencia(destino);

  async function descargar(id: string, nombreArchivo: string) {
    const respuesta = await apiClient.get(urlDescargaEvidencia(id), { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([respuesta.data]));
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-md border border-border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Evidencias</h3>
        {puedeGestionar && (
          <div>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const archivo = e.target.files?.[0];
                if (archivo) subir.mutate(archivo);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={subir.isPending}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-on-primary disabled:opacity-60"
            >
              {subir.isPending ? "Subiendo..." : "Subir evidencia"}
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 space-y-2">
        {isLoading && <p className="text-sm text-muted">Cargando evidencias...</p>}
        {evidencias?.length === 0 && <p className="text-sm text-muted">Sin evidencias aún.</p>}
        {evidencias?.map((e) => (
          <div key={e.id} className="flex items-center justify-between border-b border-border pb-2 text-sm">
            <div>
              <button
                type="button"
                onClick={() => descargar(e.id, e.nombreArchivo)}
                className="text-ink underline"
              >
                {e.nombreArchivo}
              </button>
              <p className="mt-1 text-xs text-muted">
                {e.subidoPor.nombre} · {new Date(e.creadoEn).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ESTILO_ESTADO[e.estado]}`}>
                {e.estado}
              </span>
              {puedeValidar && e.estado === "SUBIDA" && (
                <>
                  <button
                    type="button"
                    onClick={() => validar.mutate({ id: e.id, estado: "VALIDADA" })}
                    className="rounded-md border border-green-300 px-2 py-1 text-xs font-medium text-green-700"
                  >
                    Validar
                  </button>
                  <button
                    type="button"
                    onClick={() => validar.mutate({ id: e.id, estado: "RECHAZADA" })}
                    className="rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-700"
                  >
                    Rechazar
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
