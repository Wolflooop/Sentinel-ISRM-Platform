import { useState } from "react";
import { Link } from "react-router-dom";
import { useAmenazas } from "../hooks/useThreats";
import { ThreatsTable } from "../components/ThreatsTable";
import { ThreatsFilterBar } from "../components/ThreatsFilterBar";
import { FiltrosAmenazas } from "../types/threats.types";

export function ThreatsListPage() {
  const [filtros, setFiltros] = useState<FiltrosAmenazas>({});
  const { data: amenazas, isLoading, isError } = useAmenazas(filtros);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-800">Amenazas</h1>
        <Link
          to="/amenazas/nueva"
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white"
        >
          Nueva amenaza
        </Link>
      </div>

      <div className="mt-4">
        <ThreatsFilterBar filtros={filtros} onChange={setFiltros} />
      </div>

      {isLoading && <p className="mt-4 text-sm text-slate-500">Cargando amenazas...</p>}
      {isError && <p className="mt-4 text-sm text-red-600">No se pudieron cargar las amenazas.</p>}
      {amenazas && (
        <div className="mt-4">
          <ThreatsTable amenazas={amenazas} />
        </div>
      )}
    </main>
  );
}
