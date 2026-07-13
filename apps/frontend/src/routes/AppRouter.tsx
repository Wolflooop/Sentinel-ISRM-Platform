import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { UsersListPage } from "../features/users/pages/UsersListPage";
import { CreateUserPage } from "../features/users/pages/CreateUserPage";
import { EditUserPage } from "../features/users/pages/EditUserPage";
import { RolesListPage } from "../features/roles/pages/RolesListPage";
import { RolDetailPage } from "../features/roles/pages/RolDetailPage";
import { OrganizationSettingsPage } from "../features/organizations/pages/OrganizationSettingsPage";
import { ContextListPage } from "../features/context/pages/ContextListPage";
import { CreateContextPage } from "../features/context/pages/CreateContextPage";
import { ContextDetailPage } from "../features/context/pages/ContextDetailPage";

/**
 * Enrutador raíz de la aplicación.
 *
 * Fase 5 — Contexto ISO: se agregan las rutas de listado, creación y
 * detalle (edición, escalas, matriz y activación) del Contexto ISO.
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PlaceholderHome />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/usuarios" element={<UsersListPage />} />
        <Route path="/usuarios/nuevo" element={<CreateUserPage />} />
        <Route path="/usuarios/:id/editar" element={<EditUserPage />} />

        <Route path="/roles" element={<RolesListPage />} />
        <Route path="/roles/:id" element={<RolDetailPage />} />

        <Route path="/organizacion" element={<OrganizationSettingsPage />} />

        <Route path="/contexto" element={<ContextListPage />} />
        <Route path="/contexto/nuevo" element={<CreateContextPage />} />
        <Route path="/contexto/:id" element={<ContextDetailPage />} />
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
