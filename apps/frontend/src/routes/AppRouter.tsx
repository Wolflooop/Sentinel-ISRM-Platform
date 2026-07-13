import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { AssetsListPage } from "../features/assets/pages/AssetsListPage";
import { CreateAssetPage } from "../features/assets/pages/CreateAssetPage";
import { EditAssetPage } from "../features/assets/pages/EditAssetPage";
import { ThreatsListPage } from "../features/threats/pages/ThreatsListPage";
import { CreateThreatPage } from "../features/threats/pages/CreateThreatPage";
import { EditThreatPage } from "../features/threats/pages/EditThreatPage";
import { VulnerabilitiesListPage } from "../features/vulnerabilities/pages/VulnerabilitiesListPage";
import { RisksListPage } from "../features/risks/pages/RisksListPage";
import { CreateRiskPage } from "../features/risks/pages/CreateRiskPage";
import { RiskDetailPage } from "../features/risks/pages/RiskDetailPage";
import { EvaluationCreatePage } from "../features/evaluations/pages/EvaluationCreatePage";
import { EvaluationHistoryPage } from "../features/evaluations/pages/EvaluationHistoryPage";
import { CreateVulnerabilityPage } from "../features/vulnerabilities/pages/CreateVulnerabilityPage";
import { EditVulnerabilityPage } from "../features/vulnerabilities/pages/EditVulnerabilityPage";

/**
 * Enrutador raíz de la aplicación.
 *
 * La ruta raíz no renderiza un componente estático: actúa como despachador
 * según el estado de autenticación (ver RootRedirect).
 */

// Ajustar aquí si el proyecto usa otra key de storage o un AuthContext propio.
// Esta comprobación es de solo lectura: no modifica lógica de autenticación.
const AUTH_TOKEN_KEY = "token";
const HOME_ROUTE = "/riesgos"; // módulo principal post-login

function isAuthenticated(): boolean {
  return Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
}

function RootRedirect() {
  return isAuthenticated()
    ? <Navigate to={HOME_ROUTE} replace />
    : <Navigate to="/login" replace />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
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

        <Route path="/activos" element={<AssetsListPage />} />
        <Route path="/activos/nuevo" element={<CreateAssetPage />} />
        <Route path="/activos/:id/editar" element={<EditAssetPage />} />

        <Route path="/amenazas" element={<ThreatsListPage />} />
        <Route path="/amenazas/nueva" element={<CreateThreatPage />} />
        <Route path="/amenazas/:id/editar" element={<EditThreatPage />} />

        <Route path="/vulnerabilidades" element={<VulnerabilitiesListPage />} />
        <Route path="/vulnerabilidades/nueva" element={<CreateVulnerabilityPage />} />
        <Route path="/vulnerabilidades/:id/editar" element={<EditVulnerabilityPage />} />

        <Route path="/riesgos" element={<RisksListPage />} />
        <Route path="/riesgos/nuevo" element={<CreateRiskPage />} />
        <Route path="/riesgos/:id" element={<RiskDetailPage />} />
        <Route path="/riesgos/:riesgoId/evaluaciones/nueva" element={<EvaluationCreatePage />} />
        <Route path="/riesgos/:riesgoId/evaluaciones" element={<EvaluationHistoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}