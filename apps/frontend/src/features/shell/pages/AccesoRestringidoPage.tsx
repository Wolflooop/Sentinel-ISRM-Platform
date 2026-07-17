import { Link } from "react-router-dom";
import { ShieldOff } from "lucide-react";


export function AccesoRestringidoPage() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <ShieldOff className="h-10 w-10 text-muted" strokeWidth={1.5} />
      <h1 className="mt-4 text-lg font-semibold text-ink">Acceso restringido</h1>
      <p className="mt-1 max-w-sm text-sm text-muted">
        Tu rol no tiene permiso para ver esta sección. Si crees que esto es un error, contacta
        al administrador de tu organización.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary-hover"
      >
        Volver al dashboard
      </Link>
    </main>
  );
}
