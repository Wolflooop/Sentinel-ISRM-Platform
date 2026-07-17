import { useState } from "react";
import { useControles } from "../hooks/useControls";
import { ControlsTable } from "../components/ControlsTable";
import { ControlsFilterBar } from "../components/ControlsFilterBar";
import { FiltrosControles } from "../types/controls.types";
import { Link } from "react-router-dom";

export function ControlsListPage() {
  const [filtros, setFiltros] = useState<FiltrosControles>({});
  
  const { data: controles, isLoading, isError } = useControles(filtros);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Controles</h1>
          <p className="mt-1 text-sm text-slate-500">
            Consulta y actualiza el estado de implementación de los controles del programa de seguridad.
          </p>
        </div>
        <Link
          to="/controles/nuevo"
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white"
        >
          Nuevo control
        </Link>
      </div>

      <div className="mt-5">
        <ControlsFilterBar filtros={filtros} onChange={setFiltros} />
      </div>

      {isLoading && <p className="mt-4 text-sm text-slate-500">Cargando controles...</p>}
      {isError && <p className="mt-4 text-sm text-red-600">No se pudieron cargar los controles.</p>}
      {controles && (
        <div className="mt-4">
          <ControlsTable controles={controles} />
        </div>
      )}
    </main>
  );
}
