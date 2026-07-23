import { useState } from "react";
import { useComentarios, useCrearComentario } from "../hooks/useComments";
import { DestinoComentario } from "../types/comments.types";

interface Props {
  destino: DestinoComentario;
}

export function CommentsPanel({ destino }: Props) {
  const [contenido, setContenido] = useState("");
  const { data: comentarios, isLoading } = useComentarios(destino);
  const crear = useCrearComentario(destino);

  return (
    <div className="rounded-md border border-slate-200 p-4">
      <h3 className="text-sm font-semibold text-slate-800">Comentarios</h3>

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!contenido.trim()) return;
          crear.mutate(contenido, { onSuccess: () => setContenido("") });
        }}
      >
        <input
          type="text"
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          placeholder="Escribe un comentario..."
          className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={crear.isPending}
          className="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
        >
          Enviar
        </button>
      </form>

      <div className="mt-3 space-y-3">
        {isLoading && <p className="text-sm text-slate-400">Cargando comentarios...</p>}
        {comentarios?.length === 0 && <p className="text-sm text-slate-400">Sin comentarios aún.</p>}
        {comentarios?.map((c) => (
          <div key={c.id} className="border-b border-slate-100 pb-2 text-sm">
            <p className="text-slate-800">{c.contenido}</p>
            <p className="mt-1 text-xs text-slate-400">
              {c.usuario.nombre} · {new Date(c.creadoEn).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
