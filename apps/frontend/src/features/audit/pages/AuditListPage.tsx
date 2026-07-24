import { useAuditRecords } from "../hooks/useAudit";
import { AuditTable } from "../components/AuditTable";

export function AuditListPage() {
  const { data: registros, isLoading, isError } = useAuditRecords();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div>
        <h1 className="text-lg font-semibold text-ink">Auditoría</h1>
        <p className="mt-1 text-sm text-muted">
          Historial de cambios registrados en el sistema: quién los realizó, cuándo y sobre qué
          entidad.
        </p>
      </div>

      <div className="mt-5">
        {isLoading && <p className="mt-4 text-sm text-muted">Cargando auditoría...</p>}
        {isError && (
          <p className="mt-4 text-sm text-red-600">
            No se pudieron cargar los registros de auditoría.
          </p>
        )}
        {registros && <AuditTable registros={registros} />}
      </div>
    </main>
  );
}
