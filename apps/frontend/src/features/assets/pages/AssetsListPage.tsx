import { useState } from "react";
import { Link } from "react-router-dom";
import { useActivos } from "../hooks/useAssets";
import { AssetsTable } from "../components/AssetsTable";
import { AssetsFilterBar } from "../components/AssetsFilterBar";
import { FiltrosActivos } from "../types/assets.types";
import { ConPermiso } from "../../../components/ConPermiso";

export function AssetsListPage() {
  const [filtros, setFiltros] = useState<FiltrosActivos>({});
  const { data: activos, isLoading, isError } = useActivos(filtros);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-ink">Activos</h1>
        <ConPermiso recurso="activos" accion="crear">
          <Link
            to="/activos/nuevo"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary"
          >
            Nuevo activo
          </Link>
        </ConPermiso>
      </div>

      <div className="mt-4">
        <AssetsFilterBar filtros={filtros} onChange={setFiltros} />
      </div>

      {isLoading && <p className="mt-4 text-sm text-muted">Cargando activos...</p>}
      {isError && <p className="mt-4 text-sm text-red-600">No se pudieron cargar los activos.</p>}
      {activos && (
        <div className="mt-4">
          <AssetsTable activos={activos} />
        </div>
      )}
    </main>
  );
}
