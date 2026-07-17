import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { hasValidSession } from "../lib/authSession";
import { tokenStorage } from "../lib/tokenStorage";

type EstadoSesion = "verificando" | "autenticado" | "no-autenticado";


export function ProtectedRoute() {
  const [estado, setEstado] = useState<EstadoSesion>("verificando");

  useEffect(() => {
    if (hasValidSession()) {
      setEstado("autenticado");
      return;
    }

  
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
