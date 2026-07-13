import { useState } from "react";
import { Link } from "react-router-dom";
import { useVulnerabilidades } from "../hooks/useVulnerabilities";
import { VulnerabilitiesTable } from "../components/VulnerabilitiesTable";
import { VulnerabilitiesFilterBar } from "../components/VulnerabilitiesFilterBar";
import { FiltrosVulnerabilidades } from "../types/vulnerabilities.types";

export function VulnerabilitiesListPage() {
  const [filtros, setFiltros] = useState<FiltrosVulnerabilidades>({});
  const { data: vulnerabilidades, isLoading, isError } = useVulnerabilidades(filtros);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-800">Vulnerabilidades</h1>
        <Link
          to="/vulnerabilidades/nueva"
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white"
        >
          Nueva vulnerabilidad
        </Link>
      </div>

      <div className="mt-4">
        <VulnerabilitiesFilterBar filtros={filtros} onChange={setFiltros} />
      </div>

      {isLoading && <p className="mt-4 text-sm text-slate-500">Cargando vulnerabilidades...</p>}
      {isError && (
        <p className="mt-4 text-sm text-red-600">No se pudieron cargar las vulnerabilidades.</p>
      )}
      {vulnerabilidades && (
        <div className="mt-4">
          <VulnerabilitiesTable vulnerabilidades={vulnerabilidades} />
        </div>
      )}
    </main>
  );
}
