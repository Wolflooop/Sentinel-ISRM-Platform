import { Link } from "react-router-dom";
import { useContextos } from "../hooks/useContext";

export function ContextListPage() {
  const { data: contextos, isLoading, isError } = useContextos();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-ink">Contexto ISO</h1>
        <Link
          to="/contexto/nuevo"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary"
        >
          Nuevo contexto
        </Link>
      </div>

      {isLoading && <p className="mt-4 text-sm text-muted">Cargando contextos...</p>}
      {isError && (
        <p className="mt-4 text-sm text-red-600">No se pudieron cargar los contextos.</p>
      )}

      {contextos && (
        <table className="mt-4 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="py-2 pr-4">Alcance</th>
              <th className="py-2 pr-4">Estado</th>
              <th className="py-2 pr-4">Creado</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {contextos.map((contexto) => (
              <tr key={contexto.id} className="border-b border-border">
                <td className="max-w-xs truncate py-2 pr-4 text-ink">{contexto.alcance}</td>
                <td className="py-2 pr-4">
                  <span
                    className={
                      contexto.activo
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800"
                        : "rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                    }
                  >
                    {contexto.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="py-2 pr-4 text-muted">
                  {new Date(contexto.creadoEn).toLocaleDateString()}
                </td>
                <td className="py-2 pr-4">
                  <Link to={`/contexto/${contexto.id}`} className="text-ink underline">
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
            {contextos.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-sm text-muted">
                  Aún no se ha creado ningún contexto.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </main>
  );
}
