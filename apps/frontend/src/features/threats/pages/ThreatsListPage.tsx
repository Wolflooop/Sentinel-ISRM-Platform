import { useState } from "react";
import { Link } from "react-router-dom";
import { useAmenazas } from "../hooks/useThreats";
import { ThreatsTable } from "../components/ThreatsTable";
import { ThreatsFilterBar } from "../components/ThreatsFilterBar";
import { FiltrosAmenazas } from "../types/threats.types";
import { ConPermiso } from "../../../components/ConPermiso";

export function ThreatsListPage() {
  const [filtros, setFiltros] = useState<FiltrosAmenazas>({});
  const { data: amenazas, isLoading, isError } = useAmenazas(filtros);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-ink">Amenazas</h1>
        <ConPermiso recurso="amenazas" accion="crear">
          <Link
            to="/amenazas/nueva"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary"
          >
            Nueva amenaza
          </Link>
        </ConPermiso>
      </div>

      <div className="mt-4">
        <ThreatsFilterBar filtros={filtros} onChange={setFiltros} />
      </div>

      {isLoading && <p className="mt-4 text-sm text-muted">Cargando amenazas...</p>}
      {isError && <p className="mt-4 text-sm text-red-600">No se pudieron cargar las amenazas.</p>}
      {amenazas && (
        <div className="mt-4">
          <ThreatsTable amenazas={amenazas} />
        </div>
      )}
    </main>
  );
}
