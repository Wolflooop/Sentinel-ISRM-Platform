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
    <div className="rounded-md border border-border p-4">
      <h3 className="text-sm font-semibold text-ink">Comentarios</h3>

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
          className="flex-1 rounded-md border border-border bg-surface-elevated px-3 py-1.5 text-sm text-ink placeholder:text-muted"
        />
        <button
          type="submit"
          disabled={crear.isPending}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-on-primary disabled:opacity-60"
        >
          Enviar
        </button>
      </form>

      <div className="mt-3 space-y-3">
        {isLoading && <p className="text-sm text-muted">Cargando comentarios...</p>}
        {comentarios?.length === 0 && <p className="text-sm text-muted">Sin comentarios aún.</p>}
        {comentarios?.map((c) => (
          <div key={c.id} className="border-b border-border pb-2 text-sm">
            <p className="text-ink">{c.contenido}</p>
            <p className="mt-1 text-xs text-muted">
              {c.usuario.nombre} · {new Date(c.creadoEn).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
