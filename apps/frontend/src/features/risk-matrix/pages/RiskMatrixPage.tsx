import { Link } from "react-router-dom";
import { useContextoActivo } from "../../context/hooks/useContext";
import { useRiesgos } from "../../risks/hooks/useRisks";
import { RiskMatrixGrid } from "../components/RiskMatrixGrid";

export function RiskMatrixPage() {
  const { data: contexto, isLoading: cargandoContexto, isError: errorContexto } = useContextoActivo();
  const { data: riesgos, isLoading: cargandoRiesgos, isError: errorRiesgos } = useRiesgos({});

  const cargando = cargandoContexto || cargandoRiesgos;
  const error = errorContexto || errorRiesgos;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Matriz de riesgos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Distribución de los riesgos identificados según su probabilidad e impacto.
          </p>
        </div>
        <Link to="/riesgos" className="text-sm font-medium text-slate-600 hover:text-slate-800">
          ← Volver a riesgos
        </Link>
      </div>

      {cargando && <p className="mt-6 text-sm text-slate-500">Cargando matriz de riesgos...</p>}

      {error && (
        <p className="mt-6 text-sm text-red-600">
          No se pudo cargar la matriz de riesgos. Intenta recargar la página.
        </p>
      )}

      {!cargando && !error && !contexto && (
        <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-600">No hay un contexto ISO/IEC 27005 activo para tu organización.</p>
          <p className="mt-1 text-sm text-slate-500">
            Configura la matriz de riesgo en el módulo de Contexto antes de visualizarla aquí.
          </p>
          <Link
            to="/contexto"
            className="mt-4 inline-block rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white"
          >
            Ir a Contexto
          </Link>
        </div>
      )}

      {!cargando && !error && contexto && contexto.matriz.length === 0 && (
        <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-600">
            El contexto activo aún no tiene una matriz de riesgo configurada.
          </p>
          <Link
            to={`/contexto/${contexto.id}`}
            className="mt-4 inline-block rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white"
          >
            Configurar matriz
          </Link>
        </div>
      )}

      {!cargando && !error && contexto && contexto.matriz.length > 0 && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <RiskMatrixGrid
            matriz={contexto.matriz}
            escalasProbabilidad={contexto.escalasProbabilidad}
            escalasImpacto={contexto.escalasImpacto}
            riesgos={riesgos ?? []}
          />
          {riesgos && riesgos.length === 0 && (
            <p className="mt-4 text-center text-sm text-slate-500">
              Aún no hay riesgos registrados para ubicar en la matriz.
            </p>
          )}
        </div>
      )}
    </main>
  );
}
