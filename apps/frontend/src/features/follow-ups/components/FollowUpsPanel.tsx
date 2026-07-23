import { useState } from "react";
import { useSeguimientos, useCrearSeguimiento } from "../hooks/useFollowUps";
import { DestinoSeguimiento } from "../types/follow-ups.types";

interface Props {
  destino: DestinoSeguimiento;
}

export function FollowUpsPanel({ destino }: Props) {
  const [descripcion, setDescripcion] = useState("");
  const { data: seguimientos, isLoading } = useSeguimientos(destino);
  const crear = useCrearSeguimiento(destino);

  return (
    <div className="rounded-md border border-slate-200 p-4">
      <h3 className="text-sm font-semibold text-slate-800">Seguimientos</h3>

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
          className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={crear.isPending}
          className="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
        >
          Registrar
        </button>
      </form>

      <div className="mt-3 space-y-3">
        {isLoading && <p className="text-sm text-slate-400">Cargando seguimientos...</p>}
        {seguimientos?.length === 0 && <p className="text-sm text-slate-400">Sin seguimientos aún.</p>}
        {seguimientos?.map((s) => (
          <div key={s.id} className="border-b border-slate-100 pb-2 text-sm">
            <p className="text-slate-800">{s.descripcion}</p>
            <p className="mt-1 text-xs text-slate-400">
              {s.usuario.nombre} · {new Date(s.fecha).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
