import { useSecurityEvents } from "../hooks/useSecurityEvents";
import { SecurityEventsTable } from "../components/SecurityEventsTable";

export function SecurityEventsListPage() {
  const { data: eventos, isLoading, isError } = useSecurityEvents();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div>
        <h1 className="text-lg font-semibold text-ink">Eventos de seguridad</h1>
        <p className="mt-1 text-sm text-muted">
          Registro de eventos relacionados con autenticación y control de acceso: inicios de
          sesión, accesos rechazados y sesiones expiradas.
        </p>
      </div>

      <div className="mt-5">
        {isLoading && <p className="mt-4 text-sm text-muted">Cargando eventos de seguridad...</p>}
        {isError && (
          <p className="mt-4 text-sm text-red-600">
            No se pudieron cargar los eventos de seguridad.
          </p>
        )}
        {eventos && <SecurityEventsTable eventos={eventos} />}
      </div>
    </main>
  );
}
