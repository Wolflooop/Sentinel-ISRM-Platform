import { BrowserRouter, Routes, Route } from "react-router-dom";

/**
 * Enrutador raíz de la aplicación.
 *
 * Fase 1 — Infraestructura base: solo existe una ruta placeholder para
 * verificar que Router, Tailwind y el resto del bootstrap funcionan. Las
 * rutas funcionales (login, dashboard, activos, riesgos, etc.) se agregan en
 * sus fases correspondientes, montadas dentro de los layouts que se definan
 * en `src/layouts/`.
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PlaceholderHome />} />
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
