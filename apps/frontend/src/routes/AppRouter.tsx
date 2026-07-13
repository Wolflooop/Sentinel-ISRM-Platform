import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { UsersListPage } from "../features/users/pages/UsersListPage";
import { CreateUserPage } from "../features/users/pages/CreateUserPage";
import { EditUserPage } from "../features/users/pages/EditUserPage";
import { RolesListPage } from "../features/roles/pages/RolesListPage";
import { RolDetailPage } from "../features/roles/pages/RolDetailPage";

/**
 * Enrutador raíz de la aplicación.
 *
 * Fase 3 — Usuarios, Roles y Permisos: se agregan las rutas de gestión de
 * usuarios y roles. La gestión de permisos no tiene rutas propias — se
 * accede desde el detalle de un rol (`/roles/:id`), sin crear un módulo de
 * frontend independiente para "permissions".
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
