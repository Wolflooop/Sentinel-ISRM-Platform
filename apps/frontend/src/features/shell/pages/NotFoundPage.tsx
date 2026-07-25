import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { hasValidSession } from "../../../lib/authSession";

export function NotFoundPage() {
  const destino = hasValidSession() ? "/dashboard" : "/login";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Compass className="h-10 w-10 text-muted" strokeWidth={1.5} />
      <h1 className="mt-4 text-3xl font-semibold text-ink">404</h1>
      <p className="mt-1 text-lg font-medium text-ink">Página no encontrada</p>
      <p className="mt-1 max-w-sm text-sm text-muted">
        La dirección a la que intentas acceder no existe o fue movida.
      </p>
      <Link
        to={destino}
        className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary-hover"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
