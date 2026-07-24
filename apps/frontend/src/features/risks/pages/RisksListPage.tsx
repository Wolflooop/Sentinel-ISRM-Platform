import { useState } from "react";
import { Link } from "react-router-dom";
import { useRiesgos } from "../hooks/useRisks";
import { RisksTable } from "../components/RisksTable";
import { RisksFilterBar } from "../components/RisksFilterBar";
import { FiltrosRiesgos } from "../types/risks.types";
import { ConPermiso } from "../../../components/ConPermiso";

export function RisksListPage() {
  const [filtros, setFiltros] = useState<FiltrosRiesgos>({});
  const { data: riesgos, isLoading, isError } = useRiesgos(filtros);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-ink">Riesgos</h1>
        <div className="flex items-center gap-3">
          <Link
            to="/riesgos/matriz"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-surface"
          >
            Ver matriz
          </Link>
          <ConPermiso recurso="riesgos" accion="crear">
            <Link
              to="/riesgos/nuevo"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary"
            >
              Nuevo riesgo
            </Link>
          </ConPermiso>
        </div>
      </div>

      <div className="mt-4">
        <RisksFilterBar filtros={filtros} onChange={setFiltros} />
      </div>

      {isLoading && <p className="mt-4 text-sm text-muted">Cargando riesgos...</p>}
      {isError && <p className="mt-4 text-sm text-red-600">No se pudieron cargar los riesgos.</p>}
      {riesgos && (
        <div className="mt-4">
          <RisksTable riesgos={riesgos} />
        </div>
      )}
    </main>
  );
}
