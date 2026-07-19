interface TimelineEntrada {
  id: string;
  estadoAnterior: string | null;
  estadoNuevo: string;
  comentario: string | null;
  createdAt: string;
  usuario: { nombre: string; rol: string };
}

interface Props {
  entradas: TimelineEntrada[];
  // Traduce el valor crudo del enum (p. ej. "EN_ANALISIS") a una etiqueta
  // legible (p. ej. "En análisis"). Si no se provee, se muestra tal cual.
  etiquetaEstado?: (estado: string) => string;
}

/**
 * Timeline minimalista de cambios de estado (riesgo o control). Puramente
 * de presentación: solo renderiza lo que el backend ya devuelve en orden
 * cronológico ascendente. Usa las mismas clases de color por variable CSS
 * que el resto de la app, para funcionar igual en modo claro y oscuro.
 *
 * Cada entrada muestra siempre: Usuario, Rol, Fecha, Hora, Estado anterior,
 * Estado nuevo y Comentario (cuando existe).
 */
export function Timeline({ entradas, etiquetaEstado }: Props) {
  const etiqueta = (estado: string) => etiquetaEstado?.(estado) ?? estado;

  if (entradas.length === 0) {
    return <p className="text-sm text-muted">Todavía no hay historial registrado.</p>;
  }

  return (
    <ol className="space-y-4 border-l-2 border-border pl-4">
      {entradas.map((entrada) => {
        const fecha = new Date(entrada.createdAt);
        return (
          <li key={entrada.id} className="relative">
            <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
            <p className="text-xs text-muted">
              {entrada.usuario.nombre} ({entrada.usuario.rol}) — {fecha.toLocaleDateString()} a las{" "}
              {fecha.toLocaleTimeString()}
            </p>
            {entrada.estadoAnterior === null ? (
              <p className="mt-0.5 text-sm font-medium text-ink">
                Creado por {entrada.usuario.nombre}
              </p>
            ) : (
              <p className="mt-0.5 text-sm font-medium text-ink">
                Estado: {etiqueta(entrada.estadoAnterior)} → {etiqueta(entrada.estadoNuevo)}
              </p>
            )}
            {entrada.comentario && (
              <p className="mt-1 text-sm text-muted">{entrada.comentario}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
