import { useState } from "react";
import { isAxiosError } from "axios";
import { Contexto } from "../types/context.types";
import { useActivarContexto } from "../hooks/useContext";

interface Props {
  contexto: Contexto;
}

export function ContextStatusPanel({ contexto }: Props) {
  const activarMutation = useActivarContexto(contexto.id);
  const [confirmando, setConfirmando] = useState(false);

  const errorMessage = isAxiosError(activarMutation.error)
    ? (activarMutation.error.response?.data as { error?: string } | undefined)?.error ??
      "No se pudo activar el contexto"
    : activarMutation.error
    ? "No se pudo activar el contexto"
    : null;

  return (
    <div className="rounded-md border border-border p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">Estado</h2>
        <span
          className={
            contexto.activo
              ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800"
              : "rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
          }
        >
          {contexto.activo ? "Activo" : "Inactivo"}
        </span>
      </div>

      {!contexto.activo && (
        <div className="mt-3">
          {!confirmando ? (
            <button
              type="button"
              onClick={() => setConfirmando(true)}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary"
            >
              Activar contexto
            </button>
          ) : (
            <div className="space-y-2 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
              <p>
                Activar este contexto desactivará automáticamente cualquier otro contexto activo
                de la organización. Requiere las 5 escalas de impacto, las 5 de probabilidad y las
                25 combinaciones de la matriz de riesgo ya guardadas.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={activarMutation.isPending}
                  onClick={() => activarMutation.mutate()}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-on-primary disabled:opacity-60"
                >
                  {activarMutation.isPending ? "Activando..." : "Confirmar activación"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmando(false)}
                  className="rounded-md border border-border px-3 py-1.5 text-xs text-ink"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
          {errorMessage && <p className="mt-2 text-xs text-red-600">{errorMessage}</p>}
        </div>
      )}
    </div>
  );
}
