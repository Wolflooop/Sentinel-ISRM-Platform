import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { hasValidSession } from "../lib/authSession";
import { tokenStorage } from "../lib/tokenStorage";

type EstadoSesion = "verificando" | "autenticado" | "no-autenticado";

/**
 * Guard de rutas privadas.
 *
 * Se monta como elemento padre de todas las rutas internas en AppRouter
 * (dashboard, activos, riesgos, etc.). No implementa lógica de auth propia:
 * delega por completo en `hasValidSession()` (lib/authSession.ts), que a su
 * vez usa `tokenStorage` como única fuente de verdad — igual que el resto de
 * la aplicación.
 *
 * La verificación es local/síncrona (no hay endpoint /me en el backend),
 * pero se resuelve dentro de un efecto para garantizar que nunca se
 * renderiza contenido protegido en el mismo ciclo en que aún no se ha
 * confirmado la sesión, y para dejar preparado el punto de extensión si en
 * el futuro se agrega una validación contra el servidor.
 *
 * Si el token está ausente o vencido, se limpia el estado local antes de
 * redirigir — nunca se deja una sesión a medias ni se muestra una pantalla
 * interna vacía o parcial.
 */
export function ProtectedRoute() {
  const [estado, setEstado] = useState<EstadoSesion>("verificando");

  useEffect(() => {
    if (hasValidSession()) {
      setEstado("autenticado");
      return;
    }

    // Sesión ausente o vencida: se limpia cualquier resto de estado local
    // (p. ej. un token expirado que seguía en localStorage) antes de
    // redirigir, para no dejar datos temporales huérfanos.
    tokenStorage.clear();
    setEstado("no-autenticado");
  }, []);

  if (estado === "verificando") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Verificando sesión...</p>
      </div>
    );
  }

  if (estado === "no-autenticado") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
