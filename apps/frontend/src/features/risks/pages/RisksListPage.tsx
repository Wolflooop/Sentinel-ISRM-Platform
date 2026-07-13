import { useState } from "react";
import { Link } from "react-router-dom";
import { useRiesgos } from "../hooks/useRisks";
import { RisksTable } from "../components/RisksTable";
import { RisksFilterBar } from "../components/RisksFilterBar";
import { FiltrosRiesgos } from "../types/risks.types";

export function RisksListPage() {
  const [filtros, setFiltros] = useState<FiltrosRiesgos>({});
  const { data: riesgos, isLoading, isError } = useRiesgos(filtros);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-800">Riesgos</h1>
        <div className="flex items-center gap-3">
          <Link
            to="/riesgos/matriz"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Ver matriz
          </Link>
          <Link
            to="/riesgos/nuevo"
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white"
          >
            Nuevo riesgo
          </Link>
        </div>
      </div>

      <div className="mt-4">
        <RisksFilterBar filtros={filtros} onChange={setFiltros} />
      </div>

      {isLoading && <p className="mt-4 text-sm text-slate-500">Cargando riesgos...</p>}
      {isError && <p className="mt-4 text-sm text-red-600">No se pudieron cargar los riesgos.</p>}
      {riesgos && (
        <div className="mt-4">
          <RisksTable riesgos={riesgos} />
        </div>
      )}
    </main>
  );
}
