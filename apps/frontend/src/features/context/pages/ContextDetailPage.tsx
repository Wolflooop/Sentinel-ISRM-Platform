import { useState } from "react";
import { useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import {
  useContexto,
  useActualizarContexto,
  useReemplazarEscalaImpacto,
  useReemplazarEscalaProbabilidad,
  useReemplazarMatriz,
} from "../hooks/useContext";
import { ContextForm } from "../components/ContextForm";
import { EscalaEditor } from "../components/EscalaEditor";
import { MatrizEditor } from "../components/MatrizEditor";
import { ContextStatusPanel } from "../components/ContextStatusPanel";

function extraerErrorMessage(error: unknown, fallback: string): string | null {
  if (isAxiosError(error)) {
    return (error.response?.data as { error?: string } | undefined)?.error ?? fallback;
  }
  return error ? fallback : null;
}

export function ContextDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: contexto, isLoading, isError } = useContexto(id);

  const actualizarContexto = useActualizarContexto(id ?? "");
  const reemplazarImpacto = useReemplazarEscalaImpacto(id ?? "");
  const reemplazarProbabilidad = useReemplazarEscalaProbabilidad(id ?? "");
  const reemplazarMatriz = useReemplazarMatriz(id ?? "");

  const [mensajeGuardado, setMensajeGuardado] = useState<string | null>(null);

  if (isLoading) {
    return <p className="p-8 text-sm text-muted">Cargando contexto...</p>;
  }

  if (isError || !contexto) {
    return <p className="p-8 text-sm text-red-600">No se pudo cargar el contexto.</p>;
  }

  const disabled = contexto.activo;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-lg font-semibold text-ink">Contexto ISO</h1>
      {disabled && (
        <p className="mt-1 text-xs text-amber-700">
          Este contexto está activo: su configuración (escalas y matriz) no puede modificarse.
        </p>
      )}

      <div className="mt-6 space-y-6">
        <ContextStatusPanel contexto={contexto} />

        <div className="rounded-md border border-border p-4">
          <h2 className="mb-4 text-sm font-semibold text-ink">Alcance y criterios</h2>
          <ContextForm
            contexto={contexto}
            isSubmittingRequest={actualizarContexto.isPending}
            errorMessage={extraerErrorMessage(
              actualizarContexto.error,
              "No se pudieron guardar los cambios"
            )}
            onSubmit={(values) => {
              setMensajeGuardado(null);
              actualizarContexto.mutate(values, {
                onSuccess: () => setMensajeGuardado("Cambios guardados."),
              });
            }}
          />
          {mensajeGuardado && (
            <p className="mt-2 text-sm text-green-700">{mensajeGuardado}</p>
          )}
        </div>

        <div className="rounded-md border border-border p-4">
          <EscalaEditor
            titulo="Escala de impacto"
            escalasExistentes={contexto.escalasImpacto}
            disabled={disabled}
            isSubmittingRequest={reemplazarImpacto.isPending}
            errorMessage={extraerErrorMessage(
              reemplazarImpacto.error,
              "No se pudo guardar la escala de impacto"
            )}
            onSubmit={(values) => reemplazarImpacto.mutate(values)}
          />
        </div>

        <div className="rounded-md border border-border p-4">
          <EscalaEditor
            titulo="Escala de probabilidad"
            escalasExistentes={contexto.escalasProbabilidad}
            disabled={disabled}
            isSubmittingRequest={reemplazarProbabilidad.isPending}
            errorMessage={extraerErrorMessage(
              reemplazarProbabilidad.error,
              "No se pudo guardar la escala de probabilidad"
            )}
            onSubmit={(values) => reemplazarProbabilidad.mutate(values)}
          />
        </div>

        <div className="rounded-md border border-border p-4">
          <MatrizEditor
            celdasExistentes={contexto.matriz}
            disabled={disabled}
            isSubmittingRequest={reemplazarMatriz.isPending}
            errorMessage={extraerErrorMessage(
              reemplazarMatriz.error,
              "No se pudo guardar la matriz de riesgo"
            )}
            onSubmit={(values) => reemplazarMatriz.mutate(values)}
          />
        </div>
      </div>
    </main>
  );
}
