import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "../features/auth/pages/LoginPage";

/**
 * Enrutador raíz de la aplicación.
 *
 * Fase 2 — Autenticación: se agrega la ruta pública `/login`. El resto de
 * rutas funcionales (dashboard, activos, riesgos, etc.) se agregan en sus
 * fases correspondientes, montadas dentro de los layouts que se definan en
 * `src/layouts/`.
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PlaceholderHome />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

function PlaceholderHome() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-slate-800">
          Sentinel ISRM Platform
        </h1>
        <p className="mt-2 text-slate-500">
          Infraestructura base — Fase 1. Módulos funcionales aún no implementados.
        </p>
      </div>
    </main>
  );
}
