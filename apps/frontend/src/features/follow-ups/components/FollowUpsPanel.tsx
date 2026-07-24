import { useState } from "react";
import { useSeguimientos, useCrearSeguimiento } from "../hooks/useFollowUps";
import { DestinoSeguimiento } from "../types/follow-ups.types";

interface Props {
  destino: DestinoSeguimiento;
  /** Si el usuario actual puede registrar seguimientos (responsable actual
   * del registro, o Administrador TIC). Por defecto true para no romper
   * usos existentes fuera del detalle de riesgo. */
  puedeGestionar?: boolean;
}

export function FollowUpsPanel({ destino, puedeGestionar = true }: Props) {
  const [descripcion, setDescripcion] = useState("");
  const { data: seguimientos, isLoading } = useSeguimientos(destino);
  const crear = useCrearSeguimiento(destino);

  return (
    <div className="rounded-md border border-border p-4">
      <h3 className="text-sm font-semibold text-ink">Seguimientos</h3>

      {puedeGestionar && (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!descripcion.trim()) return;
            crear.mutate(descripcion, { onSuccess: () => setDescripcion("") });
          }}
        >
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Registrar un seguimiento..."
            className="flex-1 rounded-md border border-border bg-surface-elevated px-3 py-1.5 text-sm text-ink placeholder:text-muted"
          />
          <button
            type="submit"
            disabled={crear.isPending}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-on-primary disabled:opacity-60"
          >
            Registrar
          </button>
        </form>
      )}

      <div className="mt-3 space-y-3">
        {isLoading && <p className="text-sm text-muted">Cargando seguimientos...</p>}
        {seguimientos?.length === 0 && <p className="text-sm text-muted">Sin seguimientos aún.</p>}
        {seguimientos?.map((s) => (
          <div key={s.id} className="border-b border-border pb-2 text-sm">
            <p className="text-ink">{s.descripcion}</p>
            <p className="mt-1 text-xs text-muted">
              {s.usuario.nombre} · {new Date(s.fecha).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
